import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Zap, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const tiers = [
  {
    name: "Starter",
    monthlyPrice: 9.99,
    annualPrice: 7.99,
    desc: "Perfect for solo artists getting started",
    cta: "Start Free Trial",
    featured: false,
  },
  {
    name: "Pro",
    monthlyPrice: 24.99,
    annualPrice: 19.99,
    desc: "For serious musicians ready to scale",
    cta: "Go Pro",
    featured: true,
  },
  {
    name: "Label",
    monthlyPrice: 99.99,
    annualPrice: 79.99,
    desc: "For labels & teams managing multiple artists",
    cta: "Contact Sales",
    featured: false,
  },
];

type FeatureRow = {
  name: string;
  starter: string | boolean;
  pro: string | boolean;
  label: string | boolean;
};

const features: FeatureRow[] = [
  { name: "Artist Profiles", starter: "1", pro: "5", label: "Unlimited" },
  { name: "Platform Distribution", starter: "10 platforms", pro: "50+ platforms", label: "50+ platforms" },
  { name: "Monthly Releases", starter: "5", pro: "Unlimited", label: "Unlimited" },
  { name: "SoundCloud Auto-Monitor", starter: true, pro: true, label: true },
  { name: "Distribution Status Board", starter: true, pro: true, label: true },
  { name: "Real-Time Job Logs", starter: false, pro: true, label: true },
  { name: "AI Metadata Optimization", starter: false, pro: true, label: true },
  { name: "Music Video Generation", starter: false, pro: true, label: true },
  { name: "Social Media Auto-Post", starter: false, pro: true, label: true },
  { name: "Aggregator Fallback Chain", starter: false, pro: true, label: true },
  { name: "Distribution Analytics", starter: "Basic", pro: "Advanced", label: "Enterprise" },
  { name: "API Access", starter: false, pro: "Read-only", label: "Full access" },
  { name: "Ad Placement Credits", starter: false, pro: false, label: "$500/mo" },
  { name: "White-Label Options", starter: false, pro: false, label: true },
  { name: "Dedicated Account Manager", starter: false, pro: false, label: true },
  { name: "Priority Support", starter: false, pro: true, label: true },
  { name: "Email Support", starter: true, pro: true, label: true },
  { name: "Custom Integrations", starter: false, pro: false, label: true },
];

function FeatureCell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-5 h-5 text-neon-green mx-auto" />
    ) : (
      <X className="w-5 h-5 text-slate-600 mx-auto" />
    );
  }
  return <span className="text-sm text-slate-300">{value}</span>;
}

export default function Pricing() {
  const [, setLocation] = useLocation();
  const [annual, setAnnual] = useState(false);

  const handleSubscribe = (tierName: string) => {
    if (tierName === "Label") {
      toast.info("Contact sales@distrobuzz.com for Label tier pricing and onboarding.");
    } else {
      toast.info(`Stripe checkout for ${tierName} tier coming soon. Sign up to get notified!`);
      setLocation("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-neon-green/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-neon-green transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-neon-green" />
            <span className="font-bold neon-glow">Distro Buzz</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            No hidden fees. No revenue cuts. Just honest pricing for honest distribution.
          </p>
        </div>

        {/* Monthly/Annual Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm ${!annual ? "text-white font-bold" : "text-slate-400"}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              annual ? "bg-neon-green" : "bg-slate-700"
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
                annual ? "translate-x-7" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className={`text-sm ${annual ? "text-white font-bold" : "text-slate-400"}`}>
            Annual <span className="text-neon-green text-xs ml-1">Save 20%</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative p-8 rounded-xl border transition-all ${
                tier.featured
                  ? "border-neon-green/60 bg-neon-green/5 scale-105 shadow-[0_0_40px_rgba(0,255,136,0.15)]"
                  : "border-slate-700 bg-slate-900/50 hover:border-neon-green/30"
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-neon-green text-black text-xs font-bold">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-2xl font-bold mb-1">{tier.name}</h3>
              <p className="text-sm text-slate-400 mb-6">{tier.desc}</p>
              <div className="mb-8">
                <span className="text-5xl font-black">
                  ${annual ? tier.annualPrice.toFixed(2) : tier.monthlyPrice.toFixed(2)}
                </span>
                <span className="text-slate-400 text-lg">/mo</span>
                {annual && (
                  <div className="text-xs text-neon-green mt-1">
                    Billed ${(tier.annualPrice * 12).toFixed(2)}/year
                  </div>
                )}
              </div>
              <Button
                onClick={() => handleSubscribe(tier.name)}
                className={`w-full py-6 text-lg font-bold ${
                  tier.featured
                    ? "bg-neon-green text-black hover:bg-neon-green/90 animate-pulse-glow"
                    : "border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                }`}
                variant={tier.featured ? "default" : "outline"}
              >
                {tier.cta}
              </Button>
              {!tier.featured && (
                <p className="text-xs text-slate-500 text-center mt-3">14-day free trial</p>
              )}
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-4 text-sm font-bold text-slate-300 w-1/4">Feature</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-slate-300">Starter</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-neon-green">Pro</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-slate-300">Label</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, i) => (
                  <tr
                    key={i}
                    className={`border-b border-slate-800 ${i % 2 === 0 ? "bg-slate-900/30" : ""}`}
                  >
                    <td className="py-3 px-4 text-sm text-white">{feature.name}</td>
                    <td className="py-3 px-4 text-center">
                      <FeatureCell value={feature.starter} />
                    </td>
                    <td className="py-3 px-4 text-center bg-neon-green/5">
                      <FeatureCell value={feature.pro} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <FeatureCell value={feature.label} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Do you take a cut of my royalties?",
                a: "Absolutely not. You keep 100% of your royalties. We charge a flat monthly fee, that's it.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. No contracts, no cancellation fees. Cancel anytime from your dashboard.",
              },
              {
                q: "What happens to my distributed music if I cancel?",
                a: "Your music stays live on all platforms. We don't pull your releases when you cancel.",
              },
              {
                q: "Do you support ISRC codes?",
                a: "Yes. We auto-generate ISRC codes for all releases, or you can provide your own.",
              },
              {
                q: "How fast is distribution?",
                a: "Most platforms receive your music within 24-48 hours. Some platforms like Spotify may take up to 5 business days for first-time releases.",
              },
            ].map((faq, i) => (
              <div key={i} className="border border-slate-700 rounded-lg p-6 hover:border-neon-green/30 transition-colors">
                <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                <p className="text-slate-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
