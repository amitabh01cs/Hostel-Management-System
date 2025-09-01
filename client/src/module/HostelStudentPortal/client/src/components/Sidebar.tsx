import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Wrench,
  Shield,
  LogOut,
  X,
  CreditCard
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

// Navigation items
const navigation = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "Request Leave", href: "/student/request-leave", icon: Calendar },
  { name: "Leave Request Status", href: "/leave-status", icon: ClipboardList },
  { name: "Complaint Box", href: "/complaints", icon: Wrench },
  { name: "Anti Ragging", href: "/anti-ragging", icon: Shield },
  // New Pay Fees option (external link)
  { 
    name: "Pay Fees", 
    href: "https://www.eduqfix.com/PayDirect/#/student/pay/9ifyyx2EWyty8kyXEDtFtA720L+llbXnZmc2+dQ+31M3KMyESa0fMWjv1krZFsls/2918", 
    icon: CreditCard,
    external: true
  },
];

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen?: boolean, setMobileOpen?: (open: boolean) => void }) {
  const [location] = useLocation();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem("studentUser");
      window.location.href = "/login";
    }
  };

  // Mobile overlay close button
  const closeBtn = setMobileOpen ? (
    <button
      className="absolute top-4 right-4 md:hidden"
      onClick={() => setMobileOpen(false)}
    >
      <X className="w-6 h-6" />
    </button>
  ) : null;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg border-r transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:block",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {closeBtn}
      <nav className="mt-6">
        <div className="px-6 py-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Menu
          </h3>
        </div>
        <div className="space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            if (item.external) {
              // External link (opens in new tab)
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-item"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              );
            } else {
              // Internal link (React router)
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn("nav-item", isActive && "active")}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            }
          })}
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="nav-item text-red-600 hover:bg-red-50 w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
