import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Music2,
  Radio,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    live: {
      label: "LIVE",
      className: "bg-neon-green/20 text-neon-green border-neon-green/40 status-live",
    },
    processing: {
      label: "PROCESSING",
      className: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40 status-processing",
    },
    queued: {
      label: "QUEUED",
      className: "bg-neon-amber/20 text-neon-amber border-neon-amber/40 status-queued",
    },
    failed: {
      label: "FAILED",
      className: "bg-destructive/20 text-destructive border-destructive/40 status-failed",
    },
    retrying: {
      label: "RETRYING",
      className: "bg-neon-pink/20 text-neon-pink border-neon-pink/40 status-retrying",
    },
    fallback: {
      label: "FALLBACK",
      className: "bg-neon-purple/20 text-neon-purple border-neon-purple/40",
    },
  };

  const c = config[status] || config.queued;

  return (
    <Badge variant="outline" className={`font-mono text-[10px] tracking-wider ${c.className}`}>
      {c.label}
    </Badge>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const artistQuery = trpc.artists.me.useQuery();
  const platformsQuery = trpc.platforms.list.useQuery();
  const healthQuery = trpc.platforms.health.useQuery();

  const artist = artistQuery.data;
  const platforms = platformsQuery.data?.platforms || [];

  // If no artist profile, redirect to onboarding
  if (!artistQuery.isLoading && !artist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Music2 className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome to Distro Buzz</h2>
          <p className="text-muted-foreground max-w-md">
            Set up your artist profile to start distributing your music everywhere.
          </p>
        </div>
        <Button
          onClick={() => setLocation("/onboarding")}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Zap className="w-4 h-4 mr-2" />
          Get Started
        </Button>
      </div>
    );
  }

  const healthData = healthQuery.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="neon-glow text-primary">Distribution</span> Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            {artist?.name ? `${artist.name}'s` : "Your"} music distribution status
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            platformsQuery.refetch();
            healthQuery.refetch();
          }}
          className="border-primary/30 hover:border-primary/60"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="neon-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center">
                <Radio className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{platforms.length}</p>
                <p className="text-xs text-muted-foreground">Platforms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neon-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">
                  {platforms.filter((p: any) => p.healthStatus === "healthy").length}
                </p>
                <p className="text-xs text-muted-foreground">Healthy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neon-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neon-amber/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-neon-amber" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">0</p>
                <p className="text-xs text-muted-foreground">In Queue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neon-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">0</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Status Board */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radio className="w-5 h-5 text-primary" />
            Platform Status Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          {platforms.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Loading platforms...
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {platforms.map((platform: any) => (
                <div
                  key={platform.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        platform.healthStatus === "healthy"
                          ? "bg-neon-green"
                          : platform.healthStatus === "degraded"
                            ? "bg-neon-amber"
                            : platform.healthStatus === "down"
                              ? "bg-destructive"
                              : "bg-muted-foreground"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">{platform.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase">
                        {platform.integrationMethod?.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono border-border/50"
                    >
                      {platform.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => setLocation("/tracks")}
        >
          <CardContent className="pt-6 flex items-center gap-4">
            <Music2 className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium">Track Library</p>
              <p className="text-sm text-muted-foreground">
                Manage tracks and distribution
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-neon-cyan/40 transition-colors"
          onClick={() => setLocation("/platforms")}
        >
          <CardContent className="pt-6 flex items-center gap-4">
            <Radio className="w-8 h-8 text-neon-cyan" />
            <div>
              <p className="font-medium">Platform Registry</p>
              <p className="text-sm text-muted-foreground">
                View all connected platforms
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-neon-purple/40 transition-colors"
          onClick={() => setLocation("/logs")}
        >
          <CardContent className="pt-6 flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-neon-purple" />
            <div>
              <p className="font-medium">Job Logs</p>
              <p className="text-sm text-muted-foreground">
                Distribution activity log
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
