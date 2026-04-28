import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import TrackLibrary from "./pages/TrackLibrary";
import PlatformRegistry from "./pages/PlatformRegistry";
import JobLogs from "./pages/JobLogs";
import Onboarding from "./pages/Onboarding";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/tracks"} component={TrackLibrary} />
      <Route path={"/platforms"} component={PlatformRegistry} />
      <Route path={"/logs/:jobId?"} component={JobLogs} />
      <Route path={"/onboarding"} component={Onboarding} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
