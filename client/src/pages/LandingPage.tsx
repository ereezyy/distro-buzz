import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Music2, Radio, Zap, TrendingUp, Lock, Gauge } from "lucide-react";
import { useLocation } from "wouter";

/**
 * Particle background animation component
 */
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = ["#00ff88", "#00ffff", "#ff00ff", "#ffff00"];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Animation loop
    const animate = () => {
      // Clear canvas with semi-transparent black for trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connecting lines
        particles.forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - distance / 100) * 0.2;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ background: "linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%)" }}
    />
  );
}

/**
 * Scroll-triggered animation hook
 */
function useScrollAnimation(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollAnimation();
  const { ref: socialProofRef, isVisible: socialProofVisible } = useScrollAnimation();
  const { ref: pricingRef, isVisible: pricingVisible } = useScrollAnimation();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <ParticleBackground />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-neon-green/10">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-neon-green" />
          <span className="text-xl font-bold neon-glow">Distro Buzz</span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/login")}
            className="text-neon-cyan hover:text-neon-green"
          >
            Login
          </Button>
          <Button
            onClick={() => setLocation("/signup")}
            className="bg-neon-green text-black hover:bg-neon-green/90 neon-glow"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative z-10 min-h-[90vh] flex items-center justify-center px-6 py-20"
      >
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-block px-4 py-2 rounded-full border border-neon-green/40 bg-neon-green/5">
            <span className="text-neon-green text-sm font-mono">⚡ OMNIPRESENT DISTRIBUTION ENGINE</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black leading-tight">
            <span className="block">One Track.</span>
            <span className="block bg-gradient-to-r from-neon-green via-neon-cyan to-neon-pink bg-clip-text text-transparent neon-glow">
              Infinite Reach.
            </span>
            <span className="block text-slate-400">Everywhere.</span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The most aggressive, relentless music distribution engine ever built. Drop a track on SoundCloud and watch it propagate to every platform on the planet. No middlemen. No delays. No exploitation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={() => setLocation("/signup")}
              className="px-8 py-6 text-lg bg-neon-green text-black hover:bg-neon-green/90 neon-glow font-bold"
            >
              Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="px-8 py-6 text-lg border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
            >
              View Platforms
            </Button>
          </div>

          <div className="pt-8 text-sm text-slate-400">
            <p>✨ No credit card required • 14-day free trial • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className={`relative z-10 py-20 px-6 transition-opacity duration-1000 ${
          featuresVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Artists Choose Distro Buzz</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Radio,
                title: "50+ Platforms",
                desc: "Spotify, Apple Music, YouTube, TikTok, and 46 more. All simultaneously.",
              },
              {
                icon: Gauge,
                title: "Real-Time Visibility",
                desc: "Watch every platform, every moment. Know exactly where your music lives.",
              },
              {
                icon: Zap,
                title: "Intelligent Retry Logic",
                desc: "Failures never silently disappear. Automatic fallbacks ensure delivery.",
              },
              {
                icon: Lock,
                title: "100% Data Ownership",
                desc: "Your data. Your music. Your rights. Zero vendor lock-in.",
              },
              {
                icon: TrendingUp,
                title: "AI-Powered Optimization",
                desc: "Metadata optimization, mood detection, auto-tagging for maximum reach.",
              },
              {
                icon: Music2,
                title: "Video Generation",
                desc: "Auto-generate audio-reactive music videos for YouTube & TikTok.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-lg border border-neon-green/20 bg-neon-green/5 hover:border-neon-green/40 hover:bg-neon-green/10 transition-all"
              >
                <feature.icon className="w-8 h-8 text-neon-green mb-4" />
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section
        ref={socialProofRef}
        className={`relative z-10 py-20 px-6 transition-opacity duration-1000 ${
          socialProofVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Trusted by Independent Artists</h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { stat: "50K+", label: "Artists" },
              { stat: "2M+", label: "Tracks Distributed" },
              { stat: "1B+", label: "Streams Generated" },
            ].map((item, i) => (
              <div key={i} className="p-6 border border-neon-cyan/20 rounded-lg">
                <div className="text-3xl font-bold text-neon-cyan">{item.stat}</div>
                <div className="text-slate-400">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {[
              {
                quote: "Distro Buzz got my music everywhere in minutes. Game changer.",
                author: "Maya Chen, Independent Artist",
              },
              {
                quote: "Finally, a platform that doesn't exploit artists. This is the future.",
                author: "James Rodriguez, Producer",
              },
              {
                quote: "The transparency alone is worth it. I know exactly where my tracks are.",
                author: "Sofia Petrov, Songwriter",
              },
            ].map((testimonial, i) => (
              <div key={i} className="p-6 border-l-2 border-neon-green/40 bg-neon-green/5 rounded">
                <p className="text-lg mb-2">"{testimonial.quote}"</p>
                <p className="text-neon-green text-sm font-semibold">— {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        ref={pricingRef}
        className={`relative z-10 py-20 px-6 transition-opacity duration-1000 ${
          pricingVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Simple, Transparent Pricing</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$9.99",
                period: "/mo",
                desc: "Perfect for solo artists",
                features: ["1 artist profile", "Basic distribution", "50+ platforms", "Email support"],
              },
              {
                name: "Pro",
                price: "$24.99",
                period: "/mo",
                desc: "For serious musicians",
                features: [
                  "Unlimited distribution",
                  "AI metadata optimization",
                  "Music video generation",
                  "Priority support",
                  "Advanced analytics",
                ],
                featured: true,
              },
              {
                name: "Label",
                price: "$99.99",
                period: "/mo",
                desc: "For labels & teams",
                features: [
                  "Multiple artists",
                  "API access",
                  "White-label options",
                  "Ad placement",
                  "Dedicated support",
                ],
              },
            ].map((tier, i) => (
              <div
                key={i}
                className={`p-8 rounded-lg border transition-all ${
                  tier.featured
                    ? "border-neon-green/60 bg-neon-green/10 scale-105"
                    : "border-slate-700 bg-slate-900/50 hover:border-neon-green/40"
                }`}
              >
                {tier.featured && (
                  <div className="inline-block px-3 py-1 rounded-full bg-neon-green/20 text-neon-green text-xs font-bold mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{tier.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-slate-400">{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="text-sm text-slate-300 flex items-center gap-2">
                      <span className="text-neon-green">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    tier.featured
                      ? "bg-neon-green text-black hover:bg-neon-green/90"
                      : "border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                  }`}
                  variant={tier.featured ? "default" : "outline"}
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6 border-t border-neon-green/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to Go Omnipresent?</h2>
          <p className="text-xl text-slate-300">
            Join thousands of independent artists who've taken control of their distribution.
          </p>
          <Button
            onClick={() => setLocation("/signup")}
            className="px-8 py-6 text-lg bg-neon-green text-black hover:bg-neon-green/90 neon-glow font-bold"
          >
            Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-8 px-6 text-center text-slate-400 text-sm">
        <p>© 2026 Distro Buzz. All rights reserved. Made with ❤️ for independent musicians.</p>
      </footer>
    </div>
  );
}
