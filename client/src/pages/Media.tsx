import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image, Calendar, FileText, Upload, Eye } from "lucide-react";

export default function Media() {
  const [activeTab, setActiveTab] = useState("assets");

  const mediaAssets = [
    {
      id: 1,
      title: "Professional Headshot 2026",
      type: "photo",
      size: "2.4 MB",
      uploaded: "April 20, 2026",
      compliance: "approved",
    },
    {
      id: 2,
      title: "Live Performance Video",
      type: "video",
      size: "145 MB",
      uploaded: "April 15, 2026",
      compliance: "approved",
    },
    {
      id: 3,
      title: "Artist Bio (Updated)",
      type: "document",
      size: "0.3 MB",
      uploaded: "April 25, 2026",
      compliance: "approved",
    },
    {
      id: 4,
      title: "Album Artwork",
      type: "photo",
      size: "3.1 MB",
      uploaded: "April 10, 2026",
      compliance: "needs_review",
    },
  ];

  const pressKit = {
    name: "Artist Name",
    bio: "Award-winning electronic music producer with 5M+ streams across platforms.",
    genres: ["Electronic", "Synthwave", "Ambient"],
    socials: {
      instagram: "@artistname",
      twitter: "@artistname",
      spotify: "artistname",
    },
  };

  const contentCalendar = [
    { date: "May 1", content: "New single release", platform: "All" },
    { date: "May 5", content: "Behind-the-scenes video", platform: "Instagram" },
    { date: "May 10", content: "Live stream performance", platform: "Twitch" },
    { date: "May 15", content: "Festival announcement", platform: "All" },
  ];

  const getComplianceColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      case "needs_review":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      default:
        return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-foreground">Media Management</h1>
        <p className="text-muted-foreground mt-2">Press kit, assets, and content calendar</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {["assets", "press_kit", "calendar"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "assets" ? "Media Assets" : tab === "press_kit" ? "Press Kit" : "Content Calendar"}
          </button>
        ))}
      </div>

      {/* Media Assets */}
      {activeTab === "assets" && (
        <div className="space-y-4">
          {mediaAssets.map((asset) => (
            <Card key={asset.id} className="glass border-0">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      {asset.type === "photo" && <Image className="w-6 h-6 text-accent opacity-60" />}
                      {asset.type === "video" && <Eye className="w-6 h-6 text-accent opacity-60" />}
                      {asset.type === "document" && <FileText className="w-6 h-6 text-accent opacity-60" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{asset.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{asset.size}</span>
                        <span>{asset.uploaded}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`border ${getComplianceColor(asset.compliance)}`}>
                      {asset.compliance === "approved" ? "Approved" : "Review"}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 text-xs h-8">
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <Upload className="w-4 h-4 mr-2" />
            Upload New Asset
          </Button>
        </div>
      )}

      {/* Press Kit */}
      {activeTab === "press_kit" && (
        <div className="space-y-6">
          <Card className="glass border-0">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg">Press Kit Information</CardTitle>
              <CardDescription>Your public-facing artist profile</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Artist Name</label>
                <p className="text-foreground bg-secondary/30 rounded-lg px-4 py-2">{pressKit.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                <p className="text-foreground bg-secondary/30 rounded-lg px-4 py-3">{pressKit.bio}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Genres</label>
                <div className="flex gap-2 flex-wrap">
                  {pressKit.genres.map((genre) => (
                    <Badge key={genre} variant="outline" className="border-border text-foreground">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Social Links</label>
                <div className="space-y-2">
                  {Object.entries(pressKit.socials).map(([platform, handle]) => (
                    <div key={platform} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border">
                      <span className="text-sm text-muted-foreground capitalize">{platform}</span>
                      <span className="text-foreground font-medium">{handle}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Edit Press Kit
              </Button>
            </CardContent>
          </Card>

          <Card className="glass border-0">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg">Download Press Kit</CardTitle>
              <CardDescription>Share with media and venues</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Button variant="outline" className="border-border text-foreground hover:bg-secondary flex-1">
                  PDF
                </Button>
                <Button variant="outline" className="border-border text-foreground hover:bg-secondary flex-1">
                  ZIP (with assets)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Calendar */}
      {activeTab === "calendar" && (
        <div className="space-y-4">
          {contentCalendar.map((item, idx) => (
            <Card key={idx} className="glass border-0">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-accent opacity-60" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.content}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.date}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-border text-foreground">
                    {item.platform}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            Schedule New Post
          </Button>
        </div>
      )}
    </div>
  );
}
