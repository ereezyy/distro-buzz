import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Disc3,
  Music2,
  RefreshCw,
  Send,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function TrackLibraryContent() {
  const [page] = useState(1);

  const tracksQuery = trpc.tracks.list.useQuery({ page, limit: 20 }, { refetchInterval: 15000 });
  const distributeMutation = trpc.tracks.distribute.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      tracksQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const tracks = tracksQuery.data?.tracks || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="neon-glow text-primary">Track</span> Library
          </h1>
          <p className="text-muted-foreground mt-1">
            All your tracks and their distribution status
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => tracksQuery.refetch()}
          className="border-primary/30 hover:border-primary/60"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {tracksQuery.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Disc3 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : tracks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
            <Music2 className="w-12 h-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-semibold text-lg">No tracks yet</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Connect your SoundCloud to auto-import tracks, or add them manually.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tracks.map((track: any) => {
            const distStatus = track.distributionStatus as any;
            const platformStatuses = distStatus?.platforms || {};
            const totalPlatforms = Object.keys(platformStatuses).length || 14;
            const livePlatforms = Object.values(platformStatuses).filter(
              (s: any) => s === "live"
            ).length;
            const coverageScore = totalPlatforms > 0
              ? Math.round((livePlatforms / totalPlatforms) * 100)
              : 0;

            return (
              <Card key={track.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Artwork */}
                    <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      {track.artworkUrl ? (
                        <img
                          src={track.artworkUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music2 className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{track.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        {track.genre && (
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {track.genre}
                          </Badge>
                        )}
                        {track.durationMs && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.floor(track.durationMs / 60000)}:
                            {String(Math.floor((track.durationMs % 60000) / 1000)).padStart(2, "0")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Coverage Score */}
                    <div className="text-center shrink-0">
                      <div
                        className={`text-xl font-bold font-mono ${
                          coverageScore >= 70
                            ? "text-neon-green"
                            : coverageScore >= 40
                              ? "text-neon-amber"
                              : "text-muted-foreground"
                        }`}
                      >
                        {livePlatforms}/{totalPlatforms}
                      </div>
                      <p className="text-[10px] text-muted-foreground">platforms</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          distributeMutation.mutate({ trackId: track.id })
                        }
                        disabled={distributeMutation.isPending}
                        className="border-primary/30 hover:border-primary/60 text-xs"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Distribute
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TrackLibrary() {
  return (
    <DashboardLayout>
      <TrackLibraryContent />
    </DashboardLayout>
  );
}
