import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-black text-neon-green/20">404</h1>
        <h2 className="text-2xl font-bold">Page Not Found</h2>
        <p className="text-slate-400">The page you're looking for doesn't exist.</p>
        <Button onClick={() => setLocation("/")}>Go Home</Button>
      </div>
    </div>
  );
}
