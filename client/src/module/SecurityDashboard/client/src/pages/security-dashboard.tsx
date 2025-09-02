import { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";
import {
  Search, Shield, Users, UserX, UserCheck, Clock, MapPin, FileText,
  History, LogOut, Download
} from "lucide-react";
import { useSecurityAuth } from "../hooks/useSecurityAuth";

import { useTranslation, initReactI18next } from "react-i18next";
import i18n from "i18next";

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
      "Checked Out Only": "Checked Out Only",
      "Available on Campus": "Available on Campus",
      "Total Students": "Total Students",
      "Checked Out": "Checked Out",
      "On Campus": "On Campus",
      "Hourly Passes": "Hourly Passes",
      "Active Students": "Active Students",
      "students found": "students found",
      "No students found": "No students found",
      "Try adjusting your search terms or filters to find the students you're looking for.": "Try adjusting your search terms or filters to find the students you're looking for.",
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
      "Students who complete their check-in process will appear here.": "Students who complete their check-in process will appear here.",
      "Approved Return Time (Arrival):": "Approved Return Time (Arrival):",
      "Actual Check-In Time:": "Actual Check-In Time:",
      "Passes History": "Passes History",
      "Select Date:": "Select Date:",
      "Download Excel": "Download Excel",
      "No data found": "No data found",
      "Logout": "Logout",
      "View Passes History": "View Passes History",
      "Check Out Successful": "Check Out Successful",
      "Check In Successful": "Check In Successful",
      "Check Out Failed": "Check Out Failed",
      "Check In Failed": "Check In Failed",
      "Late Check-In Alert": "Late Check-In Alert",
      "This check-in is late!": "This check-in is late!",
      "Language": "Language"
    }
  },
  hi: {
    translation: {
      "Campus Security": "कैम्पस सुरक्षा",
      "Student Entry/Exit Tracking": "छात्र प्रवेश/निकास ट्रैकिंग",
      "Search Students": "छात्र खोजें",
      "Pass Type": "पास प्रकार",
      "Status": "स्थिति",
      "All Types": "सभी प्रकार",
      "Hourly": "घंटे का",
      "Days": "दिन",
      "All Students": "सभी छात्र",
      "Checked Out Only": "सिर्फ बाहर गए",
      "Available on Campus": "कैम्पस में उपलब्ध",
      "Total Students": "कुल छात्र",
      "Checked Out": "बाहर गए",
      "On Campus": "कैम्पस में",
      "Hourly Passes": "घंटे के पास",
      "Active Students": "सक्रिय छात्र",
      "students found": "छात्र मिले",
      "No students found": "कोई छात्र नहीं मिला",
      "Try adjusting your search terms or filters to find the students you're looking for.": "छात्रों को खोजने के लिए अपने खोज शब्द या फ़िल्टर को समायोजित करें।",
      "Reason:": "कारण:",
      "Place:": "स्थान:",
      "Pass no:": "पास संख्या:",
      "Journey Completed": "यात्रा पूरी हुई",
      "Late Check-In": "देर से चेक-इन",
      "Check Out": "चेक आउट",
      "Check In": "चेक इन",
      "Recent Activity": "हाल की गतिविधि",
      "No recent activity": "कोई हाल की गतिविधि नहीं",
      "Completed Student Logs": "पूर्ण छात्र लॉग",
      "No completed entries": "कोई पूर्ण प्रविष्टियाँ नहीं",
      "Students who complete their check-in process will appear here.": "जो छात्र चेक-इन पूरा करेंगे, वे यहाँ दिखेंगे।",
      "Approved Return Time (आगमन):": "अनुमोदित वापसी समय (आगमन):",
      "Actual Check-In Time:": "वास्तविक चेक-इन समय:",
      "Passes History": "पास इतिहास",
      "Select Date:": "तारीख़ चुनें:",
      "Download Excel": "एक्सेल डाउनलोड करें",
      "No data found": "कोई डेटा नहीं मिला",
      "Logout": "लॉगआउट",
      "View Passes History": "पास इतिहास देखें",
      "Check Out Successful": "चेक आउट सफल",
      "Check In Successful": "चेक इन सफल",
      "Check Out Failed": "चेक आउट असफल",
      "Check In Failed": "चेक इन असफल",
      "Late Check-In Alert": "देर से चेक-इन अलर्ट",
      "This check-in is late!": "यह चेक-इन देर से है!",
      "Language": "भाषा"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

const languageOptions = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
];

// ********* NO PROXY, ONLY DIRECT PHOTO URL OR PRAVATAR *********
function getPhotoUrl(photoUrl: string | undefined, name: string) {
  // Directly use photoUrl if available and non-empty
  if (photoUrl && photoUrl.trim() !== "")
    return photoUrl;
  // Otherwise fallback to pravatar
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`;
}

function getInitials(name: string | undefined | null) {
  if (!name) return "";
  return name
    .split(" ")
    .filter(n => n.length > 0)
    .map(n => n[0])
    .join("")
    .toUpperCase();
}

function formatTime(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = new Date(date as any);
  if (isNaN(d.getTime())) return "";
  return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
}

function formatAMPM(dateStr: string | undefined) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(i18n.language, { hour: "numeric", minute: "2-digit", hour12: true });
}

const API_PREFIX = "https://hostel-backend-module-production-iist.up.railway.app/api/security";

export default function SecurityDashboard() {
  const { t } = useTranslation();
  const { security, loading } = useSecurityAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [passTypeFilter, setPassTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState(i18n.language);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyDate, setHistoryDate] = useState<Date>(new Date());
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [lateCheckInIds, setLateCheckInIds] = useState([]);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: [`${API_PREFIX}/active-passes`],
    queryFn: async () => {
      const res = await fetch(`${API_PREFIX}/active-passes`);
      return res.json();
    }
  });

  const { data: completedStudents = [], isLoading: completedLoading } = useQuery({
    queryKey: [`${API_PREFIX}/completed-logs`],
    queryFn: async () => {
      const res = await fetch(`${API_PREFIX}/completed-logs`);
      return res.json();
    }
  });

  const { data: stats } = useQuery({
    queryKey: [`${API_PREFIX}/stats`],
    queryFn: async () => {
      const res = await fetch(`${API_PREFIX}/stats`);
      if (res.status === 200) return res.json();
      return undefined;
    },
    enabled: false,
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: [`${API_PREFIX}/activity-logs`],
    queryFn: async () => {
      const res = await fetch(`${API_PREFIX}/activity-logs`);
      return res.json();
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: async (gatePassId) => {
      const res = await fetch(`${API_PREFIX}/pass/${gatePassId}/checkout`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to check out");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`${API_PREFIX}/active-passes`] });
      queryClient.invalidateQueries({ queryKey: [`${API_PREFIX}/activity-logs`] });
      toast({ title: t("Check Out Successful"), description: `${data.name} ${t("has been checked out successfully.")}` });
    },
    onError: (error) => {
      toast({ title: t("Check Out Failed"), description: error.message || t("Failed to check out student"), variant: "destructive" });
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async ({ gatePassId, isLate }) => {
      const res = await fetch(`${API_PREFIX}/pass/${gatePassId}/checkin`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to check in");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`${API_PREFIX}/active-passes`] });
      queryClient.invalidateQueries({ queryKey: [`${API_PREFIX}/completed-logs`] });
      queryClient.invalidateQueries({ queryKey: [`${API_PREFIX}/activity-logs`] });
      toast({ title: t("Check In Successful"), description: `${data.name} ${t("has been checked in and moved to completed logs.")}` });
      setLateCheckInIds(ids => ids.filter(id => id !== data.id));
    },
    onError: (error) => {
      toast({ title: t("Check In Failed"), description: error.message || t("Failed to check in student"), variant: "destructive" });
    },
  });

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = searchTerm === "" ||
        (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.course && student.course.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.passNumber || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.reason || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.destination || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPassType = passTypeFilter === "all" || student.passType === passTypeFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "out" && student.status === "out") ||
        (statusFilter === "in" && student.status === "active");
      return matchesSearch && matchesPassType && matchesStatus;
    });
  }, [students, searchTerm, passTypeFilter, statusFilter]);

  const handleCheckOut = id => checkOutMutation.mutate(id);

  const handleCheckIn = (student) => {
    let isLate = false;
    if (student.toTime) {
      const approved = new Date(student.toTime);
      const now = new Date();
      if (!isNaN(approved.getTime()) && now > approved) isLate = true;
    }
    if (isLate) {
      toast({ title: t("Late Check-In Alert"), description: t("This check-in is late!"), variant: "destructive" });
      setLateCheckInIds(ids => [...ids, student.id]);
    }
    checkInMutation.mutate({ gatePassId: student.id, isLate });
  };

  const fetchHistory = async (date) => {
    setHistoryLoading(true);
    const dateStr = date.toISOString().slice(0, 10);
    const res = await fetch(`${API_PREFIX}/completed-logs?date=${dateStr}`);
    const data = await res.json();
    setHistoryData(data || []);
    setHistoryLoading(false);
  };

  const handleOpenHistory = () => { setHistoryModalOpen(true); setHistoryDate(new Date()); fetchHistory(new Date()); };
  const handleDateChange = date => { setHistoryDate(date); fetchHistory(date); };

  const handleDownloadExcel = () => {
    const wsData = [
      [t("Name"), t("Course"), t("Pass No"), t("Reason"), t("Destination"), t("Check Out"), t("Check In"), t("Journey Status")],
      ...historyData.map(student => {
        let status = "";
        if (student.toTime && student.checkInTime) {
          const approved = new Date(student.toTime);
          const actual = new Date(student.checkInTime);
          if (!isNaN(approved.getTime()) && !isNaN(actual.getTime())) {
            status = actual <= approved ? t("Journey Completed") : t("Late Check-In");
          }
        }
        return [
          student.name || "",
          student.course || "",
          student.passNumber || "",
          student.reason || "",
          student.destination || "",
          formatTime(student.checkOutTime),
          formatTime(student.checkInTime),
          status
        ];
      }),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Passes");
    XLSX.writeFile(wb, `passes-history-${historyDate.toISOString().slice(0, 10)}.xlsx`);
  };

  const handleLogout = () => {
    localStorage.removeItem("securityUser");
    window.location.href = "/login";
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-start"></div>
              <div className="flex items-center space-x-2 ml-8">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">{t("Campus Security")}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleString(i18n.language, { hour: 'numeric', minute: '2-digit', hour12: true, month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {security && <span className="text-base font-medium text-gray-900">{security.name}</span>}
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t("Language")} />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-end mb-4">
            <Button variant="secondary" onClick={handleOpenHistory} className="bg-indigo-600 text-white">
              {t("View Passes History")}
            </Button>
          </div>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="dashboard">{t("Dashboard")}</TabsTrigger>
              <TabsTrigger value="logs">{t("Completed Student Logs")}</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard">
              <Card className="mb-8">
                <CardContent className="p-6">
                  {/* ... (rest of dashboard content unchanged) ... */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-gray-800">{t("Active Students")}</h2><div className="text-sm text-gray-600">{filteredStudents.length} {t("students found")}</div></div>
                    {studentsLoading ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[...Array(6)].map((_, i) => (
                          <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">{t("No students found")}</h3>
                          <p className="text-gray-600">{t("Try adjusting your search terms or filters to find the students you're looking for.")}</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredStudents.map(student => {
                          const isLate = student.toTime && student.status === "out" && new Date() > new Date(student.toTime);
                          return (
                            <Card key={student.id} className="hover:shadow-md transition-shadow duration-200">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-4">
                                    <Avatar className="w-16 h-16">
                                      <AvatarImage
                                        src={getPhotoUrl(student.photoUrl, student.name)}
                                        alt={student.name}
                                        className="object-cover"
                                        onError={e => { e.currentTarget.src = "/no-image.png"; }}
                                      />
                                      <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                    </Avatar>
                                    {/* ... (rest unchanged) ... */}
                                  </div>
                                  {/* ... (buttons unchanged) ... */}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* ... logs and history modals ... */}
            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="w-5 h-5" />
                    <span>{t("Completed Student Logs")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* ... (completed logs unchanged, update Avatar as below) ... */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[...completedStudents]
                      .sort((a, b) => {
                        const aTime = a.checkInTime ? new Date(a.checkInTime).getTime() : (a.checkOutTime ? new Date(a.checkOutTime).getTime() : 0);
                        const bTime = b.checkInTime ? new Date(b.checkInTime).getTime() : (b.checkOutTime ? new Date(b.checkOutTime).getTime() : 0);
                        return bTime - aTime;
                      })
                      .map((student) => {
                        // ... rest unchanged ...
                        return (
                          <div key={student.id} className="rounded-lg shadow border transition-all">
                            <div className="p-5 flex flex-col gap-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-16 h-16">
                                  <AvatarImage
                                    src={getPhotoUrl(student.photoUrl, student.name)}
                                    alt={student.name}
                                    onError={e => { e.currentTarget.src = "/no-image.png"; }}
                                  />
                                  <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                </Avatar>
                                {/* ... (rest unchanged) ... */}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          {/* ... history modal ... */}
          {historyModalOpen && (
            <div className="fixed z-50 inset-0 bg-black/30 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 relative">
                <button
                  className="absolute top-2 right-2 text-xl"
                  onClick={() => setHistoryModalOpen(false)}
                  aria-label="Close Passes History"
                >✖</button>
                <h2 className="text-xl font-bold mb-3">{t("Passes History")}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-medium">{t("Select Date:")}</span>
                  <DatePicker
                    selected={historyDate}
                    onChange={date => date && setHistoryDate(date)}
                    maxDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    className="input"
                    showPopperArrow={false}
                  />
                  <Button onClick={handleDownloadExcel} className="ml-auto" size="sm">
                    <Download className="w-4 h-4 mr-1" /> {t("Download Excel")}
                  </Button>
                </div>
                {historyLoading ? (
                  <div className="py-10 text-center">{t("Loading...")}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border mb-2">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-2 py-1 border">#</th>
                          <th className="px-2 py-1 border">{t("Name")}</th>
                          <th className="px-2 py-1 border">{t("Course")}</th>
                          <th className="px-2 py-1 border">{t("Pass No")}</th>
                          <th className="px-2 py-1 border">{t("Reason")}</th>
                          <th className="px-2 py-1 border">{t("Destination")}</th>
                          <th className="px-2 py-1 border">{t("Check Out")}</th>
                          <th className="px-2 py-1 border">{t("Check In")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-8">{t("No data found")}</td>
                          </tr>
                        ) : (
                          historyData.map((student, idx) => (
                            <tr key={student.id}>
                              <td className="border px-2 py-1">{idx + 1}</td>
                              <td className="border px-2 py-1">
                                <div className="flex items-center">
                                  <Avatar className="w-8 h-8 mr-2">
                                    <AvatarImage
                                      src={getPhotoUrl(student.photoUrl, student.name)}
                                      alt={student.name}
                                      onError={e => { e.currentTarget.src = "/no-image.png"; }}
                                    />
                                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                  </Avatar>
                                  {student.name}
                                </div>
                              </td>
                              <td className="border px-2 py-1">{student.course}</td>
                              <td className="border px-2 py-1">{student.passNumber}</td>
                              <td className="border px-2 py-1">{student.reason}</td>
                              <td className="border px-2 py-1">{student.destination}</td>
                              <td className="border px-2 py-1">{formatTime(student.checkOutTime)}</td>
                              <td className="border px-2 py-1">{formatTime(student.checkInTime)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-8">
            <Button
              variant="destructive"
              size="lg"
              className="flex items-center space-x-2"
              onClick={handleLogout}
              title={t("Logout")}
            >
              <LogOut className="w-5 h-5 mr-2" />
              {t("Logout")}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
