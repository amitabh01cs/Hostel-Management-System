import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
}

export default function LayoutS({ children }: LayoutProps) {
  const { user } = useAuth();
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName={user?.name} onHamburger={() => setSidebarMobileOpen(true)} />
      {/* Mobile overlay backdrop */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}
      <div className="flex h-screen bg-gray-50">
        <Sidebar mobileOpen={sidebarMobileOpen} setMobileOpen={setSidebarMobileOpen} />
        <main className="flex-1 overflow-y-auto md:ml-0">
          {children}
        </main>
      </div>
    </div>
  );
}