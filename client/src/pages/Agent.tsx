import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageSquare, Zap, TrendingUp, Clock, CheckCircle2, Send } from "lucide-react";

export default function Agent() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "agent", content: "I'm your AI talent agent. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { role: "user", content: input }]);
    
    setTimeout(() => {
      const responses = [
        "I found 3 new opportunities matching your profile.",
        "Your last negotiation increased rates by 15%.",
        "I've scheduled follow-up calls for tomorrow.",
        "Your brand compliance score is 94%.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [...prev, { role: "agent", content: randomResponse }]);
    }, 500);
    
    setInput("");
  };

  const mockTasks = [
    { id: 1, title: "Follow up with The Bash booking", status: "pending", dueDate: "Today" },
    { id: 2, title: "Negotiate rate for festival gig", status: "in_progress", dueDate: "Tomorrow" },
    { id: 3, title: "Review contract for brand deal", status: "pending", dueDate: "In 2 days" },
  ];

  const mockMetrics = [
    { label: "Gigs Discovered", value: "24", icon: Zap },
    { label: "Success Rate", value: "68%", icon: TrendingUp },
    { label: "Avg Response Time", value: "2.3h", icon: Clock },
    { label: "Bookings Closed", value: "8", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-foreground">AI Talent Agent</h1>
        <p className="text-muted-foreground mt-2">Your personal booking & negotiation assistant</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="glass h-[600px] flex flex-col border-0">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5 text-accent" />
                Agent Chat
              </CardTitle>
              <CardDescription>Discuss gigs, rates, and opportunities</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4 mb-4 py-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                      msg.role === "user"
                        ? "bg-accent/10 text-foreground border border-accent/20"
                        : "bg-secondary text-foreground border border-border"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="border-t border-border p-4 flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          {mockMetrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <Card key={idx} className="glass border-0">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">{metric.label}</p>
                      <p className="text-2xl font-semibold text-foreground mt-1">{metric.value}</p>
                    </div>
                    <Icon className="w-6 h-6 text-accent opacity-40" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Task Queue */}
      <Card className="glass border-0">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg">Pending Tasks</CardTitle>
          <CardDescription>Actions requiring your attention</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {mockTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-foreground text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{task.dueDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={
                      task.status === "pending"
                        ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                    }
                  >
                    {task.status === "pending" ? "Pending" : "In Progress"}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 text-xs h-8">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-0 hover-lift cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">Make Outreach Call</p>
                <p className="text-xs text-muted-foreground mt-1">Contact venues & bookers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0 hover-lift cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">Discover Gigs</p>
                <p className="text-xs text-muted-foreground mt-1">Scan all platforms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0 hover-lift cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">View Performance</p>
                <p className="text-xs text-muted-foreground mt-1">See your stats</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
