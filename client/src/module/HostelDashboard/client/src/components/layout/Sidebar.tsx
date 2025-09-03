import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  BarChart3, User, BookOpen, Home, CalendarCheck, ClipboardCheck,
  Inbox, History, LogOut, ChevronDown, ChevronRight, PlusCircle, UserPlus,
  Shield, AlertTriangle, Stethoscope, Mic,
  X
} from "lucide-react";
import headerImage from "@assets/header.png";
import { cn } from "@/lib/utils";

// <<<<<<< Logger ka import hata diya gaya hai

const SidebarLink = ({ href, label, icon, isActive, onClick }) => (
  <Link href={href} className={cn("sidebar-item", isActive && "active")} onClick={onClick}>
    <span className="sidebar-item-icon">{icon}</span>
    <span>{label}</span>
  </Link>
);

const SidebarDropdown = ({ label, icon, children, isAnyChildActive }) => {
  const [isOpen, setIsOpen] = useState(isAnyChildActive);
  return (
    <div>
      <button
        className={cn("sidebar-item justify-between", isAnyChildActive && "active")}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <span className="sidebar-item-icon">{icon}</span>
          <span>{label}</span>
        </div>
        <span className="text-gray-500">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
      </button>
      <div className={cn("sidebar-dropdown", !isOpen && "hidden")}>{children}</div>
    </div>
  );
};

