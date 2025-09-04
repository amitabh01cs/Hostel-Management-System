import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePageLogger } from "./hooks/usePageLogger"; // 👈 Add this import
import { getCurrentUser } from "./getUser"; // 👈 Add this import

// Core pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

// Module apps
// import Indexi from "@/module/HostelDashboard/client/src/Indexi";
import HostelStudentApp from "@/module/HostelStudentPortal/client/src/HostelStudentApp";
import SecurityDashboardApp from "@/module/SecurityDashboard/client/src/SecurityDashboardApp";

// Hostel Dashboard pages
import DashboardB from "@/module/HostelDashboard/client/src/pages/DashboardB";
import ChangePasswordA from "@/module/HostelDashboard/client/src/pages/ChangePassword";
import AddCourse from "@/module/HostelDashboard/client/src/pages/courses/AddCourse";
import ManageCourses from "@/module/HostelDashboard/client/src/pages/courses/ManageCourses";
import AddRoom from "@/module/HostelDashboard/client/src/pages/rooms/AddRoom";
import ManageRooms from "@/module/HostelDashboard/client/src/pages/rooms/ManageRooms";
import AddStudent from "@/module/HostelDashboard/client/src/pages/students/AddStudent";
import ManageStudents from "@/module/HostelDashboard/client/src/pages/students/ManageStudents";
import TakeAttendance from "@/module/HostelDashboard/client/src/pages/TakeAttendance";
import RequestLeave from "@/module/HostelDashboard/client/src/pages/RequestLeave";
import ComplaintBox from "@/module/HostelDashboard/client/src/pages/ComplaintBox";
import UserAccessLogs from "@/module/HostelDashboard/client/src/pages/UserAccessLogs";
import "@/module/HostelDashboard/client/src/index.css";

// Register Student
import Index from "@/module/RegisterStudent/src/pages/Index";
import "@/module/RegisterStudent/src/index.css";

// Hostel Student Portal
import Dashboard from "@/module/HostelStudentPortal/client/src/pages/Dashboard";
import GatePassForm from "@/module/GatePassPortal/client/src/pages/GatePassForm";
import LeaveStatus from "@/module/HostelStudentPortal/client/src/pages/LeaveStatus";
import ComplaintBoxS from "@/module/HostelStudentPortal/client/src/pages/ComplaintBox";
import AntiRagging from "@/module/HostelStudentPortal/client/src/pages/AntiRagging";
import ChangePassword from "@/module/HostelStudentPortal/client/src/pages/ChangePassword";
import "@/module/HostelStudentPortal/client/src/index.css";

// Room Manager
import HostelRoomManagement from "@/module/RoomManager/client/src/pages/HostelRoomManagement";
import "@/module/RoomManager/client/src/index.css";

// Security Dashboard
import SecurityDashboard from "@/module/SecurityDashboard/client/src/pages/security-dashboard";

// Admin Features
import AdminComplaintBox from "@/module/HostelDashboard/client/src/pages/AdminComplaintBox";
import AdminMedicalHistory from "@/module/HostelDashboard/client/src/pages/AdminMedicalHistory";
import AdminEmergencyReport from "@/module/HostelDashboard/client/src/pages/AdminEmergencyReport";

// Super Admin Features
import SuperAdminAdminComplaints from "@/module/HostelDashboard/client/src/pages/SuperAdminAdminComplaints";
import SuperAdminEmergencyReports from "@/module/HostelDashboard/client/src/pages/SuperAdminEmergencyReports";
import SuperAdminMedicalHistory from "@/module/HostelDashboard/client/src/pages/SuperAdminMedicalHistory";

// Global CSS
import "@/index.css";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/master/dashboard" component={DashboardB} />
      <Route path="/master/change-password" component={ChangePasswordA} />
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

      <Route path="/student/dashboard" component={Dashboard} />
      <Route path="/student/request-leave" component={GatePassForm} />
      <Route path="/leave-status" component={LeaveStatus} />
      <Route path="/complaints" component={ComplaintBoxS} />
      <Route path="/anti-ragging" component={AntiRagging} />
      <Route path="/student/change-password" component={ChangePassword} />

      <Route path="/security/dashboard" component={SecurityDashboard} />

      {/* <Route path="/dashboard/:rest*" component={Indexi} /> */}
      <Route path="/student/:rest*" component={HostelStudentApp} />
      <Route path="/security/:rest*" component={SecurityDashboardApp} />

      <Route path="/admin-complaint" component={AdminComplaintBox} />
      <Route path="/medical-history" component={AdminMedicalHistory} />
      <Route path="/emergency-report" component={AdminEmergencyReport} />

      <Route path="/superadmin/admin-complaints" component={SuperAdminAdminComplaints} />
      <Route path="/superadmin/emergency-reports" component={SuperAdminEmergencyReports} />
      <Route path="/superadmin/medical-history" component={SuperAdminMedicalHistory} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const user = getCurrentUser(); // 👈 Get the user object from localStorage (student, admin, or security)
  usePageLogger(user); // 👈 Log every page visit with user info

  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
