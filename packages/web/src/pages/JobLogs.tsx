import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    live: {
      label: "LIVE",
      className: "bg-neon-green/20 text-neon-green border-neon-green/40",
    },
    processing: {
      label: "PROCESSING",
      className: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40",
    },
    queued: {
      label: "QUEUED",
      className: "bg-neon-amber/20 text-neon-amber border-neon-amber/40",
    },
    failed: {
      label: "FAILED",
      className: "bg-destructive/20 text-destructive border-destructive/40",
    },
    retrying: {
      label: "RETRYING",
      className: "bg-neon-pink/20 text-neon-pink border-neon-pink/40",
    },
    success: {
      label: "SUCCESS",
      className: "bg-neon-green/20 text-neon-green border-neon-green/40",
    },
    failure: {
      label: "FAILURE",
      className: "bg-destructive/20 text-destructive border-destructive/40",
    },
    pending: {
      label: "PENDING",
      className: "bg-neon-amber/20 text-neon-amber border-neon-amber/40",
    },
  };

  const c = config[status] || { label: status.toUpperCase(), className: "border-border" };

  return (
    <Badge variant="outline" className={`font-mono text-[10px] tracking-wider ${c.className}`}>
      {c.label}
    </Badge>
  );
}

function JobLogsContent() {
  const jobsQuery = trpc.jobs.list.useQuery({
    page: 1,
    limit: 50,
  }, { refetchInterval: 10000 });

  const retryMutation = trpc.jobs.retry.useMutation({
    onSuccess: () => {
      toast.success("Job requeued for retry");
      jobsQuery.refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const jobs = jobsQuery.data?.jobs || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="neon-glow text-primary">Distribution</span> Job Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Detailed log of every distribution job and its status
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => jobsQuery.refetch()}
          className="border-primary/30 hover:border-primary/60"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {jobsQuery.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
            <FileText className="w-12 h-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-semibold text-lg">No distribution jobs yet</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Distribution jobs will appear here once you start distributing tracks.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job: any) => (
            <Card key={job.id} className="hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={job.status} />
                      <span className="text-sm font-semibold truncate">
                        {job.platformId}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        #{job.id.slice(0, 8)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.createdAt
                          ? new Date(job.createdAt).toLocaleString()
                          : "—"}
                      </span>
                      {job.retryCount > 0 && (
                        <span className="flex items-center gap-1 text-neon-pink">
                          <RotateCcw className="w-3 h-3" />
                          {job.retryCount} retries
                        </span>
                      )}
                      {job.platformUrl && (
                        <a
                          href={job.platformUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View on platform
                        </a>
                      )}
                    </div>

                    {job.errorMessage && (
                      <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-destructive font-mono">
                          {job.errorMessage}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {job.status === "failed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryMutation.mutate({ id: job.id })}
                        disabled={retryMutation.isPending}
                        className="border-neon-pink/30 hover:border-neon-pink/60 text-xs"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function JobLogs() {
  return (
    <DashboardLayout>
      <JobLogsContent />
    </DashboardLayout>
  );
}
