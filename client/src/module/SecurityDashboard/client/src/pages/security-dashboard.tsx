import { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import {
  Search, Eye, Pencil, Download,
} from "lucide-react";

const BACKEND_URL = "https://hostel-backend-module-production-iist.up.railway.app/api";

function getPhotoURL(studentId) {
  return `${BACKEND_URL}/student/photo/${studentId}`;
}

function getInitials(name = "") {
  return name.split(" ").map(x => x[0]).join("").toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return isNaN(d) ? "-" : d.toLocaleDateString();
}

function formatTime(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return isNaN(d) ? "-" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function toLocalDateTimeString(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  // yyyy-MM-ddThh:mm format
  return d.toISOString().slice(0, 16);
}

export default function RequestLeave() {
  const [requests, setRequests] = useState([]);
  const [todaysRequests, setTodaysRequests] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editRequest, setEditRequest] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editFrom, setEditFrom] = useState("");
  const [editTo, setEditTo] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRequests, setHistoryRequests] = useState([]);
  const [historyDates, setHistoryDates] = useState([]);
  const [historySelectedDate, setHistorySelectedDate] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    const res = await fetch(`${BACKEND_URL}/gate-pass/all`);
    const data = await res.json();

    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setRequests(data);
    const todayISO = new Date().toISOString().slice(0, 10);
    setTodaysRequests(data.filter(r => r.createdAt.startsWith(todayISO)));

    const uniqueDates = Array.from(new Set(data.map(r => r.createdAt?.slice(0, 10)).filter(Boolean)));
    uniqueDates.sort((a, b) => (new Date(b)) - (new Date(a)));

    setHistoryDates(uniqueDates.map(d => new Date(d)));
    if (uniqueDates.length) setHistorySelectedDate(new Date(uniqueDates[0]));
  }

  useEffect(() => {
    if (!historySelectedDate) return;
    const sel = historySelectedDate.toISOString().slice(0, 10);
    setHistoryRequests(requests.filter(r => r.createdAt?.startsWith(sel)));
  }, [historySelectedDate, requests]);

  const filteredTodaysRequests = useMemo(() => {
    return todaysRequests.filter(r => {
      const name = r.student?.fullName?.toLowerCase() || "";
      const status = (r.status || "").toLowerCase();
      const type = (r.passType || "").toLowerCase();
      const term = filterText.toLowerCase();
      const fStatus = filterStatus.toLowerCase();
      const fType = filterType.toLowerCase();

      const matchesName = name.includes(term);
      const matchesStatus = filterStatus === "all" || status === fStatus;
      const matchesType = filterType === "all" || type === fType;
      return matchesName && matchesStatus && matchesType;
    });
  }, [todaysRequests, filterText, filterStatus, filterType]);

  function openDetails(req) {
    setSelectedRequest(req);
    setDetailsOpen(true);
  }
  function closeDetails() {
    setSelectedRequest(null);
    setDetailsOpen(false);
  }

  function openEdit(req) {
    setEditRequest(req);
    setEditFrom(toLocalDateTimeString(req.from));
    setEditTo(toLocalDateTimeString(req.to));
    setEditOpen(true);
  }
  function closeEdit() {
    setEditRequest(null);
    setEditOpen(false);
  }

  async function saveEdit() {
    if (!editRequest) return;
    try {
      const res = await fetch(`${BACKEND_URL}/gate-pass/${editRequest.id}/edit-time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromTime: editFrom, toTime: editTo }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast({ title: "Pass period updated" });
      fetchRequests();
    } catch {
      toast({ title: "Failed to update period", variant: "destructive" });
    }
    closeEdit();
  }

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`${BACKEND_URL}/gate-pass/${id}/status?status=${status}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to update");
      toast({ title: `Request ${status}` });
      fetchRequests();
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  }

  function downloadExcel(data, filename) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, filename);
  }

  const columns = [
    {
      id: "photo",
      header: "Photo",
      cell: ({ row }) => {
        const s = row.original.student;
        return s?.id ? (
          <img
            src={getPhotoURL(s.id)}
            alt={s.fullName}
            className="w-10 h-10 rounded-full"
            style={{ objectFit: "cover" }}
            onError={e => e.currentTarget.src = "/no-image.png"}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-gray-700">
            {getInitials(s?.fullName)}
          </div>
        );
      }
    },
    { accessorKey: "student.fullName", header: "Student Name" },
    { accessorKey: "student.branch", header: "Branch" },
    { accessorKey: "student.yearOfStudy", header: "Year" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => (
      <Badge className={`px-2 py-1 rounded ${row.original.status === "Approved" ? "bg-green-500" : row.original.status === "Pending" ? "bg-yellow-400" : "bg-red-500"}`}>
        {row.original.status}
      </Badge>
    ) },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const req = row.original;
        return <div className="flex space-x-2">
          <Button size="sm" onClick={() => openDetails(req)}><Eye /></Button>
          {req.status === "Pending" && <>
            <Button size="sm" className="text-green-600" onClick={() => updateStatus(req.id, "approved")}><Pencil /></Button>
            <Button size="sm" className="text-red-600" onClick={() => updateStatus(req.id, "rejected")}><Pencil /></Button>
          </>}
          <Button size="sm" onClick={() => openEdit(req)}><Pencil /></Button>
          <Button size="sm" onClick={() => downloadExcel([req], `GatePass_${req.id}.xlsx`)}><Download /></Button>
        </div>;
      }
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Leave Requests (Today)</h1>

      <div className="flex space-x-3 mb-4">
        <Input placeholder="Search by student name" value={filterText} onChange={e => setFilterText(e.target.value)} />
        <Select onValueChange={setFilterStatus} value={filterStatus}>
          <SelectTrigger>Status</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setFilterType} value={filterType}>
          <SelectTrigger>Pass Type</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="hour">Hourly</SelectItem>
            <SelectItem value="days">Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredTodaysRequests}
        searchColumn="student.fullName"
        searchPlaceholder="Search students"
      />

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>{selectedRequest?.student?.fullName}</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <>
              <img
                src={getPhotoURL(selectedRequest.student.id)}
                alt={selectedRequest.student.fullName}
                className="mx-auto rounded-full h-36 w-36 object-cover"
                onError={e => e.currentTarget.src = "/no-image.png"}
              />
              <div className="space-y-2 mt-4">
                <p><strong>Student ID:</strong> {selectedRequest.student.id}</p>
                <p><strong>Branch:</strong> {selectedRequest.student.branch}</p>
                <p><strong>Year:</strong> {selectedRequest.student.yearOfStudy}</p>
                <p><strong>Contact:</strong> {selectedRequest.student.mobileNo}</p>
                <p><strong>Purpose:</strong> {selectedRequest.reason}</p>
                <p><strong>Destination:</strong> {selectedRequest.place}</p>
                <p><strong>From:</strong> {formatDate(selectedRequest.from)} {formatTime(selectedRequest.from)}</p>
                <p><strong>To:</strong> {formatDate(selectedRequest.to)} {formatTime(selectedRequest.to)}</p>
                <p><strong>Status:</strong> {selectedRequest.status}</p>
              </div>
            </>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pass Period</DialogTitle>
            <DialogDescription>Adjust leave and return times</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div>
              <Label>From</Label>
              <input type="datetime-local" className="input w-full" value={editFrom} onChange={e => setEditFrom(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <input type="datetime-local" className="input w-full" value={editTo} onChange={e => setEditTo(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
