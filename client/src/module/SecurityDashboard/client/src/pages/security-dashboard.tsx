import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation, initReactI18next } from "react-i18next";
import i18n from "i18next";
import { useToast } from "../hooks/use-toast";
import Layout2 from "../components/layout/Layout2";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "../components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "../components/ui/tabs";
import {
  Eye, CalendarDays, Pencil, Download, Search, Shield, Users, UserX, UserCheck, Clock, MapPin, FileText, History, LogOut,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const resources = { /* i18n resource as in your project */ };
i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});
const API_BASE = "https://hostel-backend-module-production-iist.up.railway.app/api";
const langOptions = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
];

function getPhotoUrl(studentId, name) {
  return studentId
    ? `${API_BASE}/student/photo/${studentId}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
}
function getInitials(name) {
  if (!name) return "";
  return name.split(" ").filter(n => n.length > 0).map(n => n[0]).join("").toUpperCase();
}
function formatTime(str) {
  if (!str) return "-";
  const d = new Date(str);
  return isNaN(d.getTime()) ? "-" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDate(str) {
  if (!str) return "-";
  const d = new Date(str);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
}
function formatAMPM(str) {
  if (!str) return "";
  const d = new Date(str);
  if (isNaN(d.getTime())) return "";
  // Adjust locale for Hindi support
  return d.toLocaleTimeString(i18n.language, { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function SecurityDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Main state and data
  const [students, setStudents] = useState([]);
  const [completedStudents, setCompletedStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [activityLogs, setActivityLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [passTypeFilter, setPassTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [language, setLanguage] = useState(i18n.language);
  const [historyModal, setHistoryModal] = useState(false);
  const [historyDate, setHistoryDate] = useState(new Date());
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [detailsStudent, setDetailsStudent] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [editFrom, setEditFrom] = useState("");
  const [editTo, setEditTo] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { i18n.changeLanguage(language); }, [language]);
  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [
        studentsRes, completedRes, statsRes, activityRes
      ] = await Promise.all([
        fetch(`${API_BASE}/security/active-passes`),
        fetch(`${API_BASE}/security/completed-logs`),
        fetch(`${API_BASE}/security/stats`),
        fetch(`${API_BASE}/security/activity-logs`)
      ]);
      setStudents(await studentsRes.json());
      setCompletedStudents(await completedRes.json());
      setStats(statsRes.ok ? await statsRes.json() : {});
      setActivityLogs(await activityRes.json());
    } finally { setLoading(false); }
  }
  async function handleCheckOut(id) {
    await fetch(`${API_BASE}/security/pass/${id}/checkout`, { method: "POST" });
    toast({ title: t("Check Out Successful") });
    fetchAll();
  }
  async function handleCheckIn(id) {
    await fetch(`${API_BASE}/security/pass/${id}/checkin`, { method: "POST" });
    toast({ title: t("Check In Successful") });
    fetchAll();
  }

  // Filtering
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const sText = search.toLowerCase();
      const mSearch = !search || (s.name && s.name.toLowerCase().includes(sText)) || (s.course && s.course.toLowerCase().includes(sText));
      const mType = passTypeFilter === "all" || s.passType === passTypeFilter;
      const mStatus = statusFilter === "all" || (statusFilter === "in" && s.status === "active") || (statusFilter === "out" && s.status === "out");
      return mSearch && mType && mStatus;
    });
  }, [students, search, passTypeFilter, statusFilter]);

  // Edit modal helpers
  function openEditModal(student) {
    setEditStudent(student);
    setEditFrom(student.leaveDate ? student.leaveDate.slice(0, 16) : "");
    setEditTo(student.returnDate ? student.returnDate.slice(0, 16) : "");
    setEditModal(true);
  }
  async function saveEditModal() {
    if (!editStudent) return;
    await fetch(`${API_BASE}/gate-pass/${editStudent.id}/edit-time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromTime: editFrom, toTime: editTo }),
    });
    toast({ title: t("Pass period updated") });
    setEditModal(false);
    fetchAll();
  }

  // History
  async function loadHistory(date) {
    setHistoryLoading(true);
    const res = await fetch(`${API_BASE}/security/completed-logs?date=${date.toISOString().slice(0,10)}`);
    setHistoryData(res.ok ? await res.json() : []);
    setHistoryLoading(false);
  }
  useEffect(() => { if (historyModal) loadHistory(historyDate); }, [historyDate, historyModal]);

  if (loading) return <Layout2><div className="p-8">{t("Loading...")}</div></Layout2>;

  return (
    <Layout2>
      <header className="flex justify-between items-center border-b bg-white p-4">
        <div className="flex items-center gap-2">
          <Shield className="text-blue-600" size={30} />
          <span className="text-2xl font-semibold">{t("Campus Security")}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">{new Date().toLocaleString()}</span>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {langOptions.map(l => (
                <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="p-6">
        <div className="flex justify-end mb-4">
          <Button onClick={() => setHistoryModal(true)} variant="secondary">{t("View Passes History")}</Button>
        </div>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList>
            <TabsTrigger value="dashboard">{t("Dashboard")}</TabsTrigger>
            <TabsTrigger value="logs">{t("Completed Student Logs")}</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle>{t("Student Entry/Exit Tracking")}</CardTitle>
                <CardDescription>{t("Active Students")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input placeholder={t("Search Students")} value={search} onChange={e => setSearch(e.target.value)} />
                  <Select value={passTypeFilter} onValueChange={setPassTypeFilter}>
                    <SelectTrigger><SelectValue placeholder={t("Pass Type")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("All Types")}</SelectItem>
                      <SelectItem value="hourly">{t("Hourly")}</SelectItem>
                      <SelectItem value="days">{t("Days")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger><SelectValue placeholder={t("Status")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("All Students")}</SelectItem>
                      <SelectItem value="in">{t("Available on Campus")}</SelectItem>
                      <SelectItem value="out">{t("Checked Out Only")}</SelectItem>
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
                          <AvatarImage src={getPhotoUrl(row.original.studentId, row.original.studentName)} onError={e => (e.currentTarget.src = "/no-image.png")} />
                          <AvatarFallback>{getInitials(row.original.studentName)}</AvatarFallback>
                        </Avatar>
                      )
                    },
                    { accessorKey: "studentId", header: "Student ID" },
                    { accessorKey: "studentName", header: "Student Name" },
                    { accessorKey: "stream", header: "Stream" },
                    { accessorKey: "passType", header: "Pass Type" },
                    { accessorKey: "status", header: "Status" },
                    {
                      id: "actions",
                      header: "Actions",
                      cell: ({ row }) => (
                        <div className="flex gap-1">
                          <Button onClick={() => { setDetailsStudent(row.original); setDetailsOpen(true); }} size="icon"><Eye /></Button>
                          <Button onClick={() => openEditModal(row.original)} size="icon"><Pencil /></Button>
                          <Button onClick={() => handleCheckOut(row.original.studentId)} size="icon">{t("Check Out")}</Button>
                          <Button onClick={() => handleCheckIn(row.original.studentId)} size="icon">{t("Check In")}</Button>
                        </div>
                      )
                    }
                  ]}
                  data={filteredStudents}
                  searchColumn="studentName"
                  searchPlaceholder="Search by student name..."
                />
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
                {completedStudents.length === 0 ? (
                  <div className="py-4 text-gray-500">{t("No completed entries")}</div>
                ) : (
                  <div className="divide-y">
                    {completedStudents.map(student => (
                      <div key={student.id} className="flex items-center gap-4 p-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={getPhotoUrl(student.studentId, student.studentName)} onError={e => (e.currentTarget.src = "/no-image.png")} />
                          <AvatarFallback>{getInitials(student.studentName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div><b>{student.studentName}</b> - {student.passType}</div>
                          <div>{formatDate(student.leaveDate)} {formatTime(student.leaveDate)} - {formatDate(student.returnDate)} {formatTime(student.returnDate)}</div>
                        </div>
                        <Badge className={student.late ? "bg-orange-600" : "bg-green-600"}>{student.late ? t("Late Check-In") : t("Journey Completed")}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Student Detail Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Leave Request Details")}</DialogTitle>
          </DialogHeader>
          {detailsStudent && (
            <div className="space-y-2">
              <div className="flex justify-center mb-3">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={getPhotoUrl(detailsStudent.studentId, detailsStudent.studentName)} onError={e => (e.currentTarget.src = "/no-image.png")} />
                  <AvatarFallback>{getInitials(detailsStudent.studentName)}</AvatarFallback>
                </Avatar>
              </div>
              <div><b>Student:</b> {detailsStudent.studentName}</div>
              <div><b>ID:</b> {detailsStudent.studentId}</div>
              <div><b>Stream:</b> {detailsStudent.stream}</div>
              <div><b>Pass Period:</b> {formatDate(detailsStudent.leaveDate)} {formatTime(detailsStudent.leaveDate)} - {formatDate(detailsStudent.returnDate)} {formatTime(detailsStudent.returnDate)}</div>
              <div><b>Reason:</b> {detailsStudent.reason}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Pass Period Modal */}
      <Dialog open={editModal} onOpenChange={setEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pass Period</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label>From:</label>
            <input type="datetime-local" value={editFrom} onChange={e => setEditFrom(e.target.value)} className="input w-full" />
            <label>To:</label>
            <input type="datetime-local" value={editTo} onChange={e => setEditTo(e.target.value)} className="input w-full" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button onClick={saveEditModal}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Passes History Modal */}
      <Dialog open={historyModal} onOpenChange={setHistoryModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t("Passes History")}</DialogTitle>
            <DialogDescription>{t("Select Date to see passes")}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 my-2">
            <span>{t("Select Date")}:</span>
            <DatePicker selected={historyDate} onChange={date => date && setHistoryDate(date)} maxDate={new Date()} dateFormat="yyyy-MM-dd" className="input" />
            <Button size="sm"
              onClick={() => {
                const ws = XLSX.utils.json_to_sheet(historyData.map(row => ({
                  "Student ID": row.studentId,
                  "Student Name": row.studentName,
                  "Stream": row.stream,
                  "Pass Type": row.passType,
                  "Reason": row.reason,
                  "Leave": formatDate(row.leaveDate) + " " + formatTime(row.leaveDate),
                  "Return": formatDate(row.returnDate) + " " + formatTime(row.returnDate)
                })));
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "PassHistory");
                XLSX.writeFile(wb, `PassesHistory_${historyDate.toISOString().slice(0, 10)}.xlsx`);
              }}
              >
              <Download className="w-4 h-4 mr-1" /> {t("Download Excel")}
            </Button>
          </div>
          {historyLoading ? (
            <div className="py-12 text-center">{t("Loading...")}</div>
          ) : (
            <div>
              {historyData.length === 0 ? (
                <div>{t("No data found")}</div>
              ) : (
                <div className="divide-y">
                  {historyData.map((row, idx) => (
                    <div key={row.id || idx} className="flex items-center gap-3 p-2">
                      <Avatar className="w-8 h-8"><AvatarImage src={getPhotoUrl(row.studentId, row.studentName)} onError={e => (e.currentTarget.src = "/no-image.png")} /><AvatarFallback>{getInitials(row.studentName)}</AvatarFallback></Avatar>
                      <span>{row.studentName}</span>
                      <span>{row.stream}</span>
                      <span>{formatDate(row.leaveDate)} {formatTime(row.leaveDate)} - {formatDate(row.returnDate)} {formatTime(row.returnDate)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="flex justify-end mt-8">
        <Button variant="destructive" size="lg" className="flex items-center space-x-2"
          onClick={() => { localStorage.removeItem("securityUser"); window.location.href = "/login"; }}
          title={t("Logout")}>
          <LogOut className="w-5 h-5 mr-2" />
          {t("Logout")}
        </Button>
      </footer>
    </Layout2>
  );
}
