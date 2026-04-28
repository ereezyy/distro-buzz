import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  ArrowRight,
  Music2,
  Radio,
  Zap,
  Shield,
  Globe,
  Activity,
  Disc3,
} from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">
              <span className="neon-glow text-primary">Distro</span> Buzz
            </span>
          </div>
          <div className="flex items-center gap-3">
            {loading ? null : user ? (
              <Button
                onClick={() => setLocation("/dashboard")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background grid effect */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.85 0.25 145 / 30%) 1px, transparent 1px), linear-gradient(90deg, oklch(0.85 0.25 145 / 30%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-primary tracking-wider">
                OMNIPRESENT DISTRIBUTION ENGINE
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              One Track.
              <br />
              <span className="neon-glow text-primary">Infinite Reach.</span>
              <br />
              <span className="text-muted-foreground">Everywhere.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              The most aggressive, relentless music distribution engine ever built.
              Drop a track on SoundCloud and watch it propagate to every platform
              on the planet. No middlemen. No delays. No exploitation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() =>
                  user
                    ? setLocation("/dashboard")
                    : (window.location.href = getLoginUrl())
                }
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 h-12"
              >
                <Zap className="w-5 h-5 mr-2" />
                {user ? "Go to Dashboard" : "Start Distributing"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/platforms")}
                className="border-border hover:border-primary/40 text-base px-8 h-12"
              >
                <Radio className="w-5 h-5 mr-2" />
                View Platforms
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "14+", label: "Platforms", icon: Radio },
              { value: "24/7", label: "Monitoring", icon: Activity },
              { value: "Auto", label: "Retry Logic", icon: Disc3 },
              { value: "100%", label: "Open Source", icon: Shield },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold font-mono text-primary">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              How <span className="text-primary">Distro Buzz</span> Works
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              A fully automated pipeline from SoundCloud to the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Music2,
                title: "Drop Your Track",
                description:
                  "Upload to SoundCloud as usual. Our monitor detects new releases within minutes and kicks off the distribution pipeline.",
                color: "text-neon-cyan",
                borderColor: "hover:border-neon-cyan/40",
              },
              {
                icon: Zap,
                title: "Auto-Distribute",
                description:
                  "The distribution engine fires jobs to every platform simultaneously. Direct APIs, aggregator fallbacks, and retry logic ensure nothing gets dropped.",
                color: "text-primary",
                borderColor: "hover:border-primary/40",
              },
              {
                icon: Globe,
                title: "Everywhere, Always",
                description:
                  "Spotify, Apple Music, YouTube, Tidal, Deezer, Bandcamp, TikTok, Instagram, Beatport, and more. Real-time status tracking for every platform.",
                color: "text-neon-purple",
                borderColor: "hover:border-neon-purple/40",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`p-6 rounded-xl border border-border/50 bg-card/50 ${feature.borderColor} transition-colors`}
              >
                <feature.icon className={`w-8 h-8 ${feature.color} mb-4`} />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Take Back <span className="text-primary">Control</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Built by artists, for artists. Open source. No gatekeepers.
            Your music, your terms.
          </p>
          <Button
            size="lg"
            onClick={() =>
              user
                ? setLocation("/onboarding")
                : (window.location.href = getLoginUrl())
            }
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 h-12"
          >
            <Zap className="w-5 h-5 mr-2" />
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span>Distro Buzz</span>
          </div>
          <span>Open Source. Artist First.</span>
        </div>
      </footer>
    </div>
  );
}
