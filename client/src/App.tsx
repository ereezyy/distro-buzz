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
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";
import Aggregators from "./pages/Aggregators";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ApiDocs from "./pages/ApiDocs";
import AdDashboard from "./pages/AdDashboard";
import OnboardingWizard from "./pages/OnboardingWizard";
import Pricing from "./pages/Pricing";
import Agent from "./pages/Agent";
import Gigs from "./pages/Gigs";
import Legal from "./pages/Legal";
import Media from "./pages/Media";
import Merch from "./pages/Merch";
import Checkout from "./pages/Checkout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/home" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/tracks" component={TrackLibrary} />
      <Route path="/platforms" component={PlatformRegistry} />
      <Route path="/logs/:jobId?" component={JobLogs} />
      <Route path="/onboarding" component={OnboardingWizard} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/admin" component={Admin} />
      <Route path="/aggregators" component={Aggregators} />
      <Route path="/api-docs" component={ApiDocs} />
      <Route path="/ad-dashboard" component={AdDashboard} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/agent" component={Agent} />
      <Route path="/gigs" component={Gigs} />
      <Route path="/legal" component={Legal} />
      <Route path="/media" component={Media} />
      <Route path="/merch" component={Merch} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/404" component={NotFound} />
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
