import { useState, useEffect } from "react";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { CheckCircle, XCircle, Download, Eye, ArrowLeft } from "lucide-react";
import { cn } from "../lib/utils";
import * as XLSX from "xlsx";
import Layout2 from "../components/layout/Layout2";
import { useAdminAuth } from "../hooks/useAdminAuth";

const statusOptions = [
  { label: "All", value: "" },
  { label: "Present", value: "present" },
  { label: "Absent", value: "absent" },
];

const yearOptions = [
  { value: "all", label: "All Year" },
  { value: "I", label: "Ist Year" },
  { value: "II", label: "IInd Year" },
  { value: "III", label: "IIIrd Year" },
  { value: "IV", label: "IVth Year" },
  { value: "V", label: "Vth Year" },
];

const getLocalDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const BASE_API_URL = "https://hostel-backend-module-production-iist.up.railway.app";

type AttendanceStudent = {
  id: number;
  name: string;
  rollNo: string;
  roomNo: string;
  course: string;
  year: string;
  gender: string;
  attendance: "present" | "absent" | null;
};

type AttendanceView = {
  id: number;
  name: string;
  rollNo: string;
  roomNo: string;
  course: string;
  year: string;
  gender: string;
  status: "present" | "absent" | string;
  date?: string;
};

const TakeAttendance = () => {
  const { admin, loading } = useAdminAuth();
  const [studentsData, setStudentsData] = useState<AttendanceStudent[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const { toast } = useToast();
  const [genderParam, setGenderParam] = useState<"" | "M" | "F">("");
  const [showView, setShowView] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceView[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString);
  const [statusFilter, setStatusFilter] = useState("");
  const [attendanceAlreadySubmitted, setAttendanceAlreadySubmitted] = useState(
    false
  );
  const [showRange, setShowRange] = useState(false);
  const [rangeFrom, setRangeFrom] = useState(getLocalDateString());
  const [rangeTo, setRangeTo] = useState(getLocalDateString());
  const [rangeAttendance, setRangeAttendance] = useState<AttendanceView[]>([]);

  useEffect(() => {
    if (!loading && !admin) {
      window.location.href = "/login";
    }
  }, [admin, loading]);

  useEffect(() => {
    if (!admin) return;
    const adminTypeLower = admin.adminType
      ? admin.adminType.trim().toLowerCase()
      : "";
    if (adminTypeLower === "varahmihir") setGenderParam("M");
    else if (adminTypeLower === "maitreyi") setGenderParam("F");
    else setGenderParam("");
  }, [admin]);

  useEffect(() => {
    if (!showView && !showRange && admin) {
      let url = `${BASE_API_URL}/api/attendance/filtered-list`;
      if (genderParam) url += `?gender=${genderParam}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setStudentsData(
            data.map((s: any) => ({
              id: s.id,
              name: s.fullName,
              rollNo: s.emailId,
              roomNo: s.roomNo || "-",
              course: s.course,
              year:
                s.yearOfStudy === "1"
                  ? "I"
                  : s.yearOfStudy === "2"
                  ? "II"
                  : s.yearOfStudy === "3"
                  ? "III"
                  : s.yearOfStudy === "4"
                  ? "IV"
                  : s.yearOfStudy === "5"
                  ? "V"
                  : s.yearOfStudy,
              gender: s.gender || "",
              attendance: null,
            }))
          );
        });
    }
  }, [showView, showRange, genderParam, admin]);

  useEffect(() => {
    if (showView && admin) {
      setLoadingTable(true);
      const fetchAttendanceByDate = async (dateStr: string) => {
        let url = `${BASE_API_URL}/api/attendance/date?date=${dateStr}`;
        if (genderParam) url += `&gender=${genderParam}`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        return data;
      };

      (async () => {
        const todayStr = getLocalDateString();
        let data = await fetchAttendanceByDate(todayStr);
        if (data.length === 0) {
          const yesterday = new Date(
            new Date(todayStr).getTime() - 24 * 60 * 60 * 1000
          );
          const yyyy = yesterday.getFullYear();
          const mm = String(yesterday.getMonth() + 1).padStart(2, "0");
          const dd = String(yesterday.getDate()).padStart(2, "0");
          const yesterdayStr = `${yyyy}-${mm}-${dd}`;
          data = await fetchAttendanceByDate(yesterdayStr);
          setSelectedDate(yesterdayStr);
        } else {
          setSelectedDate(todayStr);
        }
        setAttendance(
          data.map((s: any) => ({
            ...s,
            year:
              s.year === "1"
                ? "I"
                : s.year === "2"
                ? "II"
                : s.year === "3"
                ? "III"
                : s.year === "4"
                ? "IV"
                : s.year === "5"
                ? "V"
                : s.year,
          }))
        );
        setLoadingTable(false);
      })();
    }
  }, [showView, genderParam, admin]);

  useEffect(() => {
    if (!admin) return;
    let checkUrl = `${BASE_API_URL}/api/attendance/date?date=${getLocalDateString()}`;
    if (genderParam) checkUrl += `&gender=${genderParam}`;
    fetch(checkUrl)
      .then((res) => res.json())
      .then((data) => setAttendanceAlreadySubmitted(data && data.length > 0));
  }, [genderParam, admin]);

  const handleFetchRangeAttendance = () => {
    setLoadingTable(true);
    let url = `${BASE_API_URL}/api/attendance/range?from=${rangeFrom}&to=${rangeTo}`;
    if (genderParam) url += `&gender=${genderParam}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setRangeAttendance(
          data.map((s: any) => ({
            ...s,
            year:
              s.year === "1"
                ? "I"
                : s.year === "2"
                ? "II"
                : s.year === "3"
                ? "III"
                : s.year === "4"
                ? "IV"
                : s.year === "5"
                ? "V"
                : s.year,
          }))
        );
        setLoadingTable(false);
      });
  };

  const filteredStudents =
    selectedYear === "all"
      ? studentsData
      : studentsData.filter((student) => student.year === selectedYear);

  const filteredAttendance = attendance
    .filter((student) => selectedYear === "all" || student.year === selectedYear)
    .filter(
      (student) =>
        !statusFilter || (student.status || "").toLowerCase() === statusFilter
    );

  const filteredRangeAttendance = rangeAttendance
    .filter((student) => selectedYear === "all" || student.year === selectedYear)
    .filter(
      (student) =>
        !statusFilter || (student.status || "").toLowerCase() === statusFilter
    );

  const presentCount = filteredStudents.filter(
    (s) => s.attendance === "present"
  ).length;

  const absentCount = filteredStudents.filter(
    (s) => s.attendance === "absent"
  ).length;

  const presentCountView = filteredAttendance.filter(
    (s) => (s.status || "").toLowerCase() === "present"
  ).length;

  const absentCountView = filteredAttendance.filter(
    (s) => (s.status || "").toLowerCase() === "absent"
  ).length;

  const presentCountRange = filteredRangeAttendance.filter(
    (s) => (s.status || "").toLowerCase() === "present"
  ).length;

  const absentCountRange = filteredRangeAttendance.filter(
    (s) => (s.status || "").toLowerCase() === "absent"
  ).length;

  const handleAttendanceChange = (
    studentId: number,
    status: "present" | "absent"
  ) => {
    setStudentsData((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, attendance: status } : student
      )
    );
  };

  const handleMarkAll = (status: "present" | "absent") => {
    setStudentsData((prev) => prev.map((student) => ({ ...student, attendance: status })));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const unmarkedStudents = filteredStudents.filter((s) => s.attendance === null);
    if (unmarkedStudents.length > 0) {
      toast({
        title: "Incomplete Attendance",
        description: `${unmarkedStudents.length} students don't have attendance marked.`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    const invalidStatusStudents = filteredStudents.filter(
      (s) => s.attendance !== "present" && s.attendance !== "absent"
    );
    if (invalidStatusStudents.length > 0) {
      toast({
        title: "Invalid Attendance Data",
        description: `Please mark all students as 'present' or 'absent' before submitting.`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    const attendanceList = filteredStudents.map((s) => ({
      studentId: s.id,
      status: s.attendance,
    }));
    try {
      const adminTypeParam = admin?.adminType ?? "";
      const res = await fetch(
        `${BASE_API_URL}/api/attendance/save?adminType=${adminTypeParam}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attendanceList),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        toast({
          title: "Submission Error",
          description: errorData.message || "Failed to save attendance",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Attendance Submitted",
          description: `Attendance for ${filteredStudents.length} students has been recorded.`,
        });
        setAttendanceAlreadySubmitted(true);
      } else {
        toast({
          title: "Error",
          description: data.message || "Attendance not saved.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to connect to the server.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadExcel = (dataToExport: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, fileName);
  };
  
  // New function to handle the summarized Excel download for date range
  const handleDownloadRangeSummary = () => {
    // Group attendance records by student using their roll number
    const studentSummary = filteredRangeAttendance.reduce((acc, record) => {
      const key = record.rollNo; // Unique identifier for a student
      if (!acc[key]) {
        acc[key] = {
          name: record.name,
          rollNo: record.rollNo,
          roomNo: record.roomNo,
          course: record.course,
          year: record.year,
          totalPresent: 0,
        };
      }
      // Increment present count if status is 'present'
      if ((record.status || '').toLowerCase() === 'present') {
        acc[key].totalPresent += 1;
      }
      return acc;
    }, {} as Record<string, { name: string; rollNo: string; roomNo: string; course: string; year: string; totalPresent: number }>);

    // Convert the grouped data into an array for the Excel sheet
    const excelData = Object.values(studentSummary).map((student, index) => ({
        "Sr No.": index + 1,
        "Student Name": student.name,
        "Email": student.rollNo,
        "Room": student.roomNo || "-",
        "Course": student.course,
        "Year": student.year,
        "Total Present": student.totalPresent,
      }));

    handleDownloadExcel(excelData, `attendance_summary_${rangeFrom}_to_${rangeTo}.xlsx`);
  };


  const columns =
    showView || showRange
      ? [
          { accessorKey: "id", header: "Sr No." },
          { accessorKey: "name", header: "Student Name" },
          { accessorKey: "rollNo", header: "Student Email" },
          { accessorKey: "course", header: "Course" },
          {
            accessorKey: "roomNo",
            header: "Room No",
            cell: ({ row }: any) => row.original.roomNo || "-",
          },
          { accessorKey: "year", header: "Year" },
          ...(showRange ? [{ accessorKey: "date", header: "Date" }] : []),
          { accessorKey: "status", header: "Status" },
        ]
      : [
          { accessorKey: "id", header: "Sr No." },
          { accessorKey: "name", header: "Student Name" },
          { accessorKey: "rollNo", header: "Student Email" },
          { accessorKey: "course", header: "Course" },
          {
            accessorKey: "roomNo",
            header: "Room No",
            cell: ({ row }: any) => row.original.roomNo || "-",
          },
          { accessorKey: "year", header: "Year" },
          {
            id: "attendance",
            header: "Attendance",
            cell: ({ row }: any) => {
              const student = row.original;
              return (
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 rounded-full",
                      student.attendance === "present" &&
                        "bg-green-100 text-green-600 border-green-600"
                    )}
                    onClick={() => handleAttendanceChange(student.id, "present")}
                    disabled={attendanceAlreadySubmitted}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="sr-only">Present</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 rounded-full",
                      student.attendance === "absent" &&
                        "bg-red-100 text-red-600 border-red-600"
                    )}
                    onClick={() => handleAttendanceChange(student.id, "absent")}
                    disabled={attendanceAlreadySubmitted}
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="sr-only">Absent</span>
                  </Button>
                </div>
              );
            },
          },
        ];

  const getExcelData = () => {
    // This function is now mainly for the single day view or the raw data view.
    // The range summary has its own dedicated download handler.
    if (showView) {
      return filteredAttendance.map((s: any, i: number) => ({
        "Sr No.": i + 1,
        "Student Name": s.name,
        Email: s.rollNo,
        Room: s.roomNo,
        Course: s.course,
        Year: s.year,
        Date: s.date,
        Status: s.status || "Not Marked",
      }));
    }
    return filteredStudents.map((s: any, i: number) => ({
      "Sr No.": i + 1,
      "Student Name": s.name,
      Email: s.rollNo,
      Room: s.roomNo,
      Course: s.course,
      Year: s.year,
      Date: getLocalDateString(),
      Attendance: s.attendance || "Not Marked",
    }));
  };

  if (loading || !admin) {
    return (
      <Layout2>
        <div className="p-8">Loading...</div>
      </Layout2>
    );
  }

  return (
    <Layout2>
      <div>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!showView && !showRange && (
            <input
              type="date"
              className="w-[200px] p-2 border rounded-md"
              value={getLocalDateString()}
              disabled
              readOnly
            />
          )}
          <Button
            variant="outline"
            className="ml-auto"
            onClick={() => {
              setShowView(true);
              setShowRange(false);
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Attendance
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowRange(true);
              setShowView(false);
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Attendance by Date Range
          </Button>
        </div>
        {showRange && (
          <div className="flex gap-4 mb-4 items-center flex-wrap">
            <Button
              variant="outline"
              onClick={() => {
                setShowRange(false);
                setShowView(false);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <label>From:</label>
            <input
              type="date"
              className="p-2 border rounded-md"
              value={rangeFrom}
              onChange={(e) => setRangeFrom(e.target.value)}
            />
            <label>To:</label>
            <input
              type="date"
              className="p-2 border rounded-md"
              value={rangeTo}
              onChange={(e) => setRangeTo(e.target.value)}
            />
            <Button onClick={handleFetchRangeAttendance}>
              <Eye className="mr-2 h-4 w-4" />
              Show Range
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadRangeSummary} // Using the new summary download function
              disabled={loadingTable || filteredRangeAttendance.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Excel
            </Button>
          </div>
        )}
        {showRange ? (
          <Card>
            <CardHeader>
              <CardTitle>
                Attendance from {rangeFrom} to {rangeTo}
              </CardTitle>
              <CardDescription>
                Total Records: {filteredRangeAttendance.length} | Present:{" "}
                {presentCountRange} | Absent: {absentCountRange}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTable ? (
                <div>Loading...</div>
              ) : filteredRangeAttendance.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={filteredRangeAttendance}
                  searchColumn="name"
                  searchPlaceholder="Search students..."
                />
              ) : (
                <div>No attendance records found for this date range and filter.</div>
              )}
            </CardContent>
          </Card>
        ) : !showView && attendanceAlreadySubmitted ? (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <h2 className="text-lg font-bold mb-4 text-green-700">
              Attendance for today is already submitted.
            </h2>
            <Button variant="outline" onClick={() => setShowView(true)}>
              <Eye className="mr-2 h-4 w-4" />
              View Attendance
            </Button>
          </div>
        ) : !showView ? (
          <>
            <div className="space-y-1 mb-6">
              <h2 className="page-title">Take Attendance</h2>
              <p className="page-description">Mark attendance for students</p>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleMarkAll("present")}
                  disabled={attendanceAlreadySubmitted}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark All Present
                </Button>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleMarkAll("absent")}
                  disabled={attendanceAlreadySubmitted}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Mark All Absent
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    handleDownloadExcel(
                      getExcelData(),
                      `attendance_${getLocalDateString()}.xlsx`
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Excel
                </Button>
              </div>
            </div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Student Attendance</CardTitle>
                <CardDescription>
                  Date: {getLocalDateString()} | Total: {filteredStudents.length} |
                  Present: {presentCount} | Absent: {absentCount}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={filteredStudents}
                  searchColumn="name"
                  searchPlaceholder="Search students..."
                />
              </CardContent>
              <CardFooter className="flex justify-end py-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || attendanceAlreadySubmitted}
                >
                  {isSubmitting ? "Submitting..." : "Submit Attendance"}
                </Button>
              </CardFooter>
            </Card>
          </>
        ) : (
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <Button variant="outline" onClick={() => setShowView(false)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Take Attendance
              </Button>
              <label className="font-medium ml-2">Select Date:</label>
              <input
                type="date"
                className="p-2 border rounded-md"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <label className="font-medium ml-4">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border rounded-md"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={() =>
                  handleDownloadExcel(getExcelData(), `attendance_${selectedDate}.xlsx`)
                }
                disabled={loadingTable}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Excel
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Attendance on {selectedDate}</CardTitle>
                <CardDescription>
                  Total: {filteredAttendance.length} | Present: {presentCountView} | Absent: {absentCountView}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTable ? (
                  <div>Loading...</div>
                ) : filteredAttendance.length > 0 ? (
                  <DataTable
                    columns={columns}
                    data={filteredAttendance}
                    searchColumn="name"
                    searchPlaceholder="Search students..."
                  />
                ) : (
                  <div>No attendance records found for this date and filter.</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout2>
  );
};

export default TakeAttendance;
