import { useAdminAuth } from "../hooks/useAdminAuth";
import { useEffect } from "react";
import DashboardStats from "../components/dashboard/DashboardStats";
import OccupancyChart from "../components/dashboard/OccupancyChart";
import ActivityList from "../components/dashboard/ActivityList";
import QuickActions from "../components/dashboard/studentDashboard/QuickActions";
import Layout2 from "../components/layout/Layout2";
import Header from "../components/layout/Header";

const DashboardB = () => {
  const { admin, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading && !admin) {
      window.location.href = "/login"; // ya aapka admin login path
    }
  }, [admin, loading]);

  if (loading) return <Layout2><div className="p-8">Loading...</div></Layout2>;
  if (!admin) return null;

  // Sidebar toggle handler (dummy function, apne hisaab se update kar sakte ho)
  const handleToggleSidebar = () => {
    // Sidebar toggle logic here (agar hai to)
  };

  return (
    <Layout2>
      {/* Header ko admin ka name/email pass karo */}
      {/* <Header
        title="Admin Dashboard"
        toggleSidebar={handleToggleSidebar}
        adminName={admin.name}
        adminEmail={admin.email}
      /> */}

      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="page-title">Dashboard ({admin.adminType})</h2>
          <p className="page-description">Overview of your hostel management system</p>
        </div>

        {/* Statistics */}
        <DashboardStats />

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <OccupancyChart />
          <ActivityList />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </Layout2>
  );
};

export default DashboardB;