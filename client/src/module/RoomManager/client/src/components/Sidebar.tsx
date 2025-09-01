import { useLocation, Link } from "wouter";
import {
  Building,
  LayoutDashboard,
  Users,
  DoorClosed,
  CalendarCheck,
  FileText,
  Settings,
  LogOut
} from "lucide-react";


const Sidebar = () => {
  const [location] = useLocation();


  const isActive = (path: string) => {
    return location === path;
  };


  const menuItems = [
    { path: "/", icon: <LayoutDashboard className="mr-3 h-5 w-5" />, label: "Dashboard" },
    { path: "/room-allocation", icon: <Building className="mr-3 h-5 w-5" />, label: "Room Allocation" },
    { path: "/manage-students", icon: <Users className="mr-3 h-5 w-5" />, label: "Manage Students" },
    { path: "/manage-rooms", icon: <DoorClosed className="mr-3 h-5 w-5" />, label: "Manage Rooms" },
    { path: "/attendance", icon: <CalendarCheck className="mr-3 h-5 w-5" />, label: "Attendance" },
    { path: "/reports", icon: <FileText className="mr-3 h-5 w-5" />, label: "Reports" },
    { path: "/settings", icon: <Settings className="mr-3 h-5 w-5" />, label: "Settings" },
    { path: "/logout", icon: <LogOut className="mr-3 h-5 w-5" />, label: "Logout" }
  ];


  return (
    <aside className="w-full md:w-64 bg-slate-800 text-white">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
            <Building className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-center">Hostel Management</h1>
      </div>
      <nav className="p-2">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <a
                  className={`flex items-center px-4 py-2 ${
                    isActive(item.path)
                      ? "bg-slate-700 text-white"
                      : "text-gray-300 hover:bg-slate-700"
                  } rounded-md cursor-pointer`}
                >
                  {item.icon}
                  {item.label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};


export default Sidebar;




