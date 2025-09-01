import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Eye, Download, Info } from "lucide-react";
import Layout2 from "../components/layout/Layout2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";

type AdminComplaint = {
  id: number;
  adminId: number;
  adminName: string;
  category: string;
  description: string;
  fileUrl: string;
  createdAt: string;
  status: string;
};

const API_URL = "https://backend-hostel-module-production-iist.up.railway.app/api/admin-complaints";

const SuperAdminAdminComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [selected, setSelected] = useState<AdminComplaint | null>(null);
  const [error, setError] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [historyView, setHistoryView] = useState(false);

  const fetchComplaints = (month?: number, year?: number) => {
    let url = API_URL;
    const params = [];
    if (!historyView && month && year) {
      params.push(`month=${month}`);
      params.push(`year=${year}`);
    }
    if (params.length) url += "?" + params.join("&");
    fetch(url)
      .then(res => res.json())
      .then(data => setComplaints(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load admin complaints."));
  };

  useEffect(() => {
    if (historyView) {
      fetchComplaints();
    } else {
      fetchComplaints(selectedDate.getMonth() + 1, selectedDate.getFullYear());
    }
    // eslint-disable-next-line
  }, [selectedDate, historyView]);

  const exportToExcel = () => {
    const data = complaints.map(c => ({
      ID: c.id,
      Admin: c.adminName,
      Category: c.category,
      Status: c.status,
      Date: c.createdAt ? new Date(c.createdAt).toLocaleString() : "",
      Description: c.description,
      "File URL": c.fileUrl,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AdminComplaints");
    XLSX.writeFile(workbook, "admin_complaints.xlsx");
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
          <Button
            className="bg-gray-100 border"
            onClick={() => setHistoryView(!historyView)}
            variant="outline"
          >
            {historyView ? "Monthly View" : "Show History"}
          </Button>
          <Button className="bg-green-600 text-white" onClick={exportToExcel}>
            <Download className="inline w-4 h-4 mr-1" /> Export Excel
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Admin Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="bg-red-50 border-red-200 mb-4">
                <Info className="text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            {!complaints.length && <div>No admin complaints found.</div>}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">ID</th>
                    <th className="p-2">Admin</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Date</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="p-2">{c.id}</td>
                      <td className="p-2">{c.adminName || "Unknown"}</td>
                      <td className="p-2">{c.category}</td>
                      <td className="p-2">{c.status}</td>
                      <td className="p-2">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}</td>
                      <td className="p-2">
                        <Button size="sm" variant="outline" onClick={() => setSelected(c)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Details Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
              <h2 className="text-xl font-bold mb-2">Complaint #{selected.id}</h2>
              <div className="mb-2">
                <b>Admin:</b> {selected.adminName || "Unknown"}
              </div>
              <div className="mb-2"><b>Category:</b> {selected.category}</div>
              <div className="mb-2"><b>Status:</b> {selected.status}</div>
              <div className="mb-2"><b>Date:</b> {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : ""}</div>
              <div className="mb-2"><b>Description:</b><br />{selected.description}</div>
              {selected.fileUrl && (
                <div className="mb-2">
                  <Button
                    asChild
                    className="bg-green-600"
                  >
                    <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer" download>
                      <Download className="inline w-4 h-4 mr-1" /> Download Attachment
                    </a>
                  </Button>
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={() => setSelected(null)} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout2>
  );
};

export default SuperAdminAdminComplaints;