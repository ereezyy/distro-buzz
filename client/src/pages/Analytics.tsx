import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Disc3,
  Loader2,
  Radio,
  TrendingUp,
  XCircle,
} from "lucide-react";

function AnalyticsContent() {
  const analyticsQuery = trpc.analytics.overview.useQuery(undefined, { refetchInterval: 15000 });
  const data = analyticsQuery.data as any;

  if (analyticsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <BarChart3 className="w-12 h-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="font-semibold text-lg">No analytics data yet</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Start distributing tracks to see analytics here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="neon-glow text-primary">Distribution</span> Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Track distribution health and platform performance
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Disc3 className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold font-mono">{data.totalTracks}</p>
                <p className="text-xs text-muted-foreground">Total Tracks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-neon-green" />
              <div>
                <p className="text-2xl font-bold font-mono text-neon-green">
                  {data.liveJobs}
                </p>
                <p className="text-xs text-muted-foreground">Live Distributions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold font-mono text-destructive">
                  {data.failedJobs}
                </p>
                <p className="text-xs text-muted-foreground">Failed Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-neon-cyan" />
              <div>
                <p className="text-2xl font-bold font-mono text-neon-cyan">
                  {data.processingJobs}
                </p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-primary" />
            Distribution Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Overall health across {data.totalPlatforms} platforms
              </span>
              <span
                className={`text-2xl font-bold font-mono ${
                  data.healthScore >= 80
                    ? "text-neon-green"
                    : data.healthScore >= 50
                      ? "text-neon-amber"
                      : "text-destructive"
                }`}
              >
                {data.healthScore}%
              </span>
            </div>
            <Progress
              value={data.healthScore ?? 0}
              className="h-3"
            />
            <p className="text-xs text-muted-foreground">
              {data.liveJobs} of {data.totalJobs} distribution jobs completed
              successfully
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Radio className="w-5 h-5 text-primary" />
            Platform Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.platformStats && data.platformStats.length > 0 ? (
            <div className="space-y-4">
              {data.platformStats
                .sort((a: any, b: any) => b.totalCount - a.totalCount)
                .map((platform: any) => (
                  <div key={platform.platformId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {platform.platformName}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono ${
                            platform.successRate >= 80
                              ? "text-neon-green border-neon-green/40"
                              : platform.successRate >= 50
                                ? "text-neon-amber border-neon-amber/40"
                                : "text-destructive border-destructive/40"
                          }`}
                        >
                          {platform.successRate}% success
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {platform.liveCount}/{platform.totalCount}
                      </span>
                    </div>
                    <Progress
                      value={platform.successRate}
                      className="h-1.5"
                    />
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No platform distribution data yet. Start distributing tracks to see
              performance metrics.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Analytics() {
  return (
    <DashboardLayout>
      <AnalyticsContent />
    </DashboardLayout>
  );
}
