import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { useAdminAuth } from "../../hooks/useAdminAuth"; // Import the authentication hook

// --- TypeScript Interfaces for Data Structures ---

interface Student {
  id: number;
  yearOfStudy: string | number;
  gender: string;
  fullName: string;
  branch: string;
}

interface GatePass {
  student?: Student;
  createdAt: string; // Ensure createdAt is available for filtering
}

interface ChartData {
  name: string;
  total: number;
}

interface StudentWithPassCount extends Student {
  passCount: number;
}

// --- Backend API URL ---
const backendUrl = "https://hostel-backend-module-production-iist.up.railway.app/api/gate-pass/all";

// Helper to get Year Name from number
const getYearName = (year: string | number): string => {
  if (!year) return "Unknown Year";
  switch (String(year)) {
    case "1": return "1st Year";
    case "2": return "2nd Year";
    case "3": return "3rd Year";
    case "4": return "4th Year";
    default: return `${year}th Year`;
  }
};

// Helper to get date as YYYY-MM in 'Asia/Kolkata' (IST) timezone
const getISTMonthYear = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      timeZone: 'Asia/Kolkata',
    };
    // The 'en-CA' locale formats the date as YYYY-MM-DD
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    return formatter.format(date).slice(0, 7); // slice to get "YYYY-MM"
};


const PassAnalysisChart = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [allPasses, setAllPasses] = useState<GatePass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalStudentList, setModalStudentList] = useState<StudentWithPassCount[]>([]);

  const { admin, loading: adminLoading } = useAdminAuth();

  useEffect(() => {
    if (adminLoading || !admin) return;

    setLoading(true);
    setError(null);

    const adminType = admin.adminType ? admin.adminType.trim().toLowerCase() : "";
    let url = backendUrl;
    if (adminType === "varahmihir") {
      url += "?gender=M";
    } else if (adminType === "maitreyi") {
      url += "?gender=F";
    }

    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: GatePass[]) => {
        if (!Array.isArray(data)) {
            throw new Error("API response is not an array.");
        }

        // Filter for passes created in the current month
        const currentMonthStr = getISTMonthYear(new Date());
        const passesThisMonth = data.filter(pass => {
            if (!pass.createdAt) return false;
            return getISTMonthYear(new Date(pass.createdAt)) === currentMonthStr;
        });

        setAllPasses(passesThisMonth); // Store only this month's passes for modal logic

        const passCountsByYear = passesThisMonth.reduce((acc: Record<string, ChartData>, pass) => {
          const student = pass.student;
          if (!student || !student.yearOfStudy) {
            return acc;
          }

          const yearName = getYearName(student.yearOfStudy);
          if (!acc[yearName]) {
            acc[yearName] = { name: yearName, total: 0 };
          }
          
          acc[yearName].total++;
          return acc;
        }, {});
        
        const processedChartData = Object.values(passCountsByYear);
        setChartData(processedChartData);
      })
      .catch(error => {
        console.error("Failed to fetch pass data:", error);
        setError("Could not load chart data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [admin, adminLoading]);

  const handleBarClick = (data: ChartData) => {
    const clickedYearName = data.name;

    const relevantStudents = allPasses.filter(pass => {
      if (!pass.student) return false;
      return getYearName(pass.student.yearOfStudy) === clickedYearName;
    });

    const studentPassCounts = relevantStudents.reduce((acc: Record<number, StudentWithPassCount>, pass) => {
      if (pass.student) {
        const studentId = pass.student.id;
        if (!acc[studentId]) {
          acc[studentId] = { ...pass.student, passCount: 0 };
        }
        acc[studentId].passCount++;
      }
      return acc;
    }, {});

    const uniqueStudentsWithCounts = Object.values(studentPassCounts);
    
    const adminType = admin?.adminType ? admin.adminType.trim().toLowerCase() : "";
    let filterName = "All";
    if (adminType === 'varahmihir') filterName = 'Male';
    if (adminType === 'maitreyi') filterName = 'Female';

    setModalTitle(`${filterName} Students from ${clickedYearName} (This Month)`);
    setModalStudentList(uniqueStudentsWithCounts);
    setIsModalOpen(true);
  };

  const renderContent = () => {
    if (adminLoading || loading) {
        return <div className="h-64 flex items-center justify-center">Loading Chart Data...</div>;
    }
    if (error) {
        return <div className="h-64 flex items-center justify-center text-red-500">{error}</div>;
    }
    if (chartData.length === 0) {
        return <div className="h-64 flex items-center justify-center">No pass data available for this month.</div>;
    }
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} width={45} allowDecimals={false} />
            <Tooltip
                formatter={(value: number) => [`${value}`, 'Passes']}
                labelStyle={{ color: '#333', fontWeight: 500 }}
                contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                }}
            />
            <Bar
                dataKey={'total'}
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                barSize={40}
                onClick={handleBarClick}
            />
            </BarChart>
        </ResponsiveContainer>
    );
  };

  return (
    <>
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Monthly Pass Analysis (Year-wise)</CardTitle>
          <CardDescription>
            Total passes taken by students of each year in the current month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {renderContent()}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>
              Unique list of students and their total passes for this category this month.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Student ID</th>
                  <th scope="col" className="px-6 py-3">Full Name</th>
                  <th scope="col" className="px-6 py-3">Branch</th>
                  <th scope="col" className="px-6 py-3 text-center">Passes Taken</th>
                </tr>
              </thead>
              <tbody>
                {modalStudentList.map((student) => (
                  <tr key={student.id} className="bg-white border-b">
                    <td className="px-6 py-4">{student.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{student.fullName}</td>
                    <td className="px-6 py-4">{student.branch}</td>
                    <td className="px-6 py-4 text-center font-semibold">{student.passCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {modalStudentList.length === 0 && <p className="text-center p-4">No students found.</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PassAnalysisChart;

