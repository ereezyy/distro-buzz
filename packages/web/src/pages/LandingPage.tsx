import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { useLocation } from "wouter";

// No purple anywhere. Palette: #00ff88 (green), #00ffff (cyan), #ffbb00 (amber), #ff4444 (red), #FF5500 (orange)

// ─── Platform data ────────────────────────────────────────────────────────────

const PLATFORMS = [
  { name: "Spotify",    color: "#1DB954", icon: "S"  },
  { name: "Apple",      color: "#FC3C44", icon: "A"  },
  { name: "YouTube",    color: "#FF0000", icon: "YT" },
  { name: "TikTok",     color: "#69C9D0", icon: "TT" },
  { name: "SoundCloud", color: "#FF5500", icon: "SC" },
  { name: "Amazon",     color: "#FF9900", icon: "AM" },
  { name: "Deezer",     color: "#00C7B1", icon: "DZ" },
  { name: "Tidal",      color: "#00E8FF", icon: "TD" },
  { name: "Bandcamp",   color: "#1DA0C3", icon: "BC" },
  { name: "Pandora",    color: "#00A0EE", icon: "PN" },
  { name: "iHeart",     color: "#C6002B", icon: "IH" },
  { name: "Audiomack",  color: "#FFA500", icon: "AU" },
];

// ─── Mouse tracking ───────────────────────────────────────────────────────────

