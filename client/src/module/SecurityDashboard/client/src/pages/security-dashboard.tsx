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

const resources = { /* your resources unchanged */ };

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

// Corrected photo URL to use studentId from backend
function getPhotoUrl(studentId: number | undefined, name: string) {
  return studentId
    ? `https://hostel-backend-module-production-iist.up.railway.app/api/student/photo/${studentId}`
    : `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`;
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

  const getInitialsSafe = getInitials;

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
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("Student Entry/Exit Tracking")}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">{t("Search Students")}</Label>
                      <div className="relative">
                        <Input
                          id="search"
                          placeholder={t("Search by name, course, or pass number...")}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="passType" className="block text-sm font-medium text-gray-700 mb-2">{t("Pass Type")}</Label>
                      <Select value={passTypeFilter} onValueChange={setPassTypeFilter}>
                        <SelectTrigger><SelectValue placeholder={t("All Types")} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("All Types")}</SelectItem>
                          <SelectItem value="hourly">{t("Hourly")}</SelectItem>
                          <SelectItem value="days">{t("Days")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">{t("Status")}</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger><SelectValue placeholder={t("All Students")} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("All Students")}</SelectItem>
                          <SelectItem value="out">{t("Checked Out Only")}</SelectItem>
                          <SelectItem value="in">{t("Available on Campus")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div><div className="text-2xl font-bold text-blue-600">{stats?.total || 0}</div><div className="text-sm text-blue-600">{t("Total Students")}</div></div>
                        <Users className="w-8 h-8 text-blue-500" />
                      </div>
                    </Card>
                    <Card className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div><div className="text-2xl font-bold text-red-600">{stats?.checkedOut || 0}</div><div className="text-sm text-red-600">{t("Checked Out")}</div></div>
                        <UserX className="w-8 h-8 text-red-500" />
                      </div>
                    </Card>
                    <Card className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div><div className="text-2xl font-bold text-green-600">{stats?.onCampus || 0}</div><div className="text-sm text-green-600">{t("On Campus")}</div></div>
                        <UserCheck className="w-8 h-8 text-green-500" />
                      </div>
                    </Card>
                    <Card className="bg-amber-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div><div className="text-2xl font-bold text-amber-600">{stats?.hourlyPasses || 0}</div><div className="text-sm text-amber-600">{t("Hourly Passes")}</div></div>
                        <Clock className="w-8 h-8 text-amber-500" />
                      </div>
                    </Card>
                  </div>
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
                                        src={getPhotoUrl(student.id, student.name)}
                                        alt={student.name}
                                        className="object-cover"
                                        onError={e => { e.currentTarget.src = "/no-image.png"; }}
                                      />
                                      <AvatarFallback>{getInitialsSafe(student.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                                      <p className="text-sm text-gray-600">{student.course}</p>
                                      <p className="text-sm font-medium text-blue-600 mt-1">{t("Pass no:")} {student.passNumber}</p>
                                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center space-x-1">
                                          <FileText className="w-3 h-3 text-gray-400" />
                                          <span className="text-gray-500">{t("Reason:")}</span>
                                          <span className="text-gray-900 font-medium">{student.reason}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <MapPin className="w-3 h-3 text-gray-400" />
                                          <span className="text-gray-500">{t("Place:")}</span>
                                          <span className="text-gray-900 font-medium">{student.destination}</span>
                                        </div>
                                      </div>
                                      <div className="mt-2 flex items-center space-x-2">
                                        <Badge variant={student.passType === "hourly" ? "default" : "secondary"}>
                                          <Clock className="w-3 h-3 mr-1" />
                                          {t(student.passType === "hourly" ? "Hourly" : "Days")}
                                        </Badge>
                                        <Badge variant={student.status === "active" ? "default" : "destructive"}>
                                          {student.status === "active" ? (
                                            <>
                                              <UserCheck className="w-3 h-3 mr-1" />
                                              {t("On Campus")}
                                            </>
                                          ) : (
                                            <>
                                              <UserX className="w-3 h-3 mr-1" />
                                              {t("Checked Out")}
                                              {student.checkOutTime && ` - ${formatTime(student.checkOutTime)}`}
                                            </>
                                          )}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col space-y-2 ml-4">
                                    <Button
                                      onClick={() => handleCheckOut(student.id)}
                                      disabled={student.status === "out" || checkOutMutation.isLoading}
                                      className="min-w-[100px] bg-blue-500 hover:bg-blue-600"
                                      size="sm"
                                    >
                                      {checkOutMutation.isLoading ? "..." : t("Check Out")}
                                    </Button>
                                    <Button
                                      onClick={() => handleCheckIn(student)}
                                      disabled={student.status === "active" || checkInMutation.isLoading}
                                      className={`min-w-[100px] ${isLate ? "bg-orange-500 hover:bg-orange-600" : "bg-amber-500 hover:bg-amber-600"}`}
                                      size="sm"
                                    >
                                      {checkInMutation.isLoading ? "..." : t("Check In")}
                                    </Button>
                                  </div>
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
            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="w-5 h-5" />
                    <span>{t("Completed Student Logs")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {completedLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : completedStudents.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{t("No completed entries")}</h3>
                      <p className="text-gray-600">{t("Students who complete their check-in process will appear here.")}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[...completedStudents]
                        .sort((a, b) => {
                          const aTime = a.checkInTime ? new Date(a.checkInTime).getTime() : (a.checkOutTime ? new Date(a.checkOutTime).getTime() : 0);
                          const bTime = b.checkInTime ? new Date(b.checkInTime).getTime() : (b.checkOutTime ? new Date(b.checkOutTime).getTime() : 0);
                          return bTime - aTime;
                        })
                        .map((student) => {
                          const approvedReturnTime = student.toTime;
                          const actualCheckInTime = student.checkInTime;
                          let cardBg = "#fff";
                          let badgeColor = "bg-green-600 text-white";
                          let badgeText = t("Journey Completed");
                          if (approvedReturnTime && actualCheckInTime) {
                            const approved = new Date(approvedReturnTime);
                            const actual = new Date(actualCheckInTime);
                            if (!isNaN(approved.getTime()) && !isNaN(actual.getTime())) {
                              if (actual <= approved) {
                                cardBg = "#d4edda";
                                badgeColor = "bg-green-600 text-white";
                                badgeText = t("Journey Completed");
                              } else {
                                cardBg = "#fff3cd";
                                badgeColor = "bg-orange-500 text-white";
                                badgeText = t("Late Check-In");
                              }
                            }
                          }
                          return (
                            <div key={student.id} className="rounded-lg shadow border transition-all" style={{ background: cardBg }}>
                              <div className="p-5 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-16 h-16">
                                    <AvatarImage
                                      src={getPhotoUrl(student.id, student.name)}
                                      alt={student.name}
                                      onError={e => { e.currentTarget.src = "/no-image.png"; }}
                                    />
                                    <AvatarFallback>{getInitialsSafe(student.name)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-semibold text-lg text-gray-900">{student.name}</div>
                                    <div className="text-sm text-gray-600">ID: {student.id}</div>
                                    <div className="text-sm text-blue-600 font-medium">{t("Pass no:")} {student.passNumber || "N/A"}</div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 mt-2">
                                  <div className="flex gap-2 items-center text-base">
                                    <span className="text-gray-700 font-medium">{t("Approved Return Time (Arrival):")}</span>
                                    <span className="text-gray-900 font-semibold">{formatAMPM(approvedReturnTime)}</span>
                                  </div>
                                  <div className="flex gap-2 items-center text-base">
                                    <span className="text-gray-700 font-medium">{t("Actual Check-In Time:")}</span>
                                    <span className="text-gray-900 font-semibold">{formatAMPM(actualCheckInTime)}</span>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <Badge className={badgeColor}>{badgeText}</Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
