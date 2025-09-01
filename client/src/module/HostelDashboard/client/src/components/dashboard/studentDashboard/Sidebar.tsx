import { useState } from "react";
import { Link, useLocation } from "wouter";

import {
  BarChart3,
  User,
  LockKeyhole,
  BookOpen,
  Home,
  CalendarCheck,
  ClipboardCheck,
  Inbox,
  History,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import headerImage from "@assets/header.png";
import { cn } from "@/lib/utils";

type SidebarLinkProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
};

const SidebarLink = ({ href, label, icon, isActive }: SidebarLinkProps) => (
  <Link href={href}>
    <a className={cn("sidebar-item", isActive && "active")}>
      <span className="sidebar-item-icon">{icon}</span>
      <span>{label}</span>
    </a>
  </Link>
);

type SidebarDropdownProps = {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isAnyChildActive: boolean;
};

const SidebarDropdown = ({ label, icon, children, isAnyChildActive }: SidebarDropdownProps) => {
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

const Sidebar = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const isChildActive = (paths: string[]) => {
    return paths.some(path => location === path);
  };

  return (
    <aside className="w-64 border-r border-gray-200 bg-sidebar fixed inset-y-0 left-0 z-20 hidden md:flex flex-col">
      {/* Header with logo */}
      <div className="p-4 border-b border-gray-200">
        <img src={headerImage} alt="Hostel Management" className="h-auto w-full" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <SidebarLink
          href="/"
          label="Dashboard"
          icon={<BarChart3 />}
          isActive={isActive("/") || isActive("/dashboard")}
        />
        
        {/* <SidebarLink
          href="/change-password"
          label="Change Password"
          icon={<LockKeyhole />}
          isActive={isActive("/change-password")}
        />
         */}
        {/* <SidebarDropdown
          label="Courses"
          icon={<BookOpen />}
          isAnyChildActive={isChildActive(["/courses/add", "/courses/manage"])}
        >
          <Link href="/courses/add">
            <a className={cn("sidebar-dropdown-item", isActive("/courses/add") && "active")}>
              Add Course
            </a>
          </Link>
          <Link href="/courses/manage">
            <a className={cn("sidebar-dropdown-item", isActive("/courses/manage") && "active")}>
              Manage Courses
            </a>
          </Link>
        </SidebarDropdown> */}
{/*         
        <SidebarDropdown
          label="Rooms"
          icon={<Home />}
          isAnyChildActive={isChildActive(["/rooms/add", "/rooms/manage"])}
        >
          <Link href="/rooms/add">
            <a className={cn("sidebar-dropdown-item", isActive("/rooms/add") && "active")}>
              Add Room
            </a>
          </Link>
          <Link href="/rooms/manage">
            <a className={cn("sidebar-dropdown-item", isActive("/rooms/manage") && "active")}>
              Manage Rooms
            </a>
          </Link>
        </SidebarDropdown> */}
        
        {/* <SidebarDropdown
          label="Manage Students"
          icon={<User />}
          isAnyChildActive={isChildActive(["/students/add", "/students/manage"])}
        >
          <Link href="/students/add">
            <a className={cn("sidebar-dropdown-item", isActive("/students/add") && "active")}>
              Add Student
            </a>
          </Link>
          <Link href="/students/manage">
            <a className={cn("sidebar-dropdown-item", isActive("/students/manage") && "active")}>
              Manage Students
            </a>
          </Link>
        </SidebarDropdown>
         */}
        {/* <SidebarLink
          href="/take-attendance"
          label="Take Attendance"
          icon={<ClipboardCheck />}
          isActive={isActive("/take-attendance")}
        />
         */}
        <SidebarLink
          href="/request-leave"
          label="Request Leave"
          icon={<CalendarCheck />}
          isActive={isActive("/request-leave")}
        />
        
        <SidebarLink
          href="/complaint-box"
          label="Complaint Box"
          icon={<Inbox />}
          isActive={isActive("/complaint-box")}
        />
        
        {/* <SidebarLink
          href="/user-access-logs"
          label="User Access Logs"
          icon={<History />}
          isActive={isActive("/user-access-logs")}
        /> */}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-200">
        <button 
          className="sidebar-item text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => {
            // Show logout confirmation dialog
            if (window.confirm("Are you sure you want to log out?")) {
              // Handle logout logic here
              console.log("User logged out");
              window.location.href = "/";
            }
          }}
        >
          <span className="sidebar-item-icon"><LogOut /></span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
