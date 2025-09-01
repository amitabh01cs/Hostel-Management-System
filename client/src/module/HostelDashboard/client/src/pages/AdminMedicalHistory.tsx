import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Info } from "lucide-react";
import Layout2 from "../components/layout/Layout2";


const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const getCurrentMonth = () => {
  const now = new Date();
  return String(now.getMonth() + 1).padStart(2, "0");
};

const AdminMedicalHistory: React.FC = () => {
      // --- AUTH HOOK ---
     


  const [studentId, setStudentId] = useState("");
  const [month, setMonth] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    
    



    if (!studentId || !month) {
      setError("Please enter student ID or name and select month.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(
        `https://hostel-backend-module-production-iist.up.railway.app/api/medical-history?studentId=${encodeURIComponent(
          studentId
        )}&month=${encodeURIComponent(month)}`
      );
      const data = await res.json();
      // Defensive check:
      setResult(data && typeof data === "object" && !Array.isArray(data) ? data : null);
    } catch (err) {
      setError("Failed to fetch medical history.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout2>
      <div className="p-8 max-w-xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold mb-4">Medical History Search</h1>
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label className="block font-medium mb-1">
                  Student ID or Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter student ID or name"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Month</label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <Info className="text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full bg-blue-600" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </form>

            {result && typeof result === "object" && !Array.isArray(result) && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Result</h2>
                <div className="p-4 border rounded bg-gray-50">
                  <div>
                    <span className="font-medium">Student: </span>
                    {result.fullName || result.studentId || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Month: </span>
                    {months.find((m) => m.value === month)?.label}
                  </div>
                  <div>
                    <span className="font-medium">Sick days: </span>
                    {result.sickCount ?? 0}
                  </div>
                  {result.sicknessDetails && Array.isArray(result.sicknessDetails) && (
                    <div className="mt-2">
                      <span className="font-medium">Details:</span>
                      <ul className="list-disc pl-6">
                        {result.sicknessDetails.map((info: any, idx: number) => (
                          <li key={idx}>
                            {info.date}: {info.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout2>
  );
};

export default AdminMedicalHistory;