const Sidebar = ({ mobileOpen = false, setMobileOpen }) => {
  const [location] = useLocation();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    try {
      const adminUser = JSON.parse(localStorage.getItem("adminUser"));
      if (adminUser && (adminUser.adminType === "SuperAdmin" || adminUser.type === "SuperAdmin")) {
        setIsSuperAdmin(true);
      } else {
        setIsSuperAdmin(false);
      }
    } catch (e) {
      setIsSuperAdmin(false);
    }
  }, []);

  const isActive = (path) => location === path;
  const isChildActive = (paths) => paths.some((path) => location === path);

  const sidebarContent = (onLinkClick) => (
    <>
      <div className="p-4 border-b border-gray-200">
        <img src={headerImage} alt="Hostel Management" className="h-auto w-full" />
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <SidebarLink
          href="/master/dashboard"
          label="Dashboard"
          icon={<BarChart3 />}
          isActive={isActive("/master/dashboard")}
          onClick={onLinkClick}
        />
        {isSuperAdmin && (
          <>
            <SidebarDropdown
              label="Courses"
              icon={<BookOpen />}
              isAnyChildActive={isChildActive(["/courses/add", "/courses/manage"])}
            >
              <Link href="/courses/add" className={cn("sidebar-dropdown-item", isActive("/courses/add") && "active")} onClick={onLinkClick}>
                Add Course
              </Link>
              <Link href="/courses/manage" className={cn("sidebar-dropdown-item", isActive("/courses/manage") && "active")} onClick={onLinkClick}>
                Manage Courses
              </Link>
            </SidebarDropdown>
            <SidebarDropdown
              label="Rooms"
              icon={<Home />}
              isAnyChildActive={isChildActive(["/rooms/add", "/rooms/manage"])}
            >
              <Link href="/rooms/add" className={cn("sidebar-dropdown-item", isActive("/rooms/add") && "active")} onClick={onLinkClick}>
                Add Room
              </Link>
              <Link href="/rooms/manage" className={cn("sidebar-dropdown-item", isActive("/rooms/manage") && "active")} onClick={onLinkClick}>
                Manage Rooms
              </Link>
            </SidebarDropdown>
            <SidebarDropdown
              label="Manage Students"
              icon={<User />}
              isAnyChildActive={isChildActive(["/students/add", "/students/manage"])}
            >
              <Link href="/students/add" className={cn("sidebar-dropdown-item", isActive("/students/add") && "active")} onClick={onLinkClick}>
                Add Student
              </Link>
              <Link href="/students/manage" className={cn("sidebar-dropdown-item", isActive("/students/manage") && "active")} onClick={onLinkClick}>
                Manage Students
              </Link>
            </SidebarDropdown>

            {/* <<<<<<< Activity Log ka link yahan se hata diya gaya hai */}
            
            <div className="mt-4 mb-2 text-xs text-gray-400 font-semibold px-2">Super Admin</div>
            <SidebarLink
              href="/hostels/add"
              label="Add Hostel"
              icon={<PlusCircle />}
              isActive={isActive("/hostels/add")}
              onClick={onLinkClick}
            />
            <SidebarLink
              href="/admins/add"
              label="Add Admin"
              icon={<UserPlus />}
              isActive={isActive("/admins/add")}
              onClick={onLinkClick}
            />
            <SidebarLink
              href="/security/add"
              label="Add Security"
              icon={<Shield />}
              isActive={isActive("/security/add")}
              onClick={onLinkClick}
            />
            <SidebarLink
              href="/ragging-complaints"
              label="Ragging Complaints"
              icon={<AlertTriangle />}
              isActive={isActive("/ragging-complaints")}
              onClick={onLinkClick}
            />
            <SidebarLink
              href="/superadmin/admin-complaints"
              label="Admin Complaints"
              icon={<Shield />}
              isActive={isActive("/superadmin/admin-complaints")}
              onClick={onLinkClick}
            />
            <SidebarLink
              href="/superadmin/emergency-reports"
              label="Emergency Reports"
              icon={<Mic />}
              isActive={isActive("/superadmin/emergency-reports")}
              onClick={onLinkClick}
            />
            <SidebarLink
              href="/superadmin/medical-history"
              label="Medical History"
              icon={<Stethoscope />}
              isActive={isActive("/superadmin/medical-history")}
              onClick={onLinkClick}
            />
          </>
        )}
        {!isSuperAdmin && (
          <>
            <SidebarDropdown
              label="Rooms"
              icon={<Home />}
              isAnyChildActive={isChildActive(["/rooms/add", "/rooms/manage"])}
            >
              <Link href="/rooms/add" className={cn("sidebar-dropdown-item", isActive("/rooms/add") && "active")} onClick={onLinkClick}>
                Add Room
              </Link>
              <Link href="/rooms/manage" className={cn("sidebar-dropdown-item", isActive("/rooms/manage") && "active")} onClick={onLinkClick}>
                Manage Rooms
              </Link>
            </SidebarDropdown>
            <SidebarDropdown
              label="Manage Students"
              icon={<User />}
              isAnyChildActive={isChildActive(["/students/add", "/students/manage"])}
            >
              <Link href="/students/add" className={cn("sidebar-dropdown-item", isActive("/students/add") && "active")} onClick={onLinkClick}>
                Add Student
              </Link>
              <Link href="/students/manage" className={cn("sidebar-dropdown-item", isActive("/students/manage") && "active")} onClick={onLinkClick}>
                Manage Students
              </Link>
            </SidebarDropdown>
            <SidebarLink
              href="/take-attendance"
              label="Take Attendance"
              icon={<ClipboardCheck />}
              isActive={isActive("/take-attendance")}
              onClick={onLinkClick}
            />
            <SidebarLink
              href="/request-leave"
              label="Request Leave"
              icon={<CalendarCheck />}
              isActive={isActive("/request-leave")}
              onClick={onLinkClick}
            />
            <SidebarLink
              href="/complaint-box"
              label="Complaint Box"
              icon={<Inbox />}
              isActive={isActive("/complaint-box")}
              onClick={onLinkClick}
            />
            <SidebarLink
              href="/admin-complaint"
              label="Admin Complaint"
              icon={<Shield />}
              isActive={isActive("/admin-complaint")}
              onClick={onLinkClick}
            />
            <SidebarLink
              href="/medical-history"
              label="Medical History"
              icon={<Stethoscope />}
              isActive={isActive("/medical-history")}
              onClick={onLinkClick}
            />
            <SidebarLink
              href="/emergency-report"
              label="Emergency Report"
              icon={<Mic />}
              isActive={isActive("/emergency-report")}
              onClick={onLinkClick}
            />
            
            {/* <<<<<<< Activity Log ka link yahan se bhi hata diya gaya hai */}
          </>
        )}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          className="sidebar-item text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => {
            if (window.confirm("Are you sure you want to log out?")) {
              // <<<<<<< Logout tracking hata di gayi hai
              localStorage.clear();
              window.location.href = "/";
            }
          }}
        >
          <span className="sidebar-item-icon"><LogOut /></span>
          <span>Log Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="w-64 border-r border-gray-200 bg-sidebar fixed inset-y-0 left-0 z-20 hidden md:flex flex-col">
        {sidebarContent()}
      </aside>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar shadow-lg border-r transform transition-transform duration-200 ease-in-out md:hidden flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button className="absolute top-4 right-4" onClick={() => setMobileOpen(false)}>
          <X className="w-6 h-6" />
        </button>
        {sidebarContent(() => setMobileOpen(false))}
      </aside>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
