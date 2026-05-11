import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { useLocation } from "wouter";

// ─── Waveform Canvas ──────────────────────────────────────────────────────────

function WaveformCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const waves = [
      { amp: 80, freq: 0.008, speed: 0.012, phase: 0, color: "rgba(0,255,136,0.15)", y: 0.45 },
      { amp: 55, freq: 0.012, speed: 0.018, phase: 2.1, color: "rgba(0,255,255,0.10)", y: 0.50 },
      { amp: 40, freq: 0.018, speed: 0.025, phase: 4.3, color: "rgba(255,187,0,0.08)", y: 0.55 },
      { amp: 100, freq: 0.005, speed: 0.008, phase: 1.2, color: "rgba(0,255,136,0.06)", y: 0.48 },
    ];

    // Floating orbs
    const orbs = Array.from({ length: 6 }, (_, i) => ({
      x: (i / 5) * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 80 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      hue: [150, 180, 45, 320, 170, 40][i],
    }));

    const draw = () => {
      timeRef.current += 1;
      const t = timeRef.current;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Deep background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#030510");
      bg.addColorStop(0.5, "#070d1a");
      bg.addColorStop(1, "#030510");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Floating glow orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.r) orb.x = W + orb.r;
        if (orb.x > W + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = H + orb.r;
        if (orb.y > H + orb.r) orb.y = -orb.r;

        const pulse = 1 + 0.15 * Math.sin(t * 0.02 + orb.hue);
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r * pulse);
        grad.addColorStop(0, `hsla(${orb.hue},100%,55%,0.07)`);
        grad.addColorStop(1, `hsla(${orb.hue},100%,55%,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r * pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      // Grid lines — subtle
      ctx.globalAlpha = 0.04;
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Waveforms
      waves.forEach((w, wi) => {
        ctx.beginPath();
        const baseY = H * w.y;
        for (let x = 0; x <= W; x += 2) {
          const harmonic1 = Math.sin(x * w.freq + t * w.speed + w.phase);
          const harmonic2 = Math.sin(x * w.freq * 2.3 + t * w.speed * 1.7 + w.phase) * 0.3;
          const harmonic3 = Math.sin(x * w.freq * 0.5 + t * w.speed * 0.6 + w.phase) * 0.5;
          const envelope = Math.sin((x / W) * Math.PI);
          const y = baseY + (harmonic1 + harmonic2 + harmonic3) * w.amp * envelope;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        // Glow stroke
        ctx.shadowBlur = 15 + wi * 5;
        ctx.shadowColor = wi === 0 ? "#00ff88" : wi === 1 ? "#00ffff" : "#ffbb00";
        ctx.strokeStyle = w.color.replace("0.15", String(0.3 + 0.1 * Math.sin(t * 0.03 + wi)));
        ctx.lineWidth = 1.5 - wi * 0.2;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Vertical frequency bars at bottom
      ctx.globalAlpha = 0.6;
      const barCount = 64;
      const barW = W / barCount;
      for (let i = 0; i < barCount; i++) {
        const phase = (i / barCount) * Math.PI * 4;
        const h = 20 + 60 * Math.abs(
          Math.sin(phase + t * 0.04) * Math.cos(phase * 0.7 + t * 0.025)
        );
        const hue = 150 + (i / barCount) * 50;
        const alpha = 0.3 + 0.4 * (h / 80);
        ctx.fillStyle = `hsla(${hue},100%,60%,${alpha})`;
        ctx.fillRect(i * barW + 1, H - h, barW - 2, h);
      }
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}

// ─── Glitch Text ──────────────────────────────────────────────────────────────

function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`glitch-text relative inline-block ${className}`} data-text={text}>
      {text}
    </span>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = target / 60;
      const tick = () => {
        start = Math.min(start + step, target);
        setVal(Math.floor(start));
        if (start < target) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─── Platform Orbit ───────────────────────────────────────────────────────────

const PLATFORMS = [
  { name: "Spotify",    color: "#1DB954", icon: "S"  },
  { name: "Apple",      color: "#FC3C44", icon: "A"  },
  { name: "YouTube",    color: "#FF0000", icon: "YT" },
  { name: "TikTok",     color: "#69C9D0", icon: "TT" },
  { name: "SoundCloud", color: "#FF5500", icon: "SC" },
  { name: "Amazon",     color: "#FF9900", icon: "AM" },
  { name: "Deezer",     color: "#9B59B6", icon: "DZ" },
  { name: "Tidal",      color: "#00FFFF", icon: "TD" },
  { name: "Bandcamp",   color: "#1DA0C3", icon: "BC" },
  { name: "Pandora",    color: "#3668FF", icon: "PN" },
  { name: "iHeart",     color: "#C6002B", icon: "IH" },
  { name: "Audiomack",  color: "#FFA500", icon: "AU" },
];

interface Packet {
  platformIdx: number;
  progress: number; // 0 = center, 1 = platform
  speed: number;
  size: number;
}

function PlatformOrbit({ size = 600 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);
    };
    resize();

    let t = 0;

    // Orbit layout: 3 rings
    const orbitConfig = [
      { r: size * 0.22, count: 4,  speed:  0.006, startIdx: 0  },
      { r: size * 0.34, count: 4,  speed: -0.004, startIdx: 4  },
      { r: size * 0.44, count: 4,  speed:  0.003, startIdx: 8  },
    ];

    // Travelling data packets (center → platform)
    const packets: Packet[] = [];
    let packetTimer = 0;

    // Burst events: platform flashes when a packet arrives
    const bursts: { platformIdx: number; ttl: number }[] = [];

    const spawnPacket = () => {
      packets.push({
        platformIdx: Math.floor(Math.random() * PLATFORMS.length),
        progress: 0,
        speed: 0.012 + Math.random() * 0.01,
        size: 3 + Math.random() * 3,
      });
    };

    const cx = size / 2, cy = size / 2;

    // Precompute platform positions (dynamic, updated each frame)
    const platformPos: { x: number; y: number; orbitR: number }[] = PLATFORMS.map(() => ({ x: 0, y: 0, orbitR: 0 }));

    const draw = () => {
      t += 1;
      packetTimer += 1;

      // Spawn a packet every ~40 frames
      if (packetTimer >= 40) {
        spawnPacket();
        if (Math.random() < 0.4) spawnPacket(); // occasional double burst
        packetTimer = 0;
      }

      ctx.clearRect(0, 0, size, size);

      // ── Background fill ──
      ctx.fillStyle = "rgba(3,5,16,0)";
      ctx.fillRect(0, 0, size, size);

      // ── Update platform positions ──
      let pIdx = 0;
      orbitConfig.forEach((ring) => {
        for (let i = 0; i < ring.count; i++) {
          const angle = (i / ring.count) * Math.PI * 2 + t * ring.speed;
          platformPos[pIdx].x = cx + Math.cos(angle) * ring.r;
          platformPos[pIdx].y = cy + Math.sin(angle) * ring.r;
          platformPos[pIdx].orbitR = ring.r;
          pIdx++;
        }
      });

      // ── Orbit ring tracks ──
      orbitConfig.forEach((ring, ri) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,255,136,${0.07 - ri * 0.015})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.restore();
      });

      // ── Connection lines: platform → platform (same ring, subtle) ──
      orbitConfig.forEach((ring, ri) => {
        const start = ri === 0 ? 0 : ri === 1 ? 4 : 8;
        for (let i = 0; i < ring.count; i++) {
          const a = start + i;
          const b = start + (i + 1) % ring.count;
          ctx.beginPath();
          ctx.moveTo(platformPos[a].x, platformPos[a].y);
          ctx.lineTo(platformPos[b].x, platformPos[b].y);
          ctx.strokeStyle = `${PLATFORMS[a].color}18`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      // ── Connection lines: center → each platform ──
      PLATFORMS.forEach((p, i) => {
        const { x, y } = platformPos[i];
        const grad = ctx.createLinearGradient(cx, cy, x, y);
        grad.addColorStop(0, `${p.color}44`);
        grad.addColorStop(1, `${p.color}08`);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // ── Data packets ──
      for (let i = packets.length - 1; i >= 0; i--) {
        const pkt = packets[i];
        pkt.progress += pkt.speed;

        if (pkt.progress >= 1) {
          packets.splice(i, 1);
          bursts.push({ platformIdx: pkt.platformIdx, ttl: 30 });
          continue;
        }

        const target = platformPos[pkt.platformIdx];
        const px = cx + (target.x - cx) * pkt.progress;
        const py = cy + (target.y - cy) * pkt.progress;
        const pColor = PLATFORMS[pkt.platformIdx].color;

        // Glow trail
        const trail = ctx.createRadialGradient(px, py, 0, px, py, pkt.size * 3);
        trail.addColorStop(0, `${pColor}cc`);
        trail.addColorStop(1, `${pColor}00`);
        ctx.fillStyle = trail;
        ctx.beginPath();
        ctx.arc(px, py, pkt.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(px, py, pkt.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Burst rings on arrival ──
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.ttl -= 1;
        if (b.ttl <= 0) { bursts.splice(i, 1); continue; }

        const progress = 1 - b.ttl / 30;
        const { x, y } = platformPos[b.platformIdx];
        const pColor = PLATFORMS[b.platformIdx].color;
        const burstR = 14 + progress * 30;
        const alpha = b.ttl / 30;

        ctx.beginPath();
        ctx.arc(x, y, burstR, 0, Math.PI * 2);
        ctx.strokeStyle = `${pColor}${Math.floor(alpha * 255).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // ── Platform nodes ──
      PLATFORMS.forEach((p, i) => {
        const { x, y } = platformPos[i];
        const hasBurst = bursts.some((b) => b.platformIdx === i);
        const nodeR = 14;

        // Outer glow
        const glowR = hasBurst ? 28 : 20;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
        glow.addColorStop(0, `${p.color}55`);
        glow.addColorStop(1, `${p.color}00`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(x, y, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = hasBurst ? p.color : `${p.color}22`;
        ctx.fill();
        ctx.strokeStyle = `${p.color}aa`;
        ctx.lineWidth = hasBurst ? 2 : 1;
        ctx.stroke();

        // Platform icon text
        ctx.fillStyle = hasBurst ? "#000" : `${p.color}ee`;
        ctx.font = `bold ${p.icon.length > 1 ? "7" : "9"}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.icon, x, y);

        // Label below
        ctx.fillStyle = `${p.color}99`;
        ctx.font = "7px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(p.name.toUpperCase(), x, y + nodeR + 4);
      });

      // ── Center core ──
      const pulse = 1 + 0.2 * Math.sin(t * 0.05);
      const coreR = size * 0.055 * pulse;

      // Outer corona
      const corona = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.5);
      corona.addColorStop(0, "rgba(0,255,136,0.15)");
      corona.addColorStop(0.5, "rgba(0,255,136,0.05)");
      corona.addColorStop(1, "rgba(0,255,136,0)");
      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner core fill
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      coreGrad.addColorStop(0, "rgba(0,255,136,1)");
      coreGrad.addColorStop(0.6, "rgba(0,255,136,0.7)");
      coreGrad.addColorStop(1, "rgba(0,200,100,0.3)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      // Core ring
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,255,136,0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Core label
      ctx.fillStyle = "#000";
      ctx.font = `bold ${Math.floor(coreR * 0.55)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚡", cx, cy);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="mx-auto"
    />
  );
}

// ─── Live Feed ────────────────────────────────────────────────────────────────

const FEED_TEMPLATES: Array<(p: string, c: string) => ReactNode> = [
  (p, c) => <><span style={{ color: c }}>{p}</span> · track deployed successfully</>,
  (p, c) => <>distributing to <span style={{ color: c }}>{p}</span> · queued</>,
  (p, c) => <><span style={{ color: "#00ff88" }}>✓</span> <span style={{ color: c }}>{p}</span> · live in 12s</>,
  (p, c) => <>metadata sync → <span style={{ color: c }}>{p}</span></>,
  (p, c) => <><span style={{ color: c }}>{p}</span> · audio fingerprint matched</>,
  (p, c) => <>retry #1 → <span style={{ color: c }}>{p}</span> · resolved</>,
];

function LiveFeed() {
  const [lines, setLines] = useState<{ id: number; el: ReactNode }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const spawn = () => {
      const p = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
      const tmpl = FEED_TEMPLATES[Math.floor(Math.random() * FEED_TEMPLATES.length)];
      const id = idRef.current++;
      setLines((prev) => [{ id, el: tmpl(p.name, p.color) }, ...prev].slice(0, 5));
    };
    spawn();
    const iv = setInterval(spawn, 1800);
    return () => clearInterval(iv);
  }, []);

  return (
    <div
      className="mx-auto mt-2 rounded-lg overflow-hidden"
      style={{
        maxWidth: 520,
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(0,255,136,0.1)",
        fontFamily: "monospace",
      }}
    >
      {/* Terminal top bar */}
      <div className="flex items-center gap-2 px-4 py-2" style={{ borderBottom: "1px solid rgba(0,255,136,0.08)", background: "rgba(0,255,136,0.03)" }}>
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-xs text-gray-500 tracking-widest">distrobuzz · distribution log · live</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="text-[#00ff88] text-xs">LIVE</span>
        </span>
      </div>
      {/* Log lines */}
      <div className="px-4 py-3 space-y-1.5" style={{ minHeight: 130 }}>
        {lines.map((line, idx) => (
          <div
            key={line.id}
            className="text-xs text-gray-400 transition-all duration-500"
            style={{ opacity: 1 - idx * 0.15 }}
          >
            <span className="text-gray-600 select-none">{String(new Date().getSeconds()).padStart(2, "0")}:{String(new Date().getMilliseconds()).padStart(3, "0")} › </span>
            {line.el}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Scroll reveal hook ───────────────────────────────────────────────────────

function useReveal(threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Main Landing Page ────────────────────────────────────────────────────────

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [scrollY, setScrollY] = useState(0);
  const { ref: statsRef, visible: statsVisible } = useReveal();
  const { ref: featRef, visible: featVisible } = useReveal();
  const { ref: orbitRef, visible: orbitVisible } = useReveal();
  const { ref: pricingRef, visible: pricingVisible } = useReveal();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navOpacity = Math.min(scrollY / 100, 1);

  return (
    <div className="relative text-white overflow-x-hidden" style={{ background: "#030510" }}>
      <WaveformCanvas />

      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300"
        style={{ background: `rgba(3,5,16,${navOpacity * 0.95})`, borderBottom: `1px solid rgba(0,255,136,${navOpacity * 0.15})` }}
      >
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Zap className="w-5 h-5 text-[#00ff88]" />
          <span className="font-black text-lg tracking-tight" style={{ letterSpacing: "-0.02em" }}>DISTRO BUZZ</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/login")}
            className="text-sm text-gray-400 hover:text-white px-4 py-2 transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => setLocation("/signup")}
            className="text-sm font-bold px-5 py-2 rounded transition-all hover:scale-105 active:scale-95"
            style={{ background: "#00ff88", color: "#000", boxShadow: "0 0 20px rgba(0,255,136,0.4)" }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO ── full viewport */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ paddingTop: "80px" }}>
        <div className="animate-hero-in max-w-5xl mx-auto">
          {/* eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest mb-8 uppercase"
            style={{ border: "1px solid rgba(0,255,136,0.3)", background: "rgba(0,255,136,0.05)", color: "#00ff88" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            Autonomous Distribution Engine
          </div>

          {/* headline */}
          <h1 className="font-black leading-none mb-6" style={{ fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "-0.04em" }}>
            <span className="block text-white">Drop Once.</span>
            <span
              className="block"
              style={{
                background: "linear-gradient(90deg, #00ff88, #00ffff, #ffbb00, #00ff88)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradient-shift 4s linear infinite",
              }}
            >
              Hit Everywhere.
            </span>
          </h1>

          {/* sub */}
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed" style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}>
            Upload to SoundCloud. We detonate it across <strong className="text-white">50+ platforms</strong> in real-time.
            No label. No middleman. No ceiling.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setLocation("/signup")}
              className="group flex items-center justify-center gap-3 font-bold px-8 py-4 rounded-lg text-black transition-all hover:scale-105 active:scale-95"
              style={{ background: "#00ff88", boxShadow: "0 0 30px rgba(0,255,136,0.5)", fontSize: "1.05rem" }}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setLocation("/platforms")}
              className="flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-lg transition-all hover:scale-105"
              style={{ border: "1px solid rgba(0,255,255,0.3)", color: "#00ffff", background: "rgba(0,255,255,0.05)" }}
            >
              See All Platforms
            </button>
          </div>

          <p className="text-gray-600 text-xs mt-6 font-mono tracking-wider">NO CARD REQUIRED · 14-DAY TRIAL · CANCEL ANYTIME</p>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow">
          <span className="text-gray-600 text-xs font-mono tracking-widest">SCROLL</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#00ff88] to-transparent" />
        </div>
      </section>

      {/* STATS */}
      <section
        ref={statsRef}
        className={`relative z-10 py-24 px-6 transition-all duration-1000 ${statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-0 divide-x" style={{ borderColor: "rgba(0,255,136,0.15)" }}>
          {[
            { n: 50000, suffix: "+", label: "Independent Artists" },
            { n: 2000000, suffix: "+", label: "Tracks Distributed" },
            { n: 50, suffix: "+", label: "Platforms Reached" },
          ].map((s, i) => (
            <div key={i} className="text-center py-8 px-4" style={{ borderColor: "rgba(0,255,136,0.15)" }}>
              <div
                className="font-black mb-2"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: i === 0 ? "#00ff88" : i === 1 ? "#00ffff" : "#ffbb00", letterSpacing: "-0.03em" }}
              >
                <Counter target={s.n} suffix={s.suffix} />
              </div>
              <div className="text-gray-500 text-sm uppercase tracking-widest font-mono">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ORBIT — full-screen showcase */}
      <section
        ref={orbitRef}
        className={`relative z-10 py-20 px-6 transition-all duration-1000 ${orbitVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        style={{ borderTop: "1px solid rgba(0,255,136,0.06)", borderBottom: "1px solid rgba(0,255,136,0.06)" }}
      >
        {/* Section label */}
        <div className="text-center mb-4">
          <span
            className="inline-block px-4 py-1 text-xs font-mono tracking-widest uppercase rounded-full"
            style={{ border: "1px solid rgba(0,255,136,0.2)", color: "#00ff88", background: "rgba(0,255,136,0.04)" }}
          >
            Live Distribution Network
          </span>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-2">
            <h2 className="font-black" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.03em" }}>
              Watch your music travel.
            </h2>
            <p className="text-gray-500 mt-2 text-sm">Real-time propagation — every upload, every platform, simultaneously.</p>
          </div>

          {/* Orbit canvas — big */}
          <div className="flex justify-center items-center py-4">
            <div className="relative">
              {/* Ambient glow behind canvas */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(0,255,136,0.06) 0%, transparent 70%)",
                  transform: "scale(1.3)",
                }}
              />
              <PlatformOrbit size={580} />
            </div>
          </div>

          {/* Live event feed below orbit */}
          <LiveFeed />

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <div className="flex gap-6 text-sm text-gray-500 font-mono">
              {[
                { label: "Platforms", val: "50+", color: "#00ff88" },
                { label: "Avg Deploy", val: "<2min", color: "#00ffff" },
                { label: "Uptime", val: "99.9%", color: "#ffbb00" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-black text-lg" style={{ color: s.color }}>{s.val}</div>
                  <div className="text-xs tracking-widest uppercase">{s.label}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setLocation("/signup")}
              className="font-bold px-8 py-3 rounded-lg text-black transition-all hover:scale-105"
              style={{ background: "#00ff88", boxShadow: "0 0 24px rgba(0,255,136,0.35)" }}
            >
              Start Distributing Free
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section
        ref={featRef}
        className={`relative z-10 py-24 px-6 transition-all duration-1000 ${featVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-black mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.03em" }}>
              Built different.
            </h2>
            <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">Not your average distro</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "rgba(0,255,136,0.05)" }}>
            {[
              { n: "01", title: "50+ Platforms", body: "Spotify, Apple, YouTube, TikTok, SoundCloud, Bandcamp, Amazon, Deezer, Tidal and more. All at once." },
              { n: "02", title: "Real-Time Dashboard", body: "Every distribution job. Every retry. Every platform. Live status, zero lag." },
              { n: "03", title: "Smart Retry Engine", body: "7-layer fallback logic. If a platform rejects your track, we fight back automatically." },
              { n: "04", title: "100% Data Ownership", body: "Your music, your data, your rights. We hold nothing. No lock-in, ever." },
              { n: "05", title: "AI Optimization", body: "Mood detection, genre tagging, description generation. Max algorithmic visibility." },
              { n: "06", title: "Open Source Core", body: "Full transparency. Audit the engine, fork it, contribute to it. Community-first." },
            ].map((f, i) => (
              <div
                key={i}
                className="group p-8 transition-all duration-300 hover:bg-white/[0.02] cursor-default"
                style={{ background: "rgba(3,5,16,0.8)" }}
              >
                <div
                  className="font-mono text-xs mb-4 font-bold"
                  style={{ color: i % 3 === 0 ? "#00ff88" : i % 3 === 1 ? "#00ffff" : "#ffbb00" }}
                >
                  {f.n}
                </div>
                <h3 className="font-bold text-lg mb-2 text-white group-hover:text-[#00ff88] transition-colors">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section
        ref={pricingRef}
        className={`relative z-10 py-24 px-6 transition-all duration-1000 ${pricingVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-black mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.03em" }}>
              Transparent pricing.
            </h2>
            <p className="text-gray-500">No hidden fees. No royalty cuts. Ever.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "STARTER",
                price: "$9.99",
                period: "/ month",
                desc: "Solo artists, just launching",
                features: ["1 artist profile", "Basic distribution", "50+ platforms", "Email support"],
                accent: "#00ffff",
              },
              {
                name: "PRO",
                price: "$24.99",
                period: "/ month",
                desc: "Serious musicians scaling up",
                features: ["Unlimited distribution", "AI metadata", "Video generation", "Priority support", "Analytics"],
                accent: "#00ff88",
                featured: true,
              },
              {
                name: "LABEL",
                price: "$99.99",
                period: "/ month",
                desc: "Labels and artist teams",
                features: ["Multiple artists", "API access", "White-label", "Ad placement", "Dedicated support"],
                accent: "#ffbb00",
              },
            ].map((tier, i) => (
              <div
                key={i}
                className={`relative p-8 rounded-lg transition-all duration-300 hover:-translate-y-1 ${tier.featured ? "scale-105" : ""}`}
                style={{
                  background: tier.featured ? `rgba(0,255,136,0.05)` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${tier.featured ? "rgba(0,255,136,0.4)" : "rgba(255,255,255,0.06)"}`,
                  boxShadow: tier.featured ? "0 0 40px rgba(0,255,136,0.1)" : "none",
                }}
              >
                {tier.featured && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black tracking-widest"
                    style={{ background: "#00ff88", color: "#000" }}
                  >
                    MOST POPULAR
                  </div>
                )}
                <div className="font-mono text-xs mb-3 font-bold tracking-widest" style={{ color: tier.accent }}>
                  {tier.name}
                </div>
                <div className="mb-1">
                  <span className="font-black" style={{ fontSize: "2.5rem", letterSpacing: "-0.03em" }}>{tier.price}</span>
                  <span className="text-gray-500 text-sm ml-1">{tier.period}</span>
                </div>
                <p className="text-gray-500 text-sm mb-6">{tier.desc}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <span style={{ color: tier.accent }}>→</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setLocation("/signup")}
                  className="w-full py-3 rounded font-bold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: tier.featured ? tier.accent : "transparent",
                    color: tier.featured ? "#000" : tier.accent,
                    border: tier.featured ? "none" : `1px solid ${tier.accent}`,
                  }}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 py-32 px-6 text-center" style={{ borderTop: "1px solid rgba(0,255,136,0.08)" }}>
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="font-black" style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", letterSpacing: "-0.04em", lineHeight: 1 }}>
            Your music deserves<br />
            <span style={{ color: "#00ff88" }}>every stage.</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Thousands of independent artists already fire with us. Join them.
          </p>
          <button
            onClick={() => setLocation("/signup")}
            className="inline-flex items-center gap-3 font-black px-10 py-5 rounded-lg text-black text-lg transition-all hover:scale-105 active:scale-95"
            style={{ background: "#00ff88", boxShadow: "0 0 50px rgba(0,255,136,0.4)" }}
          >
            Launch Your Music
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-gray-600 font-mono text-xs tracking-widest">FREE TRIAL · NO CREDIT CARD · CANCEL ANYTIME</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-12 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00ff88]" />
            <span className="font-black text-sm tracking-tight">DISTRO BUZZ</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <button onClick={() => setLocation("/platforms")} className="hover:text-white transition-colors">Platforms</button>
            <button onClick={() => setLocation("/api-docs")} className="hover:text-white transition-colors">API Docs</button>
            <button onClick={() => setLocation("/pricing")} className="hover:text-white transition-colors">Pricing</button>
            <button onClick={() => setLocation("/signup")} className="hover:text-white transition-colors">Sign Up</button>
          </div>
          <p className="text-gray-600 text-xs font-mono">© 2026 DISTRO BUZZ. BUILT FOR ARTISTS.</p>
        </div>
      </footer>
    </div>
  );
}
