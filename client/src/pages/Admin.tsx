import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  AlertTriangle,
  Loader2,
  Pause,
  Play,
  Radio,
  Server,
  Shield,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";

function AdminContent() {
  const { user } = useAuth();
  const statsQuery = trpc.admin.stats.useQuery(undefined, {
    enabled: user?.role === "admin",
    retry: false,
    refetchInterval: 10000,
  });

  const triggerMutation = trpc.admin.triggerJob.useMutation({
    onSuccess: () => {
      toast.success("Job triggered");
      statsQuery.refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const pauseMutation = trpc.admin.pauseJob.useMutation({
    onSuccess: () => {
      toast.success("Job paused");
      statsQuery.refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Shield className="w-12 h-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="font-semibold text-lg">Admin Access Required</h3>
          <p className="text-muted-foreground text-sm mt-1">
            This panel is restricted to system administrators.
          </p>
        </div>
      </div>
    );
  }

  if (statsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const stats = statsQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="neon-glow text-primary">Admin</span> Control Panel
        </h1>
        <p className="text-muted-foreground mt-1">
          System-wide distribution oversight and job management
        </p>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Queued", value: stats?.queue.queued ?? 0, color: "text-neon-amber" },
          { label: "Processing", value: stats?.queue.processing ?? 0, color: "text-neon-cyan" },
          { label: "Retrying", value: stats?.queue.retrying ?? 0, color: "text-neon-pink" },
          { label: "Failed", value: stats?.queue.failed ?? 0, color: "text-destructive" },
          { label: "Total Active", value: stats?.queue.total ?? 0, color: "text-primary" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6 text-center">
              <p className={`text-3xl font-bold font-mono ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Radio className="w-5 h-5 text-primary" />
            Platform Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neon-green/5 border border-neon-green/20">
              <Wifi className="w-5 h-5 text-neon-green" />
              <div>
                <p className="text-xl font-bold font-mono text-neon-green">
                  {stats?.platforms.healthy ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Healthy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neon-amber/5 border border-neon-amber/20">
              <Activity className="w-5 h-5 text-neon-amber" />
              <div>
                <p className="text-xl font-bold font-mono text-neon-amber">
                  {stats?.platforms.degraded ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Degraded</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <WifiOff className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-xl font-bold font-mono text-destructive">
                  {stats?.platforms.down ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Down</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Failed Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Recent Failed Jobs ({stats?.recentFailedJobs?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentFailedJobs && stats.recentFailedJobs.length > 0 ? (
            <div className="space-y-2">
              {stats.recentFailedJobs.map((job: any) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge
                      variant="outline"
                      className="text-[9px] font-mono text-destructive border-destructive/40"
                    >
                      FAILED
                    </Badge>
                    <span className="text-sm truncate">{job.platformId}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      #{job.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerMutation.mutate({ id: job.id })}
                      disabled={triggerMutation.isPending}
                      className="text-xs border-neon-green/30 hover:border-neon-green/60"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No failed jobs. All systems operational.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Queued Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Server className="w-5 h-5 text-neon-amber" />
            Queued Jobs ({stats?.recentQueuedJobs?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentQueuedJobs && stats.recentQueuedJobs.length > 0 ? (
            <div className="space-y-2">
              {stats.recentQueuedJobs.map((job: any) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge
                      variant="outline"
                      className="text-[9px] font-mono text-neon-amber border-neon-amber/40"
                    >
                      QUEUED
                    </Badge>
                    <span className="text-sm truncate">{job.platformId}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      #{job.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => pauseMutation.mutate({ id: job.id })}
                      disabled={pauseMutation.isPending}
                      className="text-xs border-destructive/30 hover:border-destructive/60"
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No jobs in queue.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Admin() {
  return (
    <DashboardLayout>
      <AdminContent />
    </DashboardLayout>
  );
}
