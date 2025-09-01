import { Route, Switch, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout2";
import DashboardB from "@/pages/DashboardB";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ChangePassword from "@/pages/ChangePassword";
import AddCourse from "@/pages/courses/AddCourse";
import ManageCourses from "@/pages/courses/ManageCourses";
import AddRoom from "@/pages/rooms/AddRoom";
// import HostelRoomManagement from "../../../RoomManager/RoomManager/client/src/pages/HostelRoomManagement";
import AddStudent from "@/pages/students/AddStudent";
import ManageStudents from "@/pages/students/ManageStudents";
import TakeAttendance from "@/pages/TakeAttendance";
//import GatePassForm from "../../../GatePassPortal/client/src/pages/GatePassForm";
import ComplaintBox from "@/pages/ComplaintBox";
import UserAccessLogs from "@/pages/UserAccessLogs";
import Index from "../../../RegisterStudent/src/pages/Index";
import "../../../RoomManager/RoomManager/client/src/index.css";
import "../../../RegisterStudent/src/index.css";
import RequestLeave from "@/pages/RequestLeave";


function Router() {//
  const [location] = useLocation();

  return (
    <Layout>
      <Switch>
        {/* <Route path="/" component={Dashboard} /> */}
        <Route path="/dashboardB" component={DashboardB} />
        <Route path="/change-password" component={ChangePassword} />
        <Route path="/courses/add" component={AddCourse} />
        <Route path="/courses/manage" component={ManageCourses} />
        <Route path="/rooms/add" component={AddRoom} />
        {/* <Route path="/rooms/manage" component={HostelRoomManagement} /> */}
        <Route path="/students/add" component={Index} /> 
        <Route path="/request-leave" component={RequestLeave} />
        <Route path="/students/manage" component={ManageStudents} />
        <Route path="/take-attendance" component={TakeAttendance} />
        <Route path="/take-attendance" component={TakeAttendance} />
        <Route path="/complaint-box" component={ComplaintBox} />
        <Route path="/user-access-logs" component={UserAccessLogs} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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


//<Route path="/request-leave" component={GatePassForm} /> 