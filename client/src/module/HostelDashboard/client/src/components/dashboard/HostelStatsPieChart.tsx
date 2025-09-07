import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { useAdminAuth } from "../../hooks/useAdminAuth";

// --- TypeScript Interfaces ---
interface Student {
  id: number;
  fullName: string;
  branch: string;
  roomNo?: string;
  gender?: string;
}

interface GatePass {
  student?: Student;
  createdAt: string; // Added for date filtering
}

interface PieChartData {
    name: string;
    value: number;
}

// --- API Endpoints ---
const studentsUrl = "https://hostel-backend-module-production-iist.up.railway.app/api/student/all";
const passesUrl = "https://hostel-backend-module-production-iist.up.railway.app/api/gate-pass/all";
const currentlyOutUrl = "https://hostel-backend-module-production-iist.up.railway.app/api/security/completed-logs";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

// Helper to get date as YYYY-MM-DD in 'Asia/Kolkata' (IST) timezone
const getISTDateOnly = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Kolkata',
  };
  // The 'en-CA' locale formats the date as YYYY-MM-DD, which is perfect for our needs.
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  return formatter.format(date);
};

const HostelStatsPieChart = () => {
  const [statsData, setStatsData] = useState<PieChartData[]>([]);
  const [totalStudents, setTotalStudents] = useState<Student[]>([]);
  const [studentsWithPassToday, setStudentsWithPassToday] = useState<Student[]>([]);
  const [studentsOut, setStudentsOut] = useState<Student[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalStudentList, setModalStudentList] = useState<Student[]>([]);
  
  const { admin, loading: adminLoading } = useAdminAuth();

  useEffect(() => {
    if (adminLoading || !admin) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      const adminType = admin.adminType ? admin.adminType.trim().toLowerCase() : "";
      let genderQuery = "";
      if (adminType === "varahmihir") {
        genderQuery = "?gender=M";
      } else if (adminType === "maitreyi") {
        genderQuery = "?gender=F";
      }

      try {
        // Fetch all students, all passes, and today's completed logs
        const [studentsRes, passesRes, outRes] = await Promise.all([
          fetch(`${studentsUrl}${genderQuery}`),
          fetch(`${passesUrl}${genderQuery}`),
          fetch(`${currentlyOutUrl}${genderQuery}`) // This endpoint defaults to today's date
        ]);

        if (!studentsRes.ok || !passesRes.ok || !outRes.ok) {
          throw new Error("Failed to fetch one or more hostel data endpoints.");
        }

        const studentsData: Student[] = await studentsRes.json();
        const allPassesData: GatePass[] = await passesRes.json();
        const outLogs: any[] = await outRes.json();

        if (!Array.isArray(studentsData) || !Array.isArray(allPassesData) || !Array.isArray(outLogs)) {
            throw new Error("Invalid data format received from API.");
        }
        
        // 1. Filter for passes generated today (in IST)
        const todayStr = getISTDateOnly(new Date());
        const todaysPasses = allPassesData.filter(p => getISTDateOnly(new Date(p.createdAt)) === todayStr);
        
        // 2. Get unique students who took a pass today
        const uniqueStudentIdsWithPassToday = new Set(todaysPasses.map(p => p.student?.id).filter(Boolean));
        const studentsWithPassListToday = studentsData.filter(s => uniqueStudentIdsWithPassToday.has(s.id));

        // 3. Filter logs to find students currently out (checked out, not checked in)
        const studentsCurrentlyOut = outLogs
          .filter(log => log.checkOutTime && !log.checkInTime)
          .map(log => ({
            id: log.studentId,
            fullName: log.studentName || log.fullName || "N/A",
            branch: log.branch || "N/A",
            roomNo: log.roomNo || "N/A",
            gender: log.gender || "N/A",
          }));

        // Set state for modals
        setTotalStudents(studentsData);
        setStudentsWithPassToday(studentsWithPassListToday);
        setStudentsOut(studentsCurrentlyOut);

        // Set data for Pie Chart
        const pieData = [
          { name: "Total Students", value: studentsData.length },
          { name: "Took Pass Today", value: studentsWithPassListToday.length },
          { name: "Currently Out", value: studentsCurrentlyOut.length },
        ];
        setStatsData(pieData);

      } catch (err) {
        console.error("Data fetching error:", err);
        setError("Could not load hostel statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [admin, adminLoading]);

  const handleSliceClick = (data: PieChartData) => {
    let list: Student[] = [];
    let title = "";

    switch (data.name) {
      case "Total Students":
        list = totalStudents;
        title = "All Students in Hostel";
        break;
      case "Took Pass Today":
        list = studentsWithPassToday;
        title = "Students Who Took a Pass Today";
        break;
      case "Currently Out":
        list = studentsOut;
        title = "Students Currently Checked Out";
        break;
      default:
        return;
    }

    setModalStudentList(list);
    setModalTitle(title);
    setIsModalOpen(true);
  };

  const renderContent = () => {
    if (loading || adminLoading) {
      return <div className="h-64 flex items-center justify-center">Loading Stats...</div>;
    }
    if (error) {
      return <div className="h-64 flex items-center justify-center text-red-500">{error}</div>;
    }
    if (statsData.every(d => d.value === 0)) {
        return <div className="h-64 flex items-center justify-center">No data available for today.</div>;
    }
    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={statsData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onClick={(_event, index) => handleSliceClick(statsData[index])}
            style={{ cursor: 'pointer' }}
          >
            {statsData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, 'Students']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Today's Hostel Stats</CardTitle>
          <CardDescription>Daily stats. Click on a slice for more details.</CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>
              A detailed list of all students in this category.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Student ID</th>
                  <th scope="col" className="px-6 py-3">Full Name</th>
                  <th scope="col" className="px-6 py-3">Branch</th>
                  <th scope="col" className="px-6 py-3">Room No.</th>
                </tr>
              </thead>
              <tbody>
                {modalStudentList.map((student) => (
                  <tr key={student.id} className="bg-white border-b">
                    <td className="px-6 py-4">{student.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{student.fullName}</td>
                    <td className="px-6 py-4">{student.branch || "-"}</td>
                    <td className="px-6 py-4">{student.roomNo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {modalStudentList.length === 0 && <p className="text-center p-4">No students found in this category.</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HostelStatsPieChart;

