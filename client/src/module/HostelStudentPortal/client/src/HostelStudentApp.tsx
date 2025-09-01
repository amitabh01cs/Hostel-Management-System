import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import LayoutS  from "./components/LayoutS";
import Dashboard from "./pages/Dashboard";
import GatePassForm from "../../../GatePassPortal/client/src/pages/GatePassForm";
import LeaveStatus from "./pages/LeaveStatus";
import ComplaintBox from "./pages/ComplaintBox";
import AntiRagging from "./pages/AntiRagging";
import ChangePassword from "./pages/ChangePassword";
import NotFound from "./pages/not-found";
import "../../../GatePassPortal/client/src/pages/GatePassForm";
import "./index.css";


function Router() {
  return (
    <LayoutS>
      <Switch>
        <Route path="/student/dashboard" component={Dashboard} />
        {/* <Route path="/" component={Dashboard} /> */}
        <Route path="/student/request-leave" component={GatePassForm} />
        <Route path="/leave-status" component={LeaveStatus} />
        <Route path="/complaints" component={ComplaintBox} />
        <Route path="/anti-ragging" component={AntiRagging} />
        <Route path="/student/change-password" component={ChangePassword} />
        <Route component={NotFound} />
      </Switch>
    </LayoutS>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
