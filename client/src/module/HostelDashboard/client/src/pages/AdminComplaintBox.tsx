import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { FormLabel } from "../components/ui/form";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Info } from "lucide-react";
import Layout2 from "../components/layout/Layout2";

const CATEGORY_OPTIONS = [
  "Discipline",
  "Maintenance",
  "Student Welfare",
  "Security",
  "Other"
];

type Student = {
  id: number;
  fullName: string;
  gender?: string;
};


const AdminComplaintBox: React.FC = () => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [studentId, setStudentId] = useState(""); // for selected student in Discipline
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Gender filter state, set automatically based on admin type
  const [genderFilter, setGenderFilter] = useState<"" | "M" | "F">("");

  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(null);
  const [submitMsg, setSubmitMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Set genderFilter automatically from localStorage adminUser.adminType
  useEffect(() => {
    const adminUserRaw = localStorage.getItem("adminUser");
    const adminUser = adminUserRaw ? JSON.parse(adminUserRaw) : null;
    if (adminUser && adminUser.adminType) {
      const type = adminUser.adminType.trim().toLowerCase();
      if (type === "varahmihir") setGenderFilter("M");
      else if (type === "maitreyi") setGenderFilter("F");
      else setGenderFilter("");
    }
  }, []);

  // Get adminId from localStorage for submitting
  const adminUserRaw = localStorage.getItem("adminUser");
  const adminUser = adminUserRaw ? JSON.parse(adminUserRaw) : null;
  const adminId = adminUser?.adminId;

  // Fetch students when "Discipline" category is selected or gender filter changes
  useEffect(() => {
    if (category === "Discipline") {
      setStudentsLoading(true);
      let url = "https://hostel-backend-module-production-iist.up.railway.app/api/student/filtered-list";
      if (genderFilter) url += `?gender=${genderFilter}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setStudents(data);
          setStudentsLoading(false);
        })
        .catch(() => {
          setStudents([]);
          setStudentsLoading(false);
        });
    } else {
      setStudentId("");
    }
  }, [category, genderFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) {
      setSubmitStatus("error");
      setSubmitMsg("You are not logged in as Admin!");
      return;
    }
    if (!category || !description || (category === "Discipline" && !studentId)) {
      setSubmitStatus("error");
      setSubmitMsg("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setSubmitStatus(null);
    setSubmitMsg("");

    // Description me student name bhi add kar raha hai for backend clarity
    let finalDescription = description;
    if (category === "Discipline" && studentId) {
      const student = students.find(s => s.id === Number(studentId));
      if (student) {
        finalDescription = `[Student: ${student.fullName}, ID: ${student.id}] ` + description;
      }
    }

    // Using FormData for multipart/form-data (to match backend expectation)
    const formData = new FormData();
    formData.append("adminId", adminId);
    formData.append("category", category);
    formData.append("description", finalDescription);

    try {
      const res = await fetch("https://hostel-backend-module-production-iist.up.railway.app/api/admin-complaints", {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type, browser will set it for multipart/form-data
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitStatus("success");
        setSubmitMsg("Complaint submitted! Complaint ID: " + data.id);
        setCategory("");
        setDescription("");
        setStudentId("");
      } else {
        setSubmitStatus("error");
        setSubmitMsg(data.message || "Submission failed.");
      }
    } catch (err) {
      setSubmitStatus("error");
      setSubmitMsg("Failed to submit. " + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout2>
      <div className="p-8 max-w-xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold mb-2">Submit Complaint to Super Admin</h1>
            <p className="text-gray-600 mb-6">Only Super Admins can view these complaints.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <FormLabel>Category *</FormLabel>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Gender filter dropdown is removed. Gender is set automatically. */}
              {category === "Discipline" && (
                <div>
                  <FormLabel>Select Student *</FormLabel>
                  {studentsLoading ? (
                    <div className="text-sm text-gray-500">Loading students...</div>
                  ) : (
                    <Select value={studentId} onValueChange={setStudentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Filter out students with invalid id just in case */}
                        {students
                          .filter(s => s.id !== undefined && String(s.id).trim() !== "")
                          .map(s => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.fullName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
              <div>
                <FormLabel>Description *</FormLabel>
                <Textarea
                  rows={4}
                  placeholder="Describe your complaint in detail"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>
              {submitStatus && (
                <Alert className={submitStatus === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                  <Info className={submitStatus === "success" ? "text-green-600" : "text-red-600"} />
                  <AlertDescription className={submitStatus === "success" ? "text-green-800" : "text-red-800"}>
                    {submitMsg}
                  </AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Complaint"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout2>
  );
};

export default AdminComplaintBox;
