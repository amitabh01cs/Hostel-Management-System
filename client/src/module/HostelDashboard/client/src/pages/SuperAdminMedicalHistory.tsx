import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Info } from "lucide-react";
import Layout2 from "../components/layout/Layout2";

const SuperAdminMedicalHistory: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://backend-hostel-module-production-iist.up.railway.app/api/medical-history/reports")
      .then(res => res.json())
      .then(data => setReports(Array.isArray(data) ? data : []))  // <-- YAHAN FIX
      .catch(() => setError("Failed to load medical history reports."));
  }, []);

  return (
    <Layout2>
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Medical History Searches</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="bg-red-50 border-red-200 mb-4">
                <Info className="text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            {!reports.length && <div>No medical history searches found.</div>}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">ID</th>
                    <th className="p-2">Admin ID</th>
                    <th className="p-2">Student</th>
                    <th className="p-2">Month</th>
                    <th className="p-2">Sick Days</th>
                    <th className="p-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="p-2">{r.id}</td>
                      <td className="p-2">{r.adminId}</td>
                      <td className="p-2">{r.studentId || r.fullName}</td>
                      <td className="p-2">{r.month}</td>
                      <td className="p-2">{r.sickCount}</td>
                      <td className="p-2">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout2>
  );
};

export default SuperAdminMedicalHistory;