import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
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
// import { useAdminAuth } from "@/hooks/useAdminAuth"; // Import the admin auth hook

// --- TypeScript Interfaces for Data Structures ---

// Describes the structure of a student object from the backend
interface Student {
  id: number;
  yearOfStudy: string | number;
  gender: string;
  fullName: string;
  branch: string;
}

// Describes a single gate pass object
interface GatePass {
  student?: Student; // Student can be optional as checked in the code
}

// Describes the data structure for each bar in the chart
interface ChartData {
  name: string;
  Male: number;
  Female: number;
  total: number;
}

// Extends the Student interface to include the pass count for the modal view
interface StudentWithPassCount extends Student {
  passCount: number;
}

type GenderFilter = "total" | "Male" | "Female";

// --- Component ---

const backendUrl = "https://hostel-backend-module-production-iist.up.railway.app/api/gate-pass/all";

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

export const PassAnalysisChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [allPasses, setAllPasses] = useState<GatePass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalStudentList, setModalStudentList] = useState<StudentWithPassCount[]>([]);
  
  // Get admin details for automatic filtering
  const { admin, loading: adminLoading } = useAdminAuth();

  useEffect(() => {
    // Wait until the admin information has been loaded
    if (adminLoading) {
      setLoading(true);
      return;
    }

    setLoading(true);
    setError(null);

    let url = backendUrl;
    let appliedFilter: GenderFilter = 'total';
    const adminType = admin?.adminType ? admin.adminType.trim().toLowerCase() : "";
    
    // Automatically determine the filter based on admin's hostel type
    if (adminType === "varahmihir") { // Assuming this is the male hostel
      url += "?gender=M";
      appliedFilter = "Male";
    } else if (adminType === "maitreyi") { // Assuming this is the female hostel
      url += "?gender=F";
      appliedFilter = "Female";
    }
    
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data: GatePass[]) => {
        if (!Array.isArray(data)) {
          throw new Error("Fetched data is not in the expected format.");
        }
        
        setAllPasses(data);

        const passCountsByYear = data.reduce((acc: Record<string, ChartData>, pass) => {
          const student = pass.student;
          if (!student || !student.yearOfStudy || !student.gender) {
            return acc;
          }

          const yearName = getYearName(student.yearOfStudy);
          const gender = student.gender.toLowerCase() === 'f' ? "Female" : "Male";

          if (!acc[yearName]) {
            acc[yearName] = { name: yearName, Male: 0, Female: 0, total: 0 };
          }

          if (gender === "Male" || gender === "Female") {
            acc[yearName][gender]++;
            acc[yearName].total++;
          }
          
          return acc;
        }, {});

        const processedChartData = Object.values(passCountsByYear);
        
        // Adjust the 'total' value to reflect the current filter for the bar height
        if(appliedFilter !== 'total') {
            processedChartData.forEach(year => {
                year.total = year[appliedFilter] || 0;
            });
        }
        
        setChartData(processedChartData);
      })
      .catch((error: Error) => {
        console.error("Failed to fetch pass data:", error);
        setError("Could not load chart data. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [admin, adminLoading]); // Re-run effect when admin data is available

  const handleBarClick = (data: ChartData) => {
    const clickedYearName = data.name;

    const relevantStudents = allPasses.filter(pass => {
      if (!pass.student) return false;
      return getYearName(pass.student.yearOfStudy) === clickedYearName;
    });

    const studentPassCounts = relevantStudents.reduce((acc: Record<number, StudentWithPassCount>, pass) => {
        if (pass.student) {
            const studentId = pass.student.id;
            if(!acc[studentId]) {
                acc[studentId] = { ...pass.student, passCount: 0 };
            }
            acc[studentId].passCount++;
        }
        return acc;
    }, {});

    const uniqueStudentsWithCounts = Object.values(studentPassCounts);

    const adminType = admin?.adminType ? admin.adminType.trim().toLowerCase() : "";
    let filterTitle: GenderFilter = 'total';
    if (adminType === "varahmihir") {
      filterTitle = 'Male';
    } else if (adminType === "maitreyi") {
      filterTitle = 'Female';
    }
    const finalTitle = filterTitle === 'total' ? 'All' : filterTitle;

    setModalTitle(`${finalTitle} Students from ${clickedYearName}`);
    setModalStudentList(uniqueStudentsWithCounts);
    setIsModalOpen(true);
  };
  
  const renderContent = () => {
    if (loading) {
      return <div className="h-64 flex items-center justify-center">Loading Chart Data...</div>;
    }
    if (error) {
      return <div className="h-64 flex items-center justify-center text-red-600">{error}</div>;
    }
    if (chartData.length === 0) {
        return <div className="h-64 flex items-center justify-center">No pass data available for this filter.</div>;
    }
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
            >
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
  }

  return (
    <>
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Year-wise Pass Analysis</CardTitle>
          {/* Gender filter buttons have been removed */}
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
              Unique list of students and their total passes for this category.
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

