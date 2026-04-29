import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign, Star, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Gigs() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const mockGigs = [
    {
      id: 1,
      title: "Weekend Festival Headliner",
      venue: "Sunset Sound Festival",
      location: "Los Angeles, CA",
      date: "May 15, 2026",
      rate: "$2,500",
      relevance: 95,
      status: "interested",
      description: "2-hour set at major music festival",
    },
    {
      id: 2,
      title: "Corporate Event Performance",
      venue: "Tech Summit 2026",
      location: "San Francisco, CA",
      date: "May 20, 2026",
      rate: "$1,500",
      relevance: 82,
      status: "new",
      description: "Live performance for 500+ attendees",
    },
    {
      id: 3,
      title: "Venue Residency (4 weeks)",
      venue: "The Fonda Theatre",
      location: "Los Angeles, CA",
      date: "June 1-30, 2026",
      rate: "$3,000/month",
      relevance: 88,
      status: "negotiating",
      description: "Weekly Thursday night residency",
    },
    {
      id: 4,
      title: "Brand Collaboration Performance",
      venue: "Nike Pop-up Event",
      location: "New York, NY",
      date: "May 25, 2026",
      rate: "$2,000 + merch",
      relevance: 76,
      status: "new",
      description: "Live performance + social media content",
    },
  ];

  const filteredGigs = mockGigs.filter((gig) => {
    const matchesFilter = filter === "all" || gig.status === filter;
    const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gig.venue.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getRelevanceColor = (score: number) => {
    if (score >= 85) return "bg-green-500/10 text-green-600 border-green-500/30";
    if (score >= 70) return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "interested":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "negotiating":
        return "bg-accent/10 text-accent border-accent/30";
      default:
        return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-foreground">Gig Discovery</h1>
        <p className="text-muted-foreground mt-2">AI-curated opportunities from 8 sources</p>
      </div>

      {/* Search & Filter */}
      <Card className="glass border-0">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search gigs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-2">
              {["all", "new", "interested", "negotiating"].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className={
                    filter === status
                      ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                      : "border-border text-foreground hover:bg-secondary"
                  }
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gigs List */}
      <div className="space-y-4">
        {filteredGigs.map((gig) => (
          <Card key={gig.id} className="glass border-0 hover-lift">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-foreground">{gig.title}</h3>
                    <Badge variant="outline" className={`border ${getStatusColor(gig.status)}`}>
                      {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{gig.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-accent opacity-60" />
                      <span className="text-foreground">{gig.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-accent opacity-60" />
                      <span className="text-foreground">{gig.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-500 opacity-60" />
                      <span className="text-green-600 font-medium">{gig.rate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 opacity-60" />
                      <span className="text-foreground">{gig.relevance}% Match</span>
                    </div>
                  </div>

                  <Badge variant="outline" className={`border ${getRelevanceColor(gig.relevance)}`}>
                    Relevance: {gig.relevance}%
                  </Badge>
                </div>

                <div className="flex flex-col gap-2 md:w-40">
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm">
                    View Details
                  </Button>
                  <Button variant="outline" className="border-border text-foreground hover:bg-secondary text-sm">
                    {gig.status === "interested" ? "Message" : "Mark Interested"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar View */}
      <Card className="glass border-0">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg">Upcoming Schedule</CardTitle>
          <CardDescription>Your booked and pending gigs</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {mockGigs
              .filter((g) => g.status === "interested" || g.status === "negotiating")
              .map((gig) => (
                <div key={gig.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-foreground text-sm">{gig.date}</p>
                    <p className="text-xs text-muted-foreground mt-1">{gig.title}</p>
                  </div>
                  <p className="text-green-600 font-medium text-sm">{gig.rate}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
