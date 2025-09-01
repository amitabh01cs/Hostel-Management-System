import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Status filter options
const statusOptions = [
  { label: "All", value: "" },
  { label: "Present", value: "present" },
  { label: "Absent", value: "absent" },
];

const ViewAttendance = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState(""); // "" = All, or present/absent (lowercase!)

  // Always fetch attendance for selectedDate on mount and each date change
  useEffect(() => {
    setLoading(true);
    // GET /api/attendance/date?date=yyyy-MM-dd
    fetch(`https://backend-hostel-module-production-iist.up.railway.app/api/attendance/date?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        setAttendance(data);
        setLoading(false);
      });
  }, [selectedDate]);

  // Filter attendance based on status dropdown
  const filteredAttendance = statusFilter
    ? attendance.filter(a => (a.status || "").toLowerCase() === statusFilter)
    : attendance;

  // Count present/absent in the full data
  const presentCount = attendance.filter(a => (a.status || "").toLowerCase() === "present").length;
  const absentCount  = attendance.filter(a => (a.status || "").toLowerCase() === "absent").length;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(
      `Attendance for ${selectedDate} - ${
        statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : "All"
      }`,
      14,
      15
    );
    doc.autoTable({
      head: [["Sr No.", "Student Name", "Roll", "Room", "Course", "Year", "Status"]],
      body: filteredAttendance.map((s, i) => [
        i + 1,
        s.name,
        s.rollNo,
        s.roomNo || "",
        s.course,
        s.year,
        s.status
      ]),
    });
    doc.save(
      `attendance_${selectedDate}_${statusFilter || "all"}.pdf`
    );
  };

  const columns = [
    { accessorKey: "id", header: "Sr No." },
    { accessorKey: "name", header: "Student Name" },
    { accessorKey: "rollNo", header: "Student Roll" },
    { accessorKey: "course", header: "Course" },
    { accessorKey: "roomNo", header: "Room No" },
    { accessorKey: "year", header: "Year" },
    { accessorKey: "status", header: "Status" },
  ];

  return (
    <div>
      <h2 className="page-title mb-4">Attendance Reports</h2>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="font-medium">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="input"
        />
        <label className="font-medium ml-4">Status:</label>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={handleDownloadPDF}
          disabled={loading}
        >
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            Attendance on {selectedDate}
          </CardTitle>
          <CardDescription>
            Total: {filteredAttendance.length} | Present: {presentCount} | Absent: {absentCount}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            filteredAttendance.length > 0 ? (
              <DataTable
                columns={columns}
                data={filteredAttendance}
                searchColumn="name"
                searchPlaceholder="Search students..."
              />
            ) : (
              <div>No attendance records found for this date and filter.</div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewAttendance;