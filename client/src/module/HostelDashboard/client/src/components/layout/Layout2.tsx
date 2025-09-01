import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import Header from "./Header";

type LayoutProps = {
  children: React.ReactNode;
};

const pageTitles: Record<string, string> = {
  "/master/dashboard": "Dashboard",
  "/dashboard": "Dashboard",
  "/master/change-password": "Change Password",
  "/courses/add": "Add Course",
  "/courses/manage": "Manage Courses",
  "/rooms/add": "Add Room",
  "/rooms/manage": "Manage Rooms",
  "/students/add": "Add Student",
  "/students/manage": "Manage Students",
  "/take-attendance": "Take Attendance",
  "/request-leave": "Leave Requests",
  "/complaint-box": "Complaint Box",
  "/user-access-logs": "User Access Logs",
  "/hostels/add": "Add Hostel",
  "/admins/add": "Add Admin",
  "/security/add": "Add Security",
  "/ragging-complaints": "Ragging Complaints",
  "/superadmin/admin-complaints": "Admin Complaints",
  "/superadmin/emergency-reports": "Emergency Reports",
  "/superadmin/medical-history": "Medical History",
  "/admin-complaint": "Admin Complaint",
  "/medical-history": "Medical History",
  "/emergency-report": "Emergency Report",
};

const Layout2 = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Close sidebar on mobile when location changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const pageTitle = pageTitles[location] || "Not Found";

  return (
    <div className="h-screen flex flex-col">
      {/* Sidebar: always visible on desktop, toggled on mobile */}
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content area */}
      <div className="flex-1 md:ml-64 flex flex-col overflow-hidden">
        <Header title={pageTitle} onHamburger={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout2;