import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { User, Bed, Calendar, CheckCircle, Clock, Star } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { useLocation } from "wouter";
import { useEffect } from "react";
import LayoutS from "../components/LayoutS";

// Utility to get floor from room number
function getFloor(room) {
  if (!room) return "N/A";
  const intRoom = parseInt(room, 10);
  if (isNaN(intRoom)) return "N/A";
  if (intRoom < 100) return "Ground Floor";
  const floorNum = Math.floor(intRoom / 100);
  if (floorNum === 1) return "1st Floor";
  if (floorNum === 2) return "2nd Floor";
  if (floorNum === 3) return "3rd Floor";
  if (floorNum === 4) return "4th Floor";
  return floorNum + "th Floor";
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [user, loading]);

  // Fetch gate pass counts for this student from backend (port 8085)
  const { data: passStats = {pending: 0, approved: 0, rejected: 0, total: 0}, isLoading } = useQuery({
    queryKey: ["gate-pass-counts", user?.studentId],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch(`https://hostel-backend-module-production-iist.up.railway.app/api/gate-pass/student/${user.studentId}/counts`);
      if (!res.ok) throw new Error("Failed to fetch gate pass counts");
      return res.json();
    },
  });

  const quickActions = [
    { name: "Profile", icon: User, color: "text-blue-500", path: "/student/dashboard" },
    { name: "Leaves", icon: Calendar, color: "text-green-500", path: "/leave-status" },
    { name: "Complaints", icon: CheckCircle, color: "text-orange-500", path: "/complaints" },
    { name: "Anti-ragging", icon: Star, color: "text-red-500", path: "/anti-ragging" },
  ];

  if (loading || isLoading) {
    return <LayoutS> <div className="p-8">Loading...</div> </LayoutS>;
  }
  if (!user) return null;

  const floor = getFloor(user.room);

  return (
    <LayoutS>
      <div className="p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of your dashboard</p>
          </div>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => {
              localStorage.removeItem("studentUser");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* My Profile Card */}
          <Card className="border-blue-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">My Profile</h3>
                <User className="w-6 h-6 text-blue-500" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {user.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Student ID:</strong> {user.studentId}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Course:</strong> {user.course || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Mobile:</strong> {user.mobile || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* My Room Card */}
          <Card className="border-orange-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">My Room</h3>
                <Bed className="w-6 h-6 text-orange-500" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Room No:</strong> {user.room || "N/A"}
                </p>
                {/* <p className="text-sm text-gray-600">
                  <strong>Bed No:</strong> {user.bed || "N/A"}
                </p> */}
                <p className="text-sm text-gray-600">
                  <strong>Floor:</strong> {floor}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* My Gate Passes Card */}
          <Card className="border-green-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">My Gate Passes</h3>
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Pending:</strong> <span className="text-yellow-600">{passStats.pending}</span>
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Approved:</strong> <span className="text-green-600">{passStats.approved}</span>
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Rejected:</strong> <span className="text-red-600">{passStats.rejected}</span>
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Total Passes:</strong> {passStats.total}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.name}
                    onClick={() => setLocation(action.path)}
                    className="quick-action-btn"
                  >
                    <Icon className={`${action.color} text-lg mb-2`} />
                    <span className="text-sm text-gray-600">{action.name}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Days in Hostel</p>
                  <p className="text-2xl font-bold text-gray-900">127</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Complaints Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hostel Rating</p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutS>
  );
}