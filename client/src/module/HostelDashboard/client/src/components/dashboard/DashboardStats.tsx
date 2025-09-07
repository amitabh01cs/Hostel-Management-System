import { useEffect, useState } from "react";
import { BarChart3, Home, BookOpen, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { cn } from "../../lib/utils";
import { useAdminAuth } from "../../hooks/useAdminAuth";

type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  changeText?: string;
  changeType?: "increase" | "decrease" | "none";
};

// Helper to get date as YYYY-MM-DD in 'Asia/Kolkata' (IST) timezone
const getISTDateOnly = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Kolkata',
    };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    return formatter.format(date);
};

const studentsUrl = "https://hostel-backend-module-production-iist.up.railway.app/api/student/all";
const checkInOutUrl = "https://hostel-backend-module-production-iist.up.railway.app/api/security/completed-logs";


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
  const [lateCheckIns, setLateCheckIns] = useState<number | null>(null);
  const { admin, loading: adminLoading } = useAdminAuth();

  useEffect(() => {
    if (adminLoading) return; // Wait until admin auth check is complete

    const adminType = admin?.adminType ? admin.adminType.trim().toLowerCase() : "";

    let studentsApiUrl = studentsUrl;
    const todayStr = getISTDateOnly(new Date());
    let checkInApiUrl = `${checkInOutUrl}?date=${todayStr}`;

    if (adminType === "varahmihir") {
      studentsApiUrl += "?gender=M";
      checkInApiUrl += "&gender=M";
    } else if (adminType === "maitreyi") {
      studentsApiUrl += "?gender=F";
      checkInApiUrl += "&gender=F";
    }

    const fetchStats = async () => {
      try {
        const [studentsRes, checkInRes] = await Promise.all([
          fetch(studentsApiUrl),
          fetch(checkInApiUrl),
        ]);

        if (!studentsRes.ok || !checkInRes.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }

        const studentsData = await studentsRes.json();
        const checkInData = await checkInRes.json();

        // Set Total Students
        setTotalStudents(Array.isArray(studentsData) ? studentsData.length : 0);

        // Calculate Late Check-ins for today
        if (Array.isArray(checkInData)) {
          const lateCount = checkInData.filter(log => {
            if (!log.checkInTime || !log.toTime) {
              return false; // Skip if either time is missing
            }
            // A check-in is late if it's after the expected arrival time (toTime)
            return new Date(log.checkInTime) > new Date(log.toTime);
          }).length;
          setLateCheckIns(lateCount);
        } else {
          setLateCheckIns(0);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        setTotalStudents(0);
        setLateCheckIns(0);
      }
    };

    fetchStats();
  }, [admin, adminLoading]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard
        title="Total Students"
        value={totalStudents !== null ? totalStudents : "Loading..."}
        icon={<BarChart3 className="h-5 w-5 text-primary" />}
        iconBg="bg-blue-100"
        borderColor="border-primary"
        changeText="Current strength"
        changeType="none"
      />

      <StatCard
        title="Total Rooms"
        value="48"
        icon={<Home className="h-5 w-5 text-green-600" />}
        iconBg="bg-green-100"
        borderColor="border-green-500"
        changeText="Per hostel"
        changeType="none"
      />

      <StatCard
        title="Late Check-ins (Today)"
        value={lateCheckIns !== null ? lateCheckIns : "Loading..."}
        icon={<AlertCircle className="h-5 w-5 text-red-600" />}
        iconBg="bg-red-100"
        borderColor="border-red-500"
        changeText="Based on today's logs"
        changeType="none"
      />
    </div>
  );
};

export default DashboardStats;

