import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import { Eye } from "lucide-react";
import Layout2 from "../components/layout/Layout2";

type EmergencyReport = {
  id: number;
  adminId: number;
  adminName: string;
  studentId: number;
  studentName: string;
  transcript: string;
  createdAt: string;
  status: string;
};

const API_URL = "https://hostel-backend-module-production-iist.up.railway.app/api/emergency-reports";

const SuperAdminEmergencyReports: React.FC = () => {
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [selected, setSelected] = useState<EmergencyReport | null>(null);
  const [error, setError] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [historyView, setHistoryView] = useState(false);

  const fetchReports = (month?: number, year?: number) => {
    let url = API_URL;
    const params = [];
    if (!historyView && month && year) {
      params.push(`month=${month}`);
      params.push(`year=${year}`);
    }
    if (params.length) url += "?" + params.join("&");
    fetch(url)
      .then(res => res.json())
      .then(data => setReports(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load emergency reports."));
  };

  useEffect(() => {
    if (historyView) {
      fetchReports();
    } else {
      fetchReports(selectedDate.getMonth() + 1, selectedDate.getFullYear());
    }
    // eslint-disable-next-line
  }, [selectedDate, historyView]);

  const exportToExcel = () => {
    const data = reports.map(r => ({
      ID: r.id,
      Admin: r.adminName,
      Student: r.studentName,
      Date: r.createdAt ? new Date(r.createdAt).toLocaleString() : "",
      Transcript: r.transcript,
      Status: r.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EmergencyReports");
    XLSX.writeFile(workbook, "emergency_reports.xlsx");
  };

  return (
    <Layout2>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <DatePicker
            selected={selectedDate}
            onChange={date => date && setSelectedDate(date)}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            disabled={historyView}
            className="border p-1 rounded"
          />
          <button
            className="btn bg-gray-100 border"
            onClick={() => setHistoryView(!historyView)}
          >
            {historyView ? "Monthly View" : "Show History"}
          </button>
          <button className="btn bg-green-600 text-white" onClick={exportToExcel}>
            Export Excel
          </button>
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {!reports.length && <div>No emergency reports found.</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">ID</th>
                <th className="p-2">Admin</th>
                <th className="p-2">Student</th>
                <th className="p-2">Date</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.id}</td>
                  <td className="p-2">{r.adminName || "Unknown"}</td>
                  <td className="p-2">{r.studentName || "Unknown"}</td>
                  <td className="p-2">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}</td>
                  <td className="p-2">
                    <button
                      className="text-blue-600 underline"
                      onClick={() => setSelected(r)}
                    >
                      <Eye className="inline w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Details Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
              <h2 className="text-xl font-bold mb-2">Report #{selected.id}</h2>
              <div className="mb-2"><b>Admin:</b> {selected.adminName || "Unknown"}</div>
              <div className="mb-2"><b>Student:</b> {selected.studentName || "Unknown"}</div>
              <div className="mb-2"><b>Date:</b> {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : ""}</div>
              <div className="mb-2"><b>Transcript:</b><br />{selected.transcript}</div>
              <div className="flex justify-end">
                <button className="btn" onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout2>
  );
};

export default SuperAdminEmergencyReports;