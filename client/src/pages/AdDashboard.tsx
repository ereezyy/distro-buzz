import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign, Eye, MousePointerClick, TrendingUp, Plus } from "lucide-react";

export default function AdDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "placements" | "create">("overview");

  // Mock data
  const stats = {
    totalBudget: 1000,
    totalSpent: 275,
    remaining: 725,
    totalImpressions: 10000,
    totalClicks: 300,
    avgCTR: "3.0%",
    avgCPC: 0.92,
    activeCount: 3,
  };

  const placements = [
    {
      id: "ad_1",
      title: "Distro Buzz Pro",
      type: "banner",
      status: "active",
      budget: 500,
      spent: 125,
      impressions: 5000,
      clicks: 150,
      ctr: "3.0%",
      cpc: 0.83,
    },
    {
      id: "ad_2",
      title: "Featured Artist: Luna Echo",
      type: "featured_artist",
      status: "active",
      budget: 300,
      spent: 75,
      impressions: 3000,
      clicks: 90,
      ctr: "3.0%",
      cpc: 0.83,
    },
    {
      id: "ad_3",
      title: "Synthwave Vibes",
      type: "sponsored_recommendation",
      status: "active",
      budget: 200,
      spent: 75,
      impressions: 2000,
      clicks: 60,
      ctr: "3.0%",
      cpc: 1.25,
    },
  ];

  const performanceData = [
    { day: "Mon", impressions: 1200, clicks: 40, spent: 35 },
    { day: "Tue", impressions: 1500, clicks: 45, spent: 42 },
    { day: "Wed", impressions: 1800, clicks: 55, spent: 48 },
    { day: "Thu", impressions: 2000, clicks: 60, spent: 55 },
    { day: "Fri", impressions: 2200, clicks: 70, spent: 62 },
    { day: "Sat", impressions: 1900, clicks: 65, spent: 58 },
    { day: "Sun", impressions: 1400, clicks: 50, spent: 45 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Ad Dashboard</h1>
            <p className="text-slate-400 mt-2">Manage your ad placements and track performance</p>
          </div>
          <Button className="bg-neon-green text-black hover:bg-neon-green/90">
            <Plus className="w-4 h-4 mr-2" />
            New Ad
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-700">
          {["overview", "placements", "create"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === tab
                  ? "text-neon-green border-b-2 border-neon-green"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-6 border-slate-700 bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Budget Remaining</p>
                    <p className="text-3xl font-bold text-neon-green">${stats.remaining}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-neon-green opacity-50" />
                </div>
              </Card>

              <Card className="p-6 border-slate-700 bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Impressions</p>
                    <p className="text-3xl font-bold">{stats.totalImpressions.toLocaleString()}</p>
                  </div>
                  <Eye className="w-8 h-8 text-neon-cyan opacity-50" />
                </div>
              </Card>

              <Card className="p-6 border-slate-700 bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Clicks</p>
                    <p className="text-3xl font-bold">{stats.totalClicks}</p>
                  </div>
                  <MousePointerClick className="w-8 h-8 text-neon-pink opacity-50" />
                </div>
              </Card>

              <Card className="p-6 border-slate-700 bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Avg CTR</p>
                    <p className="text-3xl font-bold">{stats.avgCTR}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-neon-green opacity-50" />
                </div>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card className="p-6 border-slate-700 bg-slate-900/50">
              <h3 className="text-lg font-semibold mb-4">Weekly Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Legend />
                  <Line type="monotone" dataKey="impressions" stroke="#00ff88" strokeWidth={2} />
                  <Line type="monotone" dataKey="clicks" stroke="#00ffff" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* Placements Tab */}
        {activeTab === "placements" && (
          <div className="space-y-4">
            {placements.map((placement) => (
              <Card key={placement.id} className="p-6 border-slate-700 bg-slate-900/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{placement.title}</h3>
                    <p className="text-slate-400 text-sm">
                      {placement.type.replace("_", " ").toUpperCase()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    placement.status === "active"
                      ? "bg-neon-green/20 text-neon-green"
                      : "bg-slate-700 text-slate-300"
                  }`}>
                    {placement.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-6 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Budget</p>
                    <p className="font-semibold">${placement.budget}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Spent</p>
                    <p className="font-semibold">${placement.spent}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Impressions</p>
                    <p className="font-semibold">{placement.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Clicks</p>
                    <p className="font-semibold">{placement.clicks}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">CTR</p>
                    <p className="font-semibold text-neon-green">{placement.ctr}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">CPC</p>
                    <p className="font-semibold">${placement.cpc.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="border-slate-600">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-600">
                    Pause
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-600">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === "create" && (
          <Card className="p-8 border-slate-700 bg-slate-900/50">
            <h3 className="text-2xl font-semibold mb-6">Create New Ad Placement</h3>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Ad Type</label>
                  <select className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white">
                    <option>Banner Ad</option>
                    <option>Featured Artist</option>
                    <option>Sponsored Recommendation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Position</label>
                  <select className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white">
                    <option>Homepage Banner</option>
                    <option>Featured Artist Sidebar</option>
                    <option>Track Library Recommendation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Ad Title</label>
                <input
                  type="text"
                  placeholder="Enter ad title"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  placeholder="Enter ad description"
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Budget ($)</label>
                  <input
                    type="number"
                    placeholder="100"
                    min="10"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Target URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="bg-neon-green text-black hover:bg-neon-green/90">Create Ad</Button>
                <Button variant="outline" className="border-slate-600">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
