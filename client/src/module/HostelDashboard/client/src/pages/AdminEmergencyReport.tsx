import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Mic, StopCircle, Info } from "lucide-react";
import Layout2 from "../components/layout/Layout2";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
// Auth Hook:
import { useAdminAuth } from "../hooks/useAdminAuth";

type Student = {
  id: number;
  fullName: string;
  gender?: string;
};

const AdminEmergencyReport: React.FC = () => {
  // Auth hook:
  const { admin, loading } = useAdminAuth();

  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(null);
  const [submitMsg, setSubmitMsg] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentId, setStudentId] = useState("");
  const recognitionRef = useRef<any>(null);

  // CHANGED: Combined Auth Guard and Data Fetching into one useEffect
  useEffect(() => {
    // Wait until auth state is confirmed
    if (loading) {
      return;
    }
    // If not admin after loading, redirect
    if (!admin) {
      window.location.href = "/login";
      return;
    }

    // Fetch students based on admin type from the auth hook
    setStudentsLoading(true);
    const adminType = admin.adminType ? admin.adminType.trim().toLowerCase() : "";
    let url = "https://hostel-backend-module-production-iist.up.railway.app/api/student/filtered-list";

    // Append gender query param based on adminType
    if (adminType === "varahmihir") {
      url += "?gender=M";
    } else if (adminType === "maitreyi") {
      url += "?gender=F";
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);
      })
      .catch(() => {
        setStudents([]);
      })
      .finally(() => {
        setStudentsLoading(false);
      });
  }, [admin, loading]); // This effect now correctly depends on the auth state

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

    // CHANGED: Get adminId directly from the 'admin' object from the hook
    if (!admin || !admin.adminId) {
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
          adminId: admin.adminId, // Using adminId from hook
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

  if (loading || !admin) {
      return (
          <Layout2>
              <div className="p-8">Loading...</div>
          </Layout2>
      )
  }

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
                  Report Details *
                </label>
                <div className="relative">
                  <Textarea
                    placeholder="Start speaking or type here..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={6}
                    className="pr-20"
                  />
                  <div className="absolute top-2 right-2 flex flex-col space-y-2">
                    <Button
                      type="button"
                      size="icon"
                      variant={listening ? "destructive" : "outline"}
                      onClick={listening ? stopListening : startListening}
                    >
                      {listening ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Submit Report
              </Button>
            </form>
            {submitMsg && (
              <Alert className="mt-4" variant={submitStatus === "success" ? "default" : "destructive"}>
                <AlertDescription>{submitMsg}</AlertDescription>
              </Alert>
            )}
            <Alert className="mt-6" variant="default">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Click the microphone to start voice-to-text. The report will be submitted under your admin ID.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </Layout2>
  );
};

export default AdminEmergencyReport;
