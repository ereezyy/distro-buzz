import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  ExternalLink,
  Radio,
  RefreshCw,
  Shield,
  Wifi,
  WifiOff,
} from "lucide-react";

function PlatformRegistryContent() {
  const platformsQuery = trpc.platforms.list.useQuery(undefined, { refetchInterval: 15000 });
  const healthMutation = trpc.platforms.health.useQuery(undefined, { refetchInterval: 10000 });

  const platforms = platformsQuery.data?.platforms || [];

  const streamingPlatforms = platforms.filter((p: any) => p.category === "streaming");
  const socialPlatforms = platforms.filter((p: any) => p.category === "social");
  const nichePlatforms = platforms.filter((p: any) => p.category === "niche");

  const renderPlatformCard = (platform: any) => {
    const healthColor =
      platform.healthStatus === "healthy"
        ? "text-neon-green"
        : platform.healthStatus === "degraded"
          ? "text-neon-amber"
          : platform.healthStatus === "down"
            ? "text-destructive"
            : "text-muted-foreground";

    const healthIcon =
      platform.healthStatus === "healthy" ? (
        <Wifi className={`w-4 h-4 ${healthColor}`} />
      ) : platform.healthStatus === "down" ? (
        <WifiOff className={`w-4 h-4 ${healthColor}`} />
      ) : (
        <Activity className={`w-4 h-4 ${healthColor}`} />
      );

    return (
      <Card
        key={platform.id}
        className="hover:border-primary/30 transition-colors"
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {healthIcon}
              <div>
                <h3 className="font-semibold text-sm">{platform.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="text-[9px] font-mono tracking-wider"
                  >
                    {platform.integrationMethod?.replace("_", " ").toUpperCase()}
                  </Badge>
                  {platform.priority && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      P{platform.priority}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {platform.credentialsConfigured ? (
                <Shield className="w-3.5 h-3.5 text-neon-green" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              {platform.apiDocsUrl && (
                <a
                  href={platform.apiDocsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {platform.estimatedTimeToLive && (
            <p className="text-[10px] text-muted-foreground mt-2 font-mono">
              Est. time to live: {platform.estimatedTimeToLive}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="neon-glow text-primary">Platform</span> Registry
          </h1>
          <p className="text-muted-foreground mt-1">
            All supported distribution platforms and their status
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => platformsQuery.refetch()}
          className="border-primary/30 hover:border-primary/60"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Streaming Platforms */}
      {streamingPlatforms.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Radio className="w-4 h-4 text-neon-green" />
            Streaming Platforms ({streamingPlatforms.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {streamingPlatforms.map(renderPlatformCard)}
          </div>
        </div>
      )}

      {/* Social Platforms */}
      {socialPlatforms.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-neon-cyan" />
            Social / Video Platforms ({socialPlatforms.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {socialPlatforms.map(renderPlatformCard)}
          </div>
        </div>
      )}

      {/* Niche Platforms */}
      {nichePlatforms.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-neon-purple" />
            Niche / Specialty Platforms ({nichePlatforms.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {nichePlatforms.map(renderPlatformCard)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlatformRegistry() {
  return (
    <DashboardLayout>
      <PlatformRegistryContent />
    </DashboardLayout>
  );
}
