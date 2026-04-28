import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  Music2,
  Radio,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);

  const [artistName, setArtistName] = useState("");
  const [soundcloudUrl, setSoundcloudUrl] = useState("");
  const [genre, setGenre] = useState("");

  const createArtist = trpc.artists.create.useMutation({
    onSuccess: () => {
      toast.success("Artist profile created!");
      setLocation("/dashboard");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create profile");
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full neon-border">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">
                <span className="neon-glow text-primary">Distro</span> Buzz
              </h1>
              <p className="text-muted-foreground">
                Sign in to start distributing your music everywhere.
              </p>
            </div>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="w-full bg-primary text-primary-foreground"
              size="lg"
            >
              Sign In to Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= step
                  ? "bg-primary w-12"
                  : "bg-muted w-8"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Artist Name */}
        {step === 1 && (
          <Card className="neon-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Music2 className="w-6 h-6 text-primary" />
                Your Artist Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="artistName">Artist / Band Name</Label>
                <Input
                  id="artistName"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Enter your artist name"
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Primary Genre</Label>
                <Input
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g. Hip Hop, Electronic, Indie Rock"
                  className="bg-input border-border"
                />
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!artistName.trim()}
                className="w-full bg-primary text-primary-foreground"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: SoundCloud Connect */}
        {step === 2 && (
          <Card className="neon-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Cloud className="w-6 h-6 text-neon-cyan" />
                Connect SoundCloud
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Link your SoundCloud profile so we can automatically detect new
                releases and distribute them everywhere.
              </p>
              <div className="space-y-2">
                <Label htmlFor="soundcloudUrl">SoundCloud Profile URL</Label>
                <Input
                  id="soundcloudUrl"
                  value={soundcloudUrl}
                  onChange={(e) => setSoundcloudUrl(e.target.value)}
                  placeholder="https://soundcloud.com/your-profile"
                  className="bg-input border-border"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirm & Create */}
        {step === 3 && (
          <Card className="neon-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Radio className="w-6 h-6 text-neon-green" />
                Ready to Launch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon-green" />
                  <span className="text-sm">
                    Artist: <strong>{artistName}</strong>
                  </span>
                </div>
                {genre && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-green" />
                    <span className="text-sm">
                      Genre: <strong>{genre}</strong>
                    </span>
                  </div>
                )}
                {soundcloudUrl && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-green" />
                    <span className="text-sm">
                      SoundCloud: <strong>{soundcloudUrl}</strong>
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Your profile will be created and the SoundCloud monitor will start
                watching for new releases. Distribution begins automatically.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => {
                    createArtist.mutate({
                      name: artistName,
                      soundcloudUsername: soundcloudUrl
                        ? soundcloudUrl.replace(/^https?:\/\/(www\.)?soundcloud\.com\//i, "")
                        : undefined,
                    });
                  }}
                  disabled={createArtist.isPending}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  {createArtist.isPending ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Launch Distro Buzz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
