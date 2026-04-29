import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function Legal() {
  const [activeTab, setActiveTab] = useState("dmca");

  const dmcaCases = [
    {
      id: 1,
      title: "Unauthorized use on TikTok",
      status: "resolved",
      filed: "March 15, 2026",
      resolved: "April 2, 2026",
      platform: "TikTok",
    },
    {
      id: 2,
      title: "Copyright claim on YouTube",
      status: "pending",
      filed: "April 20, 2026",
      platform: "YouTube",
    },
    {
      id: 3,
      title: "Sampling without permission",
      status: "investigating",
      filed: "April 25, 2026",
      platform: "Spotify",
    },
  ];

  const contracts = [
    {
      id: 1,
      title: "Festival Performance Agreement",
      type: "Performance",
      status: "signed",
      date: "April 10, 2026",
    },
    {
      id: 2,
      title: "Brand Collaboration Contract",
      type: "Endorsement",
      status: "pending_review",
      date: "April 28, 2026",
    },
    {
      id: 3,
      title: "Venue Residency Agreement",
      type: "Residency",
      status: "draft",
      date: "May 1, 2026",
    },
  ];

  const copyrightFilings = [
    {
      id: 1,
      title: "Original Compositions (2024)",
      status: "registered",
      date: "January 15, 2025",
      works: 12,
    },
    {
      id: 2,
      title: "Original Compositions (2025)",
      status: "pending",
      date: "April 20, 2026",
      works: 8,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
      case "signed":
      case "registered":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      case "pending":
      case "pending_review":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "investigating":
      case "draft":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      default:
        return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-foreground">Legal Protection</h1>
        <p className="text-muted-foreground mt-2">DMCA, copyright, and contract management</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-0">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">DMCA Cases</p>
                <p className="text-2xl font-semibold text-foreground mt-1">3</p>
                <p className="text-xs text-muted-foreground mt-2">1 resolved, 2 active</p>
              </div>
              <Shield className="w-6 h-6 text-accent opacity-40" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Copyrights Filed</p>
                <p className="text-2xl font-semibold text-foreground mt-1">20</p>
                <p className="text-xs text-muted-foreground mt-2">2 registrations</p>
              </div>
              <FileText className="w-6 h-6 text-accent opacity-40" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active Contracts</p>
                <p className="text-2xl font-semibold text-foreground mt-1">3</p>
                <p className="text-xs text-muted-foreground mt-2">1 pending review</p>
              </div>
              <FileText className="w-6 h-6 text-accent opacity-40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {["dmca", "copyright", "contracts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "dmca" ? "DMCA Takedowns" : tab === "copyright" ? "Copyright Filings" : "Contracts"}
          </button>
        ))}
      </div>

      {/* DMCA Cases */}
      {activeTab === "dmca" && (
        <div className="space-y-4">
          {dmcaCases.map((case_) => (
            <Card key={case_.id} className="glass border-0">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{case_.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{case_.platform}</p>
                  </div>
                  <Badge variant="outline" className={`border ${getStatusColor(case_.status)}`}>
                    {case_.status.charAt(0).toUpperCase() + case_.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Filed: {case_.filed}</span>
                  {case_.resolved && <span>Resolved: {case_.resolved}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            File New DMCA Notice
          </Button>
        </div>
      )}

      {/* Copyright Filings */}
      {activeTab === "copyright" && (
        <div className="space-y-4">
          {copyrightFilings.map((filing) => (
            <Card key={filing.id} className="glass border-0">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{filing.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{filing.works} works</p>
                  </div>
                  <Badge variant="outline" className={`border ${getStatusColor(filing.status)}`}>
                    {filing.status.charAt(0).toUpperCase() + filing.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Filed: {filing.date}</p>
              </CardContent>
            </Card>
          ))}
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            Register New Copyright
          </Button>
        </div>
      )}

      {/* Contracts */}
      {activeTab === "contracts" && (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <Card key={contract.id} className="glass border-0">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{contract.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{contract.type}</p>
                  </div>
                  <Badge variant="outline" className={`border ${getStatusColor(contract.status)}`}>
                    {contract.status.replace(/_/g, " ").charAt(0).toUpperCase() + contract.status.replace(/_/g, " ").slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{contract.date}</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 text-xs h-8">
                      View
                    </Button>
                    {contract.status === "draft" && (
                      <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 text-xs h-8">
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            Generate Contract
          </Button>
        </div>
      )}

      {/* Brand Protection Score */}
      <Card className="glass border-0">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg">Brand Protection Score</CardTitle>
          <CardDescription>Your intellectual property safety rating</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Overall Protection</span>
                <span className="text-lg font-semibold text-green-600">92%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "92%" }}></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Copyrights Registered</p>
                <p className="font-semibold text-foreground mt-1">20/20</p>
              </div>
              <div>
                <p className="text-muted-foreground">Contracts Reviewed</p>
                <p className="font-semibold text-foreground mt-1">3/3</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