function useMouse() {
  const mouse = useRef({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouse.current.x = e.clientX / window.innerWidth;
      mouse.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return mouse;
}

// ─── Hero Canvas — orbit IS the hero background ───────────────────────────────

interface Packet {
  platformIdx: number;
  progress: number;
  speed: number;
  sz: number;
}

function HeroCanvas({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let t = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const packets: Packet[] = [];
    const bursts: { platformIdx: number; ttl: number; x: number; y: number }[] = [];
    let pktTimer = 0;

    const spawn = () => {
      packets.push({
        platformIdx: Math.floor(Math.random() * PLATFORMS.length),
        progress: 0,
        speed: 0.008 + Math.random() * 0.009,
        sz: 2.5 + Math.random() * 3,
      });
    };

    const draw = () => {
      t += 1;
      pktTimer++;
      if (pktTimer >= 35) {
        spawn();
        if (Math.random() < 0.45) spawn();
        pktTimer = 0;
      }

      const W = window.innerWidth;
      const H = window.innerHeight;

      // Mouse-offset center
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const cx = W / 2 + (mx - 0.5) * W * 0.04;
      const cy = H / 2 + (my - 0.5) * H * 0.04;

      ctx.clearRect(0, 0, W, H);

      // ── Deep space background ──
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.8);
      bg.addColorStop(0, "#0a1628");
      bg.addColorStop(0.4, "#050c18");
      bg.addColorStop(1, "#020508");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ── Starfield ──
      ctx.save();
      for (let s = 0; s < 120; s++) {
        const sx = ((s * 137.5 + t * 0.1) % W);
        const sy = ((s * 97.3 + t * 0.05) % H);
        const sr = 0.4 + (s % 3) * 0.3;
        const sa = 0.2 + 0.5 * Math.abs(Math.sin(s * 0.7 + t * 0.02));
        ctx.fillStyle = `rgba(255,255,255,${sa})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ── Scanlines overlay ──
      ctx.save();
      for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = "rgba(0,0,0,0.08)";
        ctx.fillRect(0, y, W, 1);
      }
      ctx.restore();

      // ── Orbit rings ──
      const minDim = Math.min(W, H);
      const rings = [
        { r: minDim * 0.18, count: 4,  speed:  0.005, startIdx: 0  },
        { r: minDim * 0.29, count: 4,  speed: -0.003, startIdx: 4  },
        { r: minDim * 0.39, count: 4,  speed:  0.0025,startIdx: 8  },
      ];

      const platformPos: { x: number; y: number }[] = PLATFORMS.map(() => ({ x: 0, y: 0 }));
      let pIdx = 0;
      rings.forEach((ring) => {
        for (let i = 0; i < ring.count; i++) {
          const angle = (i / ring.count) * Math.PI * 2 + t * ring.speed;
          platformPos[pIdx].x = cx + Math.cos(angle) * ring.r;
          platformPos[pIdx].y = cy + Math.sin(angle) * ring.r;
          pIdx++;
        }
      });

      // Ring tracks
      rings.forEach((ring, ri) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,255,136,${0.06 - ri * 0.012})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 10]);
        ctx.stroke();
        ctx.restore();
      });

      // Center → platform lines
      PLATFORMS.forEach((p, i) => {
        const { x, y } = platformPos[i];
        const grad = ctx.createLinearGradient(cx, cy, x, y);
        grad.addColorStop(0, `${p.color}33`);
        grad.addColorStop(1, `${p.color}05`);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      });

      // Same-ring cross links
      rings.forEach((ring, ri) => {
        const start = ri === 0 ? 0 : ri === 1 ? 4 : 8;
        for (let i = 0; i < ring.count; i++) {
          const a = start + i;
          const b = start + (i + 1) % ring.count;
          ctx.beginPath();
          ctx.moveTo(platformPos[a].x, platformPos[a].y);
          ctx.lineTo(platformPos[b].x, platformPos[b].y);
          ctx.strokeStyle = `${PLATFORMS[a].color}12`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      // ── Packets ──
      for (let i = packets.length - 1; i >= 0; i--) {
        const pkt = packets[i];
        pkt.progress += pkt.speed;
        if (pkt.progress >= 1) {
          const { x, y } = platformPos[pkt.platformIdx];
          bursts.push({ platformIdx: pkt.platformIdx, ttl: 28, x, y });
          packets.splice(i, 1);
          continue;
        }
        const tgt = platformPos[pkt.platformIdx];
        const px = cx + (tgt.x - cx) * pkt.progress;
        const py = cy + (tgt.y - cy) * pkt.progress;
        const pc = PLATFORMS[pkt.platformIdx].color;

        const trail = ctx.createRadialGradient(px, py, 0, px, py, pkt.sz * 3.5);
        trail.addColorStop(0, `${pc}dd`);
        trail.addColorStop(1, `${pc}00`);
        ctx.fillStyle = trail;
        ctx.beginPath();
        ctx.arc(px, py, pkt.sz * 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(px, py, pkt.sz * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Burst rings ──
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.ttl--;
        if (b.ttl <= 0) { bursts.splice(i, 1); continue; }
        const progress = 1 - b.ttl / 28;
        const pc = PLATFORMS[b.platformIdx].color;
        const br = 14 + progress * 32;
        const alpha = b.ttl / 28;
        ctx.beginPath();
        ctx.arc(b.x, b.y, br, 0, Math.PI * 2);
        ctx.strokeStyle = `${pc}${Math.floor(alpha * 200).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ── Platform nodes ──
      PLATFORMS.forEach((p, i) => {
        const { x, y } = platformPos[i];
        const lit = bursts.some((b) => b.platformIdx === i);
        const nr = 13;

        // Glow
        const gr = ctx.createRadialGradient(x, y, 0, x, y, lit ? 30 : 22);
        gr.addColorStop(0, `${p.color}${lit ? "66" : "33"}`);
        gr.addColorStop(1, `${p.color}00`);
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(x, y, lit ? 30 : 22, 0, Math.PI * 2);
        ctx.fill();

        // Circle
        ctx.beginPath();
        ctx.arc(x, y, nr, 0, Math.PI * 2);
        ctx.fillStyle = lit ? p.color : `${p.color}1a`;
        ctx.fill();
        ctx.strokeStyle = `${p.color}${lit ? "ff" : "88"}`;
        ctx.lineWidth = lit ? 2 : 1;
        ctx.stroke();

        // Icon
        ctx.fillStyle = lit ? "#000" : `${p.color}dd`;
        ctx.font = `bold ${p.icon.length > 1 ? "6.5" : "8.5"}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.icon, x, y);

        // Label
        ctx.fillStyle = `${p.color}88`;
        ctx.font = "6.5px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(p.name.toUpperCase(), x, y + nr + 4);
      });

      // ── Center core ──
      const pulse = 1 + 0.18 * Math.sin(t * 0.05);
      const cr = minDim * 0.048 * pulse;

      const corona = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr * 3);
      corona.addColorStop(0, "rgba(0,255,136,0.18)");
      corona.addColorStop(0.5, "rgba(0,255,136,0.04)");
      corona.addColorStop(1, "rgba(0,255,136,0)");
      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(cx, cy, cr * 3, 0, Math.PI * 2);
      ctx.fill();

      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      cg.addColorStop(0, "#00ff88");
      cg.addColorStop(0.6, "rgba(0,255,136,0.8)");
      cg.addColorStop(1, "rgba(0,180,80,0.3)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,255,136,0.95)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#000";
      ctx.font = `bold ${Math.floor(cr * 0.6)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚡", cx, cy);

      // ── Waveform strip at bottom ──
      const barCount = 80;
      const barW = W / barCount;
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < barCount; i++) {
        const ph = (i / barCount) * Math.PI * 6;
        const bh = 15 + 45 * Math.abs(
          Math.sin(ph + t * 0.035) * Math.cos(ph * 0.6 + t * 0.02)
        );
        // Green to cyan sweep — no purple
        const hue = 160 + (i / barCount) * 30;
        ctx.fillStyle = `hsla(${hue},100%,55%,${0.25 + 0.5 * (bh / 60)})`;
        ctx.fillRect(i * barW + 0.5, H - bh, barW - 1, bh);
      }
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [mouse]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}

// ─── Live terminal feed ───────────────────────────────────────────────────────

const FEED_EVENTS: Array<(p: string, c: string) => ReactNode> = [
  (p, c) => <><span style={{ color: "#00ff88" }}>DEPLOY</span> → <span style={{ color: c }}>{p}</span> · track live</>,
  (p, c) => <><span style={{ color: "#00ffff" }}>SYNC</span> → metadata pushed to <span style={{ color: c }}>{p}</span></>,
  (p, c) => <><span style={{ color: "#ffbb00" }}>QUEUE</span> → <span style={{ color: c }}>{p}</span> · processing audio</>,
  (p, c) => <><span style={{ color: "#00ff88" }}>ACK</span> → <span style={{ color: c }}>{p}</span> · fingerprint matched</>,
  (p, c) => <><span style={{ color: "#FF5500" }}>RETRY</span> → <span style={{ color: c }}>{p}</span> · resolved in 2.1s</>,
  (p, c) => <><span style={{ color: "#00ff88" }}>LIVE</span> → <span style={{ color: c }}>{p}</span> · now streaming globally</>,
];

function LiveFeed() {
  const [lines, setLines] = useState<{ id: number; el: ReactNode; ts: string }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const spawn = () => {
      const p = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
      const tmpl = FEED_EVENTS[Math.floor(Math.random() * FEED_EVENTS.length)];
      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
      setLines((prev) => [{ id: idRef.current++, el: tmpl(p.name, p.color), ts }, ...prev].slice(0, 6));
    };
    spawn();
    const iv = setInterval(spawn, 1600);
    return () => clearInterval(iv);
  }, []);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: "rgba(2,5,12,0.85)", border: "1px solid rgba(0,255,136,0.12)", backdropFilter: "blur(12px)" }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ borderBottom: "1px solid rgba(0,255,136,0.08)", background: "rgba(0,255,136,0.03)" }}
      >
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28C840" }} />
        </div>
        <span className="ml-3 text-xs text-gray-500 font-mono tracking-widest">distrobuzz · engine · live</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="text-[10px] font-mono text-[#00ff88] tracking-widest">LIVE</span>
        </div>
      </div>
      <div className="px-4 py-3 space-y-2" style={{ minHeight: 140 }}>
        {lines.map((line, idx) => (
          <div
            key={line.id}
            className="flex items-center gap-3 text-xs font-mono transition-opacity duration-500"
            style={{ opacity: Math.max(0.15, 1 - idx * 0.14) }}
          >
            <span className="text-gray-600 flex-shrink-0 tabular-nums">{line.ts}</span>
            <span className="text-gray-300">{line.el}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────

function useReveal(threshold = 0.1) {
  const [v, setV] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, v };
}

// ─── Counter ─────────────────────────────────────────────────────────────────

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let n = 0;
      const step = target / 55;
      const tick = () => {
        n = Math.min(n + step, target);
        setVal(Math.floor(n));
        if (n < target) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [scrollY, setScrollY] = useState(0);
  const mouse = useMouse();

  const stats = useReveal();
  const feat = useReveal();
  const pricing = useReveal();

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navAlpha = Math.min(scrollY / 80, 1);

  return (
    <div className="relative text-white overflow-x-hidden" style={{ background: "#020508" }}>
      {/* Full-screen living canvas background */}
      <HeroCanvas mouse={mouse} />

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300"
        style={{
          background: `rgba(2,5,12,${navAlpha * 0.92})`,
          borderBottom: `1px solid rgba(0,255,136,${navAlpha * 0.12})`,
          backdropFilter: navAlpha > 0.1 ? "blur(16px)" : "none",
        }}
      >
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Zap className="w-5 h-5" style={{ color: "#00ff88" }} />
          <span className="font-black text-base tracking-[-0.04em]">DISTRO BUZZ</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/login")}
            className="text-sm text-gray-400 hover:text-white px-4 py-2 transition-colors font-mono"
          >
            SIGN IN
          </button>
          <button
            onClick={() => setLocation("/signup")}
            className="text-sm font-black px-5 py-2 rounded transition-all hover:scale-105 active:scale-95"
            style={{ background: "#00ff88", color: "#000", boxShadow: "0 0 18px rgba(0,255,136,0.45)", letterSpacing: "-0.02em" }}
          >
            GET STARTED
          </button>
        </div>
      </nav>

      {/* ── HERO — orbit is the background, text floats over ── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6" style={{ paddingTop: 80 }}>
        {/* Text block — centered, minimal, floats over canvas */}
        <div className="text-center max-w-3xl mx-auto animate-hero-in">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-widest mb-8 uppercase"
            style={{ border: "1px solid rgba(0,255,136,0.25)", background: "rgba(0,255,136,0.04)", color: "#00ff88" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            Autonomous Distribution Engine · Active
          </div>

          <h1
            className="font-black leading-none mb-5"
            style={{ fontSize: "clamp(3.2rem, 9vw, 6.5rem)", letterSpacing: "-0.05em" }}
          >
            <span className="block">Drop Once.</span>
            <span
              className="block"
              style={{
                background: "linear-gradient(90deg, #00ff88 0%, #00ffff 40%, #ffbb00 70%, #00ff88 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradient-shift 5s linear infinite",
              }}
            >
              Hit Everywhere.
            </span>
          </h1>

          <p className="text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed" style={{ fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)" }}>
            One upload detonates across{" "}
            <span className="text-white font-semibold">50+ platforms simultaneously</span>.
            No label. No gatekeepers. No ceiling.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setLocation("/signup")}
              className="group inline-flex items-center justify-center gap-2 font-black px-8 py-4 rounded-lg text-black transition-all hover:scale-105 active:scale-95"
              style={{ background: "#00ff88", boxShadow: "0 0 32px rgba(0,255,136,0.55)", fontSize: "1rem", letterSpacing: "-0.02em" }}
            >
              START FREE TRIAL
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setLocation("/platforms")}
              className="inline-flex items-center justify-center font-bold px-8 py-4 rounded-lg transition-all hover:scale-105"
              style={{ border: "1px solid rgba(0,255,255,0.25)", color: "#00ffff", background: "rgba(0,255,255,0.04)", fontSize: "0.9rem" }}
            >
              SEE ALL PLATFORMS
            </button>
          </div>

          <p className="text-gray-600 text-[10px] mt-5 font-mono tracking-[0.2em]">
            NO CARD REQUIRED · 14-DAY TRIAL · CANCEL ANYTIME
          </p>
        </div>

        {/* Terminal feed — anchored bottom center over the orbit */}
        <div className="w-full max-w-lg mx-auto mt-16">
          <LiveFeed />
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce-slow">
          <div className="w-px h-10 bg-gradient-to-b from-[#00ff88] to-transparent" />
        </div>
      </section>

      {/* ── STATS — thin band ── */}
      <section
        ref={stats.ref as React.RefObject<HTMLElement>}
        className={`relative z-10 py-16 px-6 transition-all duration-700 ${stats.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(0,255,136,0.07)", borderBottom: "1px solid rgba(0,255,136,0.07)" }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x" style={{ borderColor: "rgba(0,255,136,0.12)" }}>
          {[
            { n: 50000, s: "+", label: "Artists", color: "#00ff88" },
            { n: 2000000, s: "+", label: "Tracks Sent", color: "#00ffff" },
            { n: 50, s: "+", label: "Platforms", color: "#ffbb00" },
          ].map((stat, i) => (
            <div key={i} className="text-center px-4 py-4" style={{ borderColor: "rgba(0,255,136,0.12)" }}>
              <div
                className="font-black mb-1 tabular-nums"
                style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.04em", color: stat.color }}
              >
                <Counter target={stat.n} suffix={stat.s} />
              </div>
              <div className="text-gray-500 text-xs font-mono tracking-[0.15em] uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES — control room aesthetic ── */}
      <section
        ref={feat.ref as React.RefObject<HTMLElement>}
        className={`relative z-10 py-24 px-6 transition-all duration-700 ${feat.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-[10px] font-mono text-[#00ff88] tracking-[0.3em] uppercase mb-3">System Capabilities</p>
            <h2 className="font-black" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", letterSpacing: "-0.04em" }}>
              Built for artists<br />who move fast.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "rgba(0,255,136,0.04)" }}>
            {[
              { n: "01", title: "50+ Platforms", body: "Spotify, Apple, YouTube, TikTok, SoundCloud, Bandcamp, Amazon, Deezer, Tidal — all simultaneously.", c: "#00ff88" },
              { n: "02", title: "Real-Time Status", body: "Watch every job, every platform, every retry. Live. No polling, no guessing.", c: "#00ffff" },
              { n: "03", title: "Smart Retry Engine", body: "7-layer fallback logic. Platforms reject? We fight back and keep retrying.", c: "#ffbb00" },
              { n: "04", title: "100% Ownership", body: "Your music, your data, your rights. We hold nothing. Zero vendor lock-in.", c: "#00ff88" },
              { n: "05", title: "AI Optimization", body: "Mood detection, genre tagging, auto-description. Maximum algorithmic reach.", c: "#00ffff" },
              { n: "06", title: "Open Source Core", body: "Full transparency. Audit the engine, fork it, run it yourself. Community-first.", c: "#ffbb00" },
            ].map((f, i) => (
              <div
                key={i}
                className="group p-8 cursor-default transition-all duration-200 hover:bg-white/[0.025]"
                style={{ background: "rgba(2,5,12,0.9)" }}
              >
                <div className="font-mono text-[10px] font-bold tracking-widest mb-4" style={{ color: f.c }}>{f.n}</div>
                <h3
                  className="font-bold text-lg mb-2 transition-colors duration-200"
                  style={{ color: "#e8e8e8" }}
                >
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.body}</p>
                <div
                  className="mt-4 h-px w-0 group-hover:w-full transition-all duration-300 rounded"
                  style={{ background: f.c }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        ref={pricing.ref as React.RefObject<HTMLElement>}
        className={`relative z-10 py-24 px-6 transition-all duration-700 ${pricing.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-[10px] font-mono text-[#00ff88] tracking-[0.3em] uppercase mb-3">Pricing</p>
            <h2 className="font-black" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", letterSpacing: "-0.04em" }}>
              Transparent.<br />No cuts. No BS.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "STARTER", price: "$9.99", period: "/mo",
                desc: "Solo artists, just launching",
                features: ["1 artist profile", "Basic distribution", "50+ platforms", "Email support"],
                accent: "#00ffff", featured: false,
              },
              {
                name: "PRO", price: "$24.99", period: "/mo",
                desc: "Serious musicians scaling up",
                features: ["Unlimited distribution", "AI metadata", "Video generation", "Priority support", "Analytics"],
                accent: "#00ff88", featured: true,
              },
              {
                name: "LABEL", price: "$99.99", period: "/mo",
                desc: "Labels and artist teams",
                features: ["Multiple artists", "API access", "White-label", "Ad placement", "Dedicated support"],
                accent: "#ffbb00", featured: false,
              },
            ].map((tier, i) => (
              <div
                key={i}
                className={`relative p-7 rounded-lg transition-all duration-300 hover:-translate-y-1 ${tier.featured ? "scale-[1.03]" : ""}`}
                style={{
                  background: tier.featured ? "rgba(0,255,136,0.05)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${tier.featured ? "rgba(0,255,136,0.35)" : "rgba(255,255,255,0.05)"}`,
                  boxShadow: tier.featured ? "0 0 40px rgba(0,255,136,0.08)" : "none",
                }}
              >
                {tier.featured && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest"
                    style={{ background: "#00ff88", color: "#000" }}
                  >
                    MOST POPULAR
                  </div>
                )}
                <div className="font-mono text-[10px] font-bold tracking-[0.2em] mb-3" style={{ color: tier.accent }}>
                  {tier.name}
                </div>
                <div className="mb-1 flex items-end gap-1">
                  <span className="font-black" style={{ fontSize: "2.4rem", letterSpacing: "-0.04em", lineHeight: 1 }}>{tier.price}</span>
                  <span className="text-gray-500 text-sm pb-1">{tier.period}</span>
                </div>
                <p className="text-gray-500 text-sm mb-5">{tier.desc}</p>
                <ul className="space-y-2.5 mb-7">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <span style={{ color: tier.accent }} className="text-xs">→</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setLocation("/signup")}
                  className="w-full py-2.5 rounded font-bold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: tier.featured ? tier.accent : "transparent",
                    color: tier.featured ? "#000" : tier.accent,
                    border: tier.featured ? "none" : `1px solid ${tier.accent}40`,
                  }}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative z-10 py-32 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-mono text-[#00ff88] tracking-[0.3em] uppercase mb-6">Ready?</p>
          <h2
            className="font-black mb-6"
            style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", letterSpacing: "-0.05em", lineHeight: 0.95 }}
          >
            Your music<br />deserves{" "}
            <span style={{ color: "#00ff88" }}>every stage.</span>
          </h2>
          <p className="text-gray-400 mb-8">
            Thousands of independent artists fire with us. Join them.
          </p>
          <button
            onClick={() => setLocation("/signup")}
            className="inline-flex items-center gap-3 font-black px-10 py-5 rounded-lg text-black text-base transition-all hover:scale-105 active:scale-95"
            style={{ background: "#00ff88", boxShadow: "0 0 50px rgba(0,255,136,0.45)", letterSpacing: "-0.02em" }}
          >
            LAUNCH YOUR MUSIC
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-gray-600 font-mono text-[10px] mt-5 tracking-[0.2em]">FREE TRIAL · NO CREDIT CARD · CANCEL ANYTIME</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 py-10 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: "#00ff88" }} />
            <span className="font-black text-sm tracking-[-0.04em]">DISTRO BUZZ</span>
          </div>
          <div className="flex gap-6 text-xs text-gray-500 font-mono tracking-widest">
            {[
              { label: "PLATFORMS", path: "/platforms" },
              { label: "API DOCS",  path: "/api-docs"  },
              { label: "PRICING",   path: "/pricing"   },
              { label: "SIGN UP",   path: "/signup"    },
            ].map((l) => (
              <button key={l.path} onClick={() => setLocation(l.path)} className="hover:text-white transition-colors">
                {l.label}
              </button>
            ))}
          </div>
          <p className="text-gray-600 text-[10px] font-mono tracking-widest">© 2026 DISTRO BUZZ</p>
        </div>
      </footer>
    </div>
  );
}
