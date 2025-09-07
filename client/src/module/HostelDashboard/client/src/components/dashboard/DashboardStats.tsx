import { useEffect, useState } from "react";
import { BarChart3, Home, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
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

// --- Interfaces ---
interface LateStudent {
    studentId: number;
    studentName: string;
    branch: string;
    checkInTime: string;
    toTime: string;
}

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

const studentsUrl = "https://hostel-backend-module-production-iist.up.railway.app/api/student/filtered-list";
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
  const [lateStudentList, setLateStudentList] = useState<LateStudent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

        // Calculate and store Late Check-ins for today
        if (Array.isArray(checkInData)) {
          const lateStudents = checkInData.filter(log => {
            if (!log.checkInTime || !log.toTime) {
              return false; // Skip if either time is missing
            }
            // A check-in is late if it's after the expected arrival time (toTime)
            return new Date(log.checkInTime) > new Date(log.toTime);
          });
          setLateCheckIns(lateStudents.length);
          setLateStudentList(lateStudents);
        } else {
          setLateCheckIns(0);
          setLateStudentList([]);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        setTotalStudents(0);
        setLateCheckIns(0);
      }
    };

    fetchStats();
  }, [admin, adminLoading]);

  const handleLateCheckinClick = () => {
    if (lateStudentList.length > 0) {
        setIsModalOpen(true);
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
  }

  return (
    <>
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
        
        <div onClick={handleLateCheckinClick} className={lateCheckIns > 0 ? "cursor-pointer" : "cursor-default"}>
            <StatCard
                title="Late Check-ins (Today)"
                value={lateCheckIns !== null ? lateCheckIns : "Loading..."}
                icon={<AlertCircle className="h-5 w-5 text-red-600" />}
                iconBg="bg-red-100"
                borderColor="border-red-500"
                changeText="Click to view details"
                changeType="none"
            />
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Late Check-in Students (Today)</DialogTitle>
            <DialogDescription>
              List of students who checked in after their approved return time today.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Student ID</th>
                  <th scope="col" className="px-6 py-3">Full Name</th>
                  <th scope="col" className="px-6 py-3">Branch</th>
                  <th scope="col" className="px-6 py-3">Approved Time</th>
                  <th scope="col" className="px-6 py-3">Check-in Time</th>
                </tr>
              </thead>
              <tbody>
                {lateStudentList.map((student) => (
                  <tr key={student.studentId} className="bg-white border-b">
                    <td className="px-6 py-4">{student.studentId}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{student.studentName}</td>
                    <td className="px-6 py-4">{student.branch || "-"}</td>
                    <td className="px-6 py-4 font-semibold text-green-600">{formatTime(student.toTime)}</td>
                    <td className="px-6 py-4 font-semibold text-red-600">{formatTime(student.checkInTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lateStudentList.length === 0 && <p className="text-center p-4">No late check-ins found for today.</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardStats;

