import { Route, Switch, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "../src/components/ui/toaster";
import { TooltipProvider } from "../src/components/ui/tooltip";
import NotFound from "../src/pages/not-found";
import Layout2 from "./components/layout/Layout2";
import DashboardB from "../src/pages/DashboardB";
import ChangePasswordA from "../src/pages/ChangePassword";
import AddCourse from "../src/pages/courses/AddCourse";
import ManageCourses from "../src/pages/courses/ManageCourses";
import AddRoom from "../src/pages/rooms/AddRoom";
import ManageRooms from "../src/pages/rooms/ManageRooms";
import AddStudent from "@/pages/students/AddStudent";
import ManageStudents from "../src/pages/students/ManageStudents";
import TakeAttendance from "../src/pages/TakeAttendance";
import RequestLeave from "../src/pages/RequestLeave";
import ComplaintBox from "../src/pages/ComplaintBox";
import UserAccessLogs from "../src/pages/UserAccessLogs";
import "../src/index.css";
import Index from "../../../RegisterStudent/src/pages/Index";
import "../../../RegisterStudent/src/index.css"; // Import RegisterStudent styles
import HostelRoomManagement from "../../../RoomManager/client/src/pages/HostelRoomManagement";
import "../../../RoomManager/client/src/index.css";
// // import "../../../RoomManager/RoomManager/client/src/index.css"; 

function Router() {
  const [location] = useLocation();

  return (
    <Layout2>
      <Switch>
        {/* <Route path="/" component={Dashboard} /> */}
        <Route path="master/dashboard" component={DashboardB} />
        <Route path="master/change-password" component={ChangePasswordA} />
        <Route path="/courses/add" component={AddCourse} />
        <Route path="/courses/manage" component={ManageCourses} />
        <Route path="/rooms/add" component={AddRoom} />
        <Route path="/rooms/manage" component={HostelRoomManagement} />
        <Route path="/students/add" component={Index} />
        <Route path="/students/manage" component={ManageStudents} />
        <Route path="/take-attendance" component={TakeAttendance} />
        <Route path="/request-leave" component={RequestLeave} />
        <Route path="/complaint-box" component={ComplaintBox} />
        <Route path="/user-access-logs" component={UserAccessLogs} />
        <Route component={NotFound} />
      </Switch>
    </Layout2>
  );
}

function Indexi() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default Indexi;
