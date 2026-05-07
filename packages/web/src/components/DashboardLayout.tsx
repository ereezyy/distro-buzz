import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { LayoutDashboard, Music2, Radio, ScrollText, ChartBar as BarChart2, Settings, LogOut, Zap, Menu, Megaphone, BookOpen, Link2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Track Library", path: "/tracks", icon: Music2 },
  { label: "Platforms", path: "/platforms", icon: Radio },
  { label: "Aggregators", path: "/aggregators", icon: Link2 },
  { label: "Job Logs", path: "/logs", icon: ScrollText },
  { label: "Analytics", path: "/analytics", icon: BarChart2 },
  { label: "Ad Dashboard", path: "/ad-dashboard", icon: Megaphone },
  { label: "API Docs", path: "/api-docs", icon: BookOpen },
  { label: "Admin", path: "/admin", icon: Settings, adminOnly: true },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const nav = (
    <nav className="flex flex-col gap-1 flex-1">
      {NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "admin").map((item) => {
        const Icon = item.icon;
        const active = location === item.path || location.startsWith(item.path + "/");
        return (
          <button
            key={item.path}
            onClick={() => {
              setLocation(item.path);
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              active
                ? "bg-primary/15 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );

  const sidebar = (
    <aside className="w-60 shrink-0 flex flex-col h-full border-r border-border bg-card/50">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
        <Zap className="w-5 h-5 text-neon-green" />
        <span className="font-bold text-sm neon-glow">Distro Buzz</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {nav}
      </div>

      <div className="border-t border-border px-3 py-4 space-y-1">
        {user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium truncate">{user.name || user.email}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-60 h-screen sticky top-0">
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-60 flex flex-col">
            {sidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-neon-green" />
            <span className="font-bold text-sm">Distro Buzz</span>
          </div>
        </div>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
