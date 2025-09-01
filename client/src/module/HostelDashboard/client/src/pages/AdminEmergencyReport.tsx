import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Mic, StopCircle, Info } from "lucide-react";
import Layout2 from "../components/layout/Layout2";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
//Add Auth: 
import { useAdminAuth } from "../hooks/useAdminAuth";


type Student = {
  id: number;
  fullName: string;
  gender?: string;
};

const AdminEmergencyReport: React.FC = () => {

    //auth hook: 
    const { admin , loading } = useAdminAuth();


  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(null);
  const [submitMsg, setSubmitMsg] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentId, setStudentId] = useState("");
  // Gender filter state, set automatically based on admin type
  const [genderFilter, setGenderFilter] = useState<"" | "M" | "F">("");
  const recognitionRef = useRef<any>(null);

  //Auth Gaurd : 
  useEffect(() => {
    if(!loading && !admin) {
        window.location.href ="/login";
    }
  } , [admin , loading]);

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

  // Get adminId from localStorage
  const adminUserRaw = localStorage.getItem("adminUser");
  const adminUser = adminUserRaw ? JSON.parse(adminUserRaw) : null;
  const adminId = adminUser?.adminId;

  // Fetch students when genderFilter changes
  useEffect(() => {
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
  }, [genderFilter]);

  const startListening = () => {
    setSubmitStatus(null);
    setSubmitMsg("");

    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setSubmitStatus("error");
      setSubmitMsg("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const t = event.results[i][0].transcript.trim();
        if (event.results[i].isFinal) {
          setTranscript((prev) => (prev ? prev + " " : "") + t);
        }
      }
    };

    recognition.onerror = (event: any) => {
      setListening(false);
      setSubmitStatus("error");
      setSubmitMsg("Speech recognition error: " + event.error);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
    setSubmitMsg("");

    if (!adminId) {
      setSubmitStatus("error");
      setSubmitMsg("You are not logged in as Admin!");
      return;
    }

    if (!transcript.trim()) {
      setSubmitStatus("error");
      setSubmitMsg("Transcript cannot be empty.");
      return;
    }

    if (!studentId) {
      setSubmitStatus("error");
      setSubmitMsg("Please select a student.");
      return;
    }

    try {
      const res = await fetch("https://hostel-backend-module-production-iist.up.railway.app/api/emergency-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId,
          studentId,
          transcript,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitStatus("success");
        setSubmitMsg("Emergency report submitted! Report ID: " + data.id);
        setTranscript("");
        setStudentId("");
      } else {
        setSubmitStatus("error");
        setSubmitMsg(data.message || "Submission failed.");
      }
    } catch (err) {
      setSubmitStatus("error");
      setSubmitMsg("Failed to submit. " + (err as any).message);
    }
  };

  return (
    <Layout2>
      <div className="p-8 max-w-xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold mb-4">Report Emergency</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-medium mb-1">
                  Select Student Involved *
                </label>
                {studentsLoading ? (
                  <div className="text-sm text-gray-500">Loading students...</div>
                ) : (
                  <Select value={studentId} onValueChange={setStudentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students
                        .filter(s => s.id !== undefined && s.id !== null && String(s.id).trim() !== "")
                        .map(s => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.fullName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Speak or type your emergency report
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    className="bg-green-600"
                    onClick={startListening}
                    disabled={listening}
                  >
                    <Mic className="mr-2" /> {listening ? "Listening..." : "Start Speaking"}
                  </Button>
                  <Button
                    type="button"
                    className="bg-red-600"
                    onClick={stopListening}
                    disabled={!listening}
                  >
                    <StopCircle className="mr-2" /> Stop
                  </Button>
                </div>
                <Textarea
                  rows={6}
                  placeholder="Emergency description (you can also edit here)"
                  className="mt-2"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  required
                />
              </div>

              {submitStatus && (
                <Alert
                  className={
                    submitStatus === "success"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }
                >
                  <Info
                    className={
                      submitStatus === "success" ? "text-green-600" : "text-red-600"
                    }
                  />
                  <AlertDescription
                    className={
                      submitStatus === "success"
                        ? "text-green-800"
                        : "text-red-800"
                    }
                  >
                    {submitMsg}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600"
                disabled={listening}
              >
                Submit Emergency Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout2>
  );
};

export default AdminEmergencyReport;