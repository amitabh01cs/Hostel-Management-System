import { useEffect, useState } from "react";
import { BarChart3, Home, BookOpen, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { cn } from "../../lib/utils";

type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  changeText?: string;
  changeType?: "increase" | "decrease" | "none";
};

const StatCard = ({
  title,
  value,
  icon,
  iconBg,
  borderColor,
  changeText = "No change",
  changeType = "none"
}: StatCardProps) => {
  return (
    <Card className={cn("border-l-4", borderColor)}>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={cn("p-3 rounded-full mr-4", iconBg)}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500 flex items-center">
          {changeType === "increase" && <TrendingUp className="h-3 w-3 mr-1 text-green-500" />}
          {changeType === "decrease" && <TrendingDown className="h-3 w-3 mr-1 text-red-500" />}
          <span className={cn(
            changeType === "increase" && "text-green-500",
            changeType === "decrease" && "text-red-500"
          )}>
            {changeText}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardStats = () => {
  const [totalStudents, setTotalStudents] = useState<number | null>(null);

  useEffect(() => {
    // Get adminType from localStorage (robust)
    let adminType = "";
    try {
      const adminUserRaw = localStorage.getItem("adminUser");
      if (adminUserRaw) {
        const adminUser = JSON.parse(adminUserRaw);
        adminType = (adminUser.adminType || "").trim().toLowerCase();
      }
    } catch {}

    let url = "https://hostel-backend-module-production-iist.up.railway.app/api/student/filtered-list";
    if (adminType === "varahmihir") {
      url += "?gender=M";
    } else if (adminType === "maitreyi") {
      url += "?gender=F";
    }

    fetch(url)
      .then(res => res.json())
      .then(data => setTotalStudents(Array.isArray(data) ? data.length : 0));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard
        title="Total Students"
        value={totalStudents !== null ? totalStudents : "Loading..."}
        icon={<BarChart3 className="h-5 w-5 text-primary" />}
        iconBg="bg-primary-100"
        borderColor="border-primary"
        changeText="5% since last month"
        changeType="increase"
      />

      <StatCard
        title="Total Rooms"
        value="48"
        icon={<Home className="h-5 w-5 text-secondary" />}
        iconBg="bg-secondary-100"
        borderColor="border-secondary"
        changeText="2% since last month"
        changeType="increase"
      />

      <StatCard
        title="Total Courses"
        value="4"
        icon={<BookOpen className="h-5 w-5 text-green-600" />}
        iconBg="bg-green-100"
        borderColor="border-green-500"
        changeText="No change since last month"
        changeType="none"
      />
    </div>
  );
};

export default DashboardStats;