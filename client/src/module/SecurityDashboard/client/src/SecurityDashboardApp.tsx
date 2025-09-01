import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import SecurityDashboard from "./pages/security-dashboard";
import NotFound from "./pages/not-found";
// import "./index.css"; // Import global styles
// Import any additional styles needed for the SecurityDashboard module
function Router() {
  return (
    <Switch>
      <Route path="/security/dashboard" component={SecurityDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function SecurityDashboardApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default SecurityDashboardApp;
