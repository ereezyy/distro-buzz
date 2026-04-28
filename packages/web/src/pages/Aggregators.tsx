import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ExternalLink,
  Link2,
  Loader2,
  Plug,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AggregatorConfig {
  id: string;
  name: string;
  description: string;
  website: string;
  status: "connected" | "disconnected" | "pending";
  fields: { key: string; label: string; placeholder: string }[];
}

const AGGREGATORS: AggregatorConfig[] = [
  {
    id: "distrokid",
    name: "DistroKid",
    description: "Fast, affordable distribution to 150+ stores. Best for high-volume releases.",
    website: "https://distrokid.com",
    status: "disconnected",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "dk_live_..." },
      { key: "artistId", label: "Artist ID", placeholder: "Your DistroKid artist ID" },
    ],
  },
  {
    id: "tunecore",
    name: "TuneCore",
    description: "Industry-standard distribution with detailed analytics and publishing admin.",
    website: "https://tunecore.com",
    status: "disconnected",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "tc_..." },
      { key: "accountEmail", label: "Account Email", placeholder: "you@example.com" },
    ],
  },
  {
    id: "cdbaby",
    name: "CD Baby",
    description: "Veteran distributor with sync licensing and publishing royalty collection.",
    website: "https://cdbaby.com",
    status: "disconnected",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "cdb_..." },
      { key: "artistName", label: "Artist Name", placeholder: "Your CD Baby artist name" },
    ],
  },
  {
    id: "amuse",
    name: "Amuse",
    description: "Free tier distribution with AI-powered A&R and advance funding.",
    website: "https://amuse.io",
    status: "disconnected",
    fields: [
      { key: "apiToken", label: "API Token", placeholder: "amuse_..." },
    ],
  },
  {
    id: "ditto",
    name: "Ditto Music",
    description: "Flat-fee distribution with record label services and playlist pitching.",
    website: "https://dittomusic.com",
    status: "disconnected",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "ditto_..." },
    ],
  },
  {
    id: "routenote",
    name: "RouteNote",
    description: "Free and premium distribution tiers with 50/50 or 85/15 revenue splits.",
    website: "https://routenote.com",
    status: "disconnected",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "rn_..." },
    ],
  },
];

function AggregatorCard({ aggregator }: { aggregator: AggregatorConfig }) {
  const [expanded, setExpanded] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save - in production this would call trpc.aggregators.connect
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    toast.success(`${aggregator.name} credentials saved. Connection pending verification.`);
    setExpanded(false);
  };

  return (
    <Card className="border-border/50 hover:border-border transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plug className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{aggregator.name}</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {aggregator.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[9px] font-mono ${
                aggregator.status === "connected"
                  ? "text-neon-green border-neon-green/40"
                  : aggregator.status === "pending"
                    ? "text-neon-amber border-neon-amber/40"
                    : "text-muted-foreground border-border"
              }`}
            >
              {aggregator.status.toUpperCase()}
            </Badge>
            <a
              href={aggregator.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!expanded ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(true)}
            className="w-full border-primary/30 hover:border-primary/60"
          >
            <Link2 className="w-4 h-4 mr-2" />
            {aggregator.status === "connected" ? "Update Credentials" : "Connect Account"}
          </Button>
        ) : (
          <div className="space-y-4">
            {aggregator.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs">{field.label}</Label>
                <Input
                  type={field.key.toLowerCase().includes("key") || field.key.toLowerCase().includes("token") ? "password" : "text"}
                  placeholder={field.placeholder}
                  value={values[field.key] || ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  className="h-9 text-sm font-mono bg-background"
                />
              </div>
            ))}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || aggregator.fields.some((f) => !values[f.key])}
                className="flex-1"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                Save & Verify
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpanded(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AggregatorsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="neon-glow text-primary">Aggregator</span> Integrations
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect fallback distribution aggregators. When direct platform APIs fail,
          Distro Buzz automatically routes through these services.
        </p>
      </div>

      <Card className="border-neon-amber/20 bg-neon-amber/5">
        <CardContent className="pt-6">
          <p className="text-sm text-neon-amber">
            <strong>Fallback Chain:</strong> Distro Buzz tries direct platform APIs first.
            If unavailable, it falls back to connected aggregators in priority order.
            Connect multiple aggregators for maximum resilience.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {AGGREGATORS.map((agg) => (
          <AggregatorCard key={agg.id} aggregator={agg} />
        ))}
      </div>
    </div>
  );
}

export default function Aggregators() {
  return (
    <DashboardLayout>
      <AggregatorsContent />
    </DashboardLayout>
  );
}
