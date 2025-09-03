import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import { useTranslation, initReactI18next } from "react-i18next";
import i18n from "i18next";

import {
  Button,
  Input,
  Select,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui";

import {
  Search,
  Shield,
  Users,
  UserX,
  UserCheck,
  Clock,
  MapPin,
  FileText,
  History,
  LogOut,
  Download,
  Eye,
  Pencil,
  CalendarDays,
} from "lucide-react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import Layout from "../components/layout/Layout";

const resources = {
  en: {
    translation: {
      "Campus Security": "Campus Security",
      "Student Entry/Exit Tracking": "Student Entry/Exit Tracking",
      "Search Students": "Search Students",
      "Pass Type": "Pass Type",
      "Status": "Status",
      "All Types": "All Types",
      "Hourly": "Hourly",
      "Days": "Days",
      "All Students": "All Students",
      "Checked Out": "Checked Out",
      "On Campus": "On Campus",
      "Checked Out Only": "Checked Out Only",
      "Available on Campus": "Available on Campus",
      "Total Students": "Total Students",
      "Hourly Passes": "Hourly Passes",
      "Active Students": "Active Students",
      "students found": "students found",
      "No students found": "No students found",
      "Try adjusting your search terms or filters to find the students you're looking for.":
        "Try adjusting your search terms or filters to find the students you're looking for.",
      "Reason:": "Reason:",
      "Place:": "Place:",
      "Pass no:": "Pass no:",
      "Journey Completed": "Journey Completed",
      "Late Check-In": "Late Check-In",
      "Check Out": "Check Out",
      "Check In": "Check In",
      "Recent Activity": "Recent Activity",
      "No recent activity": "No recent activity",
      "Completed Student Logs": "Completed Student Logs",
      "No completed entries": "No completed entries",
      "Students who complete the check-in process will appear here.":
        "Students who complete the check-in process will appear here.",
      "Approved Return Time (Arrival):": "Approved Return Time (Arrival):",
      "Actual Check-In": "Actual Check-In",
      "Passes History": "Passes History",
      "Select Date": "Select Date",
      "Download Excel": "Download Excel",
      "No data found": "No data found",
      Logout: "Logout",
    },
  },
  hi: {
    translation: {
      "Campus Security": "कैम्पस सुरक्षा",
      "Student Entry/Exit Tracking": "छात्र प्रवेश/निकास ट्रैकिंग",
      "Search Students": "छात्र खोजें",
      "Pass Type": "पास प्रकार",
      "Status": "स्थिति",
      "All Types": "सभी प्रकार",
      "Hourly": "घंटा",
      "Days": "दिन",
      "All Students": "सभी छात्र",
      "Checked Out": "बाहर गया",
      "On Campus": "कैम्पस में",
      "Checked Out Only": "केवल बाहर गया",
      "Available on Campus": "कैम्पस में उपलब्ध",
      "Total Students": "कुल छात्र",
      "Hourly Passes": "घंटे के पास",
      "Active Students": "सक्रिय छात्र",
      "students found": "छात्र मिले",
      "No students found": "कोई छात्र नहीं मिला",
      "Try adjusting your search terms or filters to find the students you're looking for.":
        "अपनी खोज की शर्तें या फ़िल्टर बदलें।",
      "Reason:": "कारण:",
      "Place:": "स्थान:",
      "Pass no:": "पास नंबर",
      "Journey Completed": "यात्रा पूरी हो गई",
      "Late Check-In": "लेट चेक-इन",
      "Check Out": "चेक आउट",
      "Check In": "चेक इन",
      "Recent Activity": "हाल की गतिविधि",
      "No recent activity": "कोई हाल की गतिविधि नहीं",
      "Completed Student Logs": "पूर्ण छात्र लॉग",
      "No completed entries": "कोई पूर्ण प्रविष्टि नहीं",
      "Students who complete the check-in process will appear here.":
        "जो छात्र चेक-इन पूरा करते हैं उन्हें यहाँ दिखाया जाएगा।",
      "Approved Return Time (Arrival):": "स्वीकृत वापसी समय (आगमन):",
      "Actual Check-In": "वास्तविक चेक-इन",
      "Passes History": "पास इतिहास",
      "Select Date": "दिनांक चुनें",
      "Download Excel": "एक्सेल डाउनलोड करें",
      "No data found": "कोई डेटा नहीं मिला",
      Logout: "लॉगआउट",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

const languageOptions = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
];

const API_BASE = "https://hostel-backend-production.up.railway.app/api";

// Utility functions
function getPhotoUrl(studentId?: number, studentName?: string) {
  if (studentId) return `${API_BASE}/student/${studentId}/photo`;
  if (studentName) return `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=random&color=fff`;
  return "/default-avatar.png";
}

function getInitials(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].substring(0, 2);
}

function formatTime(str?: string) {
  if (!str) return "-";
  const d = new Date(str);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDate(str?: string) {
  if (!str) return "-";
  const d = new Date(str);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

export default function SecurityDashboard() {
  const { t } = i18n;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Assuming you have a useAuth or similar hook to get security context
  const [security, setSecurity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching security user
    async function fetchSecurity() {
      try {
        const res = await fetch(`${API_BASE}/security/me`);
        if (res.ok) {
          const data = await res.json();
          setSecurity(data);
        } else {
          window.location.href = "/login";
        }
      } catch {
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    }
    fetchSecurity();
  }, []);

  // State
  const [students, setStudents] = useState([]);
  const [completedStudents, setCompletedStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [passTypeFilter, setPassTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyDate, setHistoryDate] = useState(new Date());
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch data
  useEffect(() => {
    if (loading) return;
    async function fetchData() {
      const [studentsRes, completedRes, statsRes, activityRes] = await Promise.all([
        fetch(`${API_BASE}/security/active-passes`),
        fetch(`${API_BASE}/security/completed-logs`),
        fetch(`${API_BASE}/security/stats`),
        fetch(`${API_BASE}/security/activity-logs`),
      ]);
      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (completedRes.ok) setCompletedStudents(await completedRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (activityRes.ok) setActivityLogs(await activityRes.json());
    }
    fetchData();
  }, [loading]);

  // Handlers for Check-In/Out
  async function handleCheckOut(id) {
    try {
      let res = await fetch(`${API_BASE}/security/pass/${id}/checkout`, { method: "POST" });
      if (!res.ok) throw new Error("Error during checkout");
      let data = await res.json();
      toast({ title: t("Check Out"), description: `${data.name} ${t("has been checked out successfully")}` });
      // Refresh
      queryClient.invalidateQueries();
    } catch (e) {
      toast({ title: t("Check Out"), description: e.message || "", variant: "destructive" });
    }
  }

  async function handleCheckIn(id, isLate) {
    try {
      let res = await fetch(`${API_BASE}/security/pass/${id}/checkin`, { method: "POST" });
      if (!res.ok) throw new Error("Error during checkin");
      let data = await res.json();
      toast({ title: t("Check In"), description: `${data.name} ${t("has been checked in")}` });
      queryClient.invalidateQueries();
    } catch (e) {
      toast({ title: t("Check In"), description: e.message || "", variant: "destructive" });
    }
  }

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (student.name && student.name.toLowerCase().includes(searchLower)) ||
        (student.course && student.course.toLowerCase().includes(searchLower)) ||
        (student.passNumber && student.passNumber.toLowerCase().includes(searchLower)) ||
        (student.reason && student.reason.toLowerCase().includes(searchLower)) ||
        (student.destination && student.destination.toLowerCase().includes(searchLower));
      const matchType = passTypeFilter === "all" || student.passType === passTypeFilter;
      const matchStatus = statusFilter === "all" || (statusFilter === "in" && student.status === "active") || (statusFilter === "out" && student.status === "out");
      return matchSearch && matchType && matchStatus;
    });
  }, [students, searchTerm, passTypeFilter, statusFilter]);

  // History load
  async function loadHistory(date) {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/security/completed-logs?date=${date.toISOString().slice(0,10)}`);
      if (res.ok) setHistoryData(await res.json());
      else setHistoryData([]);
    } catch {
      setHistoryData([]);
    }
    setHistoryLoading(false);
  }

  useEffect(() => {
    if (historyModalOpen) loadHistory(historyDate);
  }, [historyDate, historyModalOpen]);

  return (
    <Layout>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-3">
            <Shield className="text-blue-600" size={30} />
            <h1 className="text-2xl font-semibold">{t("Campus Security")}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div>{new Date().toLocaleString()}</div>
            <div>{security?.name}</div>
            <Select value={i18n.language} onValueChange={val => i18n.changeLanguage(val)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map(({ code, label }) => (
                  <SelectItem key={code} value={code}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        <main className="p-6 flex-1 overflow-auto">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="dashboard">{t("Dashboard")}</TabsTrigger>
              <TabsTrigger value="logs">{t("Completed Student Logs")}</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <div className="flex flex-col space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Student Entry/Exit Tracking")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
                      <Input
                        placeholder={t("Search Students")}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="mb-2 md:mb-0"
                      />
                      <Select value={passTypeFilter} onValueChange={setPassTypeFilter} className="w-48">
                        <SelectTrigger>
                          <SelectValue placeholder={t("All Types")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("All Types")}</SelectItem>
                          <SelectItem value="hourly">{t("Hourly")}</SelectItem>
                          <SelectItem value="days">{t("Days")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={setStatusFilter} className="w-48">
                        <SelectTrigger>
                          <SelectValue placeholder={t("All Students")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("All Students")}</SelectItem>
                          <SelectItem value="in">{t("On Campus")}</SelectItem>
                          <SelectItem value="out">{t("Checked Out")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <DataTable
                      columns={[
                        {
                          id: "photo",
                          header: "Photo",
                          cell: ({ row }) => (
                            <Avatar>
                              <AvatarImage src={getPhotoUrl(row.original.studentId, row.original.studentName)} onError={(e) => (e.currentTarget.src = "/default-avatar.png")} />
                              <AvatarFallback>{getInitials(row.original.studentName)}</AvatarFallback>
                            </Avatar>
                          ),
                        },
                        { accessorKey: "studentId", header: "ID" },
                        { accessorKey: "studentName", header: "Name" },
                        { accessorKey: "stream", header: "Stream" },
                        { accessorKey: "passType", header: "Pass Type" },
                        {
                          id: "period",
                          header: "Period",
                          cell: ({ row }) => {
                            if (row.original.passType === "hourly") {
                              return <>{formatTime(row.original.leaveDate)} - {formatTime(row.original.returnDate)}</>;
                            }
                            return <>{formatDate(row.original.leaveDate)} - {formatDate(row.original.returnDate)}</>;
                          },
                        },
                        {
                          id: "status",
                          header: "Status",
                          cell: ({ row }) => (
                            <Badge className={cn("uppercase", row.original.status === "Approved" ? "bg-green-600" : "bg-yellow-500")}>
                              {row.original.status}
                            </Badge>
                          ),
                        },
                        {
                          id: "actions",
                          header: "Actions",
                          cell: ({ row }) => (
                            <div className="space-x-2">
                              <Button size="sm" onClick={() => alert("View " + row.original.studentName)}><Eye /></Button>
                              {/* Add Approve/Reject buttons and others here */}
                            </div>
                          ),
                        },
                      ]}
                      data={filteredStudents}
                      searchColumn="studentName"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("Completed Student Logs")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {completedStudents.length === 0 ? (
                    <div>{t("No completed entries")}</div>
                  ) : (
                    completedStudents.map((student) => (
                      <Card key={student.id} className="mb-4">
                        <CardContent className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={getPhotoUrl(student.studentId, student.studentName)} onError={(e) => (e.currentTarget.src = "/default-avatar.png")} />
                            <AvatarFallback>{getInitials(student.studentName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{student.studentName}</div>
                            <div>{t("Pass no:")} {student.passNumber}</div>
                            <div>
                              {t("Approved Return Time (Arrival):")} {formatTime(student.toDate)}
                            </div>
                            <div>{t("Actual Check-In:")} {formatTime(student.checkInDate)}</div>
                          </div>
                          <Badge className={cn(student.late ? "bg-orange-600" : "bg-green-600", "uppercase")}>
                            {student.late ? t("Late Check-In") : t("Journey Completed")}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Other modals e.g. history, edit period modal can go here */}

          <div className="mt-6 flex justify-end">
            <Button variant="destructive" onClick={() => {localStorage.removeItem("securityUser"); window.location.href = "/login";}}>
              <LogOut /> {t("Logout")}
            </Button>
          </div>
        </main>
      </div>
    </Layout>
  );
}
