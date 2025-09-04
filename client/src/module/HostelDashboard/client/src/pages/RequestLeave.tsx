import { useState, useEffect } from "react";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import Layout2 from "../components/layout/Layout2";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Eye, CalendarDays, Pencil, Download } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { cn, getStatusColor } from "../lib/utils";
import { useAdminAuth } from "../hooks/useAdminAuth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";

// Mock helper functions and components for the missing pieces
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-500 text-white";
    case "rejected":
      return "bg-red-500 text-white";
    case "pending":
    default:
      return "bg-yellow-500 text-black";
  }
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

const useAdminAuth = () => {
  const [admin, setAdmin] = useState({
    adminType: "varahmihir",
    name: "Mock Admin",
  });
  const [loading, setLoading] = useState(false);
  return { admin, loading };
};

const useToast = () => {
  return {
    toast: ({ title, variant = "default" }) => {
      console.log(`Toast: ${title}, Variant: ${variant}`);
      alert(`Toast: ${title}`);
    },
  };
};

const Layout2 = ({ children }) => (
  <div className="min-h-screen bg-gray-100 p-8">{children}</div>
);

// Helper: convert Date to local datetime-local input string "YYYY-MM-DDTHH:mm"
function toLocalDatetimeLocalString(date) {
  if (!date) return "";
  const tzoffset = date.getTimezoneOffset() * 60000; //offset in ms
  const localISO = new Date(date - tzoffset).toISOString().slice(0, 16);
  return localISO;
}
// Show HH:mm in local time 24hr format
function formatTimeLocal(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return (
    d.getHours().toString().padStart(2, "0") +
    ":" +
    d.getMinutes().toString().padStart(2, "0")
  );
}
// Format date as DD/MM/YYYY local time
function formatDateLocal(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
}
function getUTCDateOnly(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return (
    d.getUTCFullYear() +
    "-" +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getUTCDate()).padStart(2, "0")
  );
}
function getInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
const backendUrl = "https://hostel-backend-module-production-iist.up.railway.app/api/gate-pass";
const checkInOutUrl =
  "https://hostel-backend-module-production-iist.up.railway.app/api/security/completed-logs";
function EditPassPeriodModal({ pass, open, onClose, onSave }) {
  const [from, setFrom] = useState(
    pass?.leaveDate ? toLocalDatetimeLocalString(new Date(pass.leaveDate)) : ""
  );
  const [to, setTo] = useState(
    pass?.returnDate ? toLocalDatetimeLocalString(new Date(pass.returnDate)) : ""
  );
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setFrom(pass?.leaveDate ? toLocalDatetimeLocalString(new Date(pass.leaveDate)) : "");
    setTo(pass?.returnDate ? toLocalDatetimeLocalString(new Date(pass.returnDate)) : "");
  }, [pass]);
  const handleSave = async () => {
    setLoading(true);
    await onSave(from, to);
    setLoading(false);
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Pass Period</DialogTitle>
          <DialogDescription>Change the Out Time and In Time for this pass</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Out Time</label>
            <input
              type="datetime-local"
              className="border p-2 w-full rounded"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">In Time</label>
            <input
              type="datetime-local"
              className="border p-2 w-full rounded"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
const mapBackendToLeaveRequest = (g) => ({
  id: g.id,
  studentId: g.student?.id ?? 0,
  studentName: g.student?.fullName ?? "",
  stream: g.student?.branch ?? "",
  permissionType: g.passType,
  passType: g.passType,
  reason: g.reason,
  leaveDate: g.fromTime,
  returnDate: g.toTime,
  createdAt: g.createdAt ?? "",
  contactNo: g.student?.mobileNo ?? "",
  gender: g.student?.gender ?? "",
  status: g.status.charAt(0).toUpperCase() + g.status.slice(1).toLowerCase(),
  roomNo: g.student?.roomNo ?? "",
  branch: g.student?.branch ?? "",
  yearOfStudy: g.student?.yearOfStudy ?? "",
  address: g.address ?? g.placeToVisit ?? "",
  photoPath: g.student?.photoPath ?? "",
});
const RequestLeave = () => {
  const [requests, setRequests] = useState([]);
  const [detailsRequest, setDetailsRequest] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editRequest, setEditRequest] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();
  const { admin, loading } = useAdminAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [historyDates, setHistoryDates] = useState([]);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(null);
  const [showCheckInOut, setShowCheckInOut] = useState(false);
  const [checkInOutDate, setCheckInOutDate] = useState(new Date());
  const [checkInOutData, setCheckInOutData] = useState([]);
  const [checkInOutLoading, setCheckInOutLoading] = useState(false);
  const today = new Date();
  const todayUTC = getUTCDateOnly(today);
  const [todaysPasses, setTodaysPasses] = useState([]);
  useEffect(() => {
    if (!loading && !admin) {
      window.location.href = "/login";
      return;
    }
    if (loading || !admin) return;
    const adminType = admin.adminType ? admin.adminType.trim().toLowerCase() : "";
    let url = `${backendUrl}/all`;
    if (adminType === "varahmihir") {
      url += "?gender=M";
    } else if (adminType === "maitreyi") {
      url += "?gender=F";
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map(mapBackendToLeaveRequest);
        mapped.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
        setRequests(mapped);
        const onlyToday = mapped.filter((r) => getUTCDateOnly(r.createdAt) === todayUTC);
        setTodaysPasses(onlyToday);
        const uniqueHistoryDates = [
          ...new Set(
            mapped
              .map((r) => getUTCDateOnly(r.createdAt))
              .filter(Boolean)
          ),
        ];
        const historyDatesArr = uniqueHistoryDates.map((d) => {
          const dt = new Date(d + "T00:00:00Z");
          dt.setUTCHours(0, 0, 0, 0);
          return dt;
        });
        setHistoryDates(historyDatesArr);
        const todayDateObj = historyDatesArr.find((d) => getUTCDateOnly(d) === todayUTC);
        if (todayDateObj) {
          setSelectedHistoryDate(todayDateObj);
        } else if (historyDatesArr.length > 0) {
          setSelectedHistoryDate(
            historyDatesArr.slice().sort((a, b) => b.getTime() - a.getTime())[0]
          );
        } else {
          setSelectedHistoryDate(null);
        }
      });
  }, [admin, loading, isEditModalOpen]);
  const historyPasses = requests.filter(
    (r) => selectedHistoryDate && getUTCDateOnly(r.createdAt) === getUTCDateOnly(selectedHistoryDate)
  );
  useEffect(() => {
    if (!showCheckInOut) return;
    setCheckInOutLoading(true);
    const adminType = admin?.adminType ? admin.adminType.trim().toLowerCase() : "";
    let url = `${checkInOutUrl}?date=${getUTCDateOnly(checkInOutDate)}`;
    if (adminType === "varahmihir") {
      url += "&gender=M";
    } else if (adminType === "maitreyi") {
      url += "&gender=F";
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setCheckInOutData([]);
          return;
        }
        const mapped = data.map((r) => ({
          id: r.id,
          studentId: r.studentId,
          studentName: r.studentName || r.fullName || "",
          gender: r.gender || "",
          course: r.course || r.branch || "",
          branch: r.branch || "",
          checkOutTime: r.checkOutTime || null,
          checkInTime: r.checkInTime || null,
          passType: r.passType || "",
          reason: r.reason || "",
          destination: r.destination || "",
        }));
        setCheckInOutData(mapped);
      })
      .finally(() => setCheckInOutLoading(false));
  }, [showCheckInOut, checkInOutDate, admin]);
  const handleEditPassPeriod = async (from, to) => {
    if (!editRequest) return;
    const res = await fetch(`${backendUrl}/${editRequest.id}/edit-time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromTime: from, toTime: to }),
    });
    if (res.ok) {
      toast({ title: "Pass period updated!" });
    } else {
      toast({ title: "Update failed!", variant: "destructive" });
    }
  };
  const handleDownloadRow = (row) => {
    const ws = XLSX.utils.json_to_sheet([
      {
        "Student ID": row.studentId,
        "Student Name": row.studentName,
        "Room No": row.roomNo,
        Stream: row.stream,
        "Permission Type": row.permissionType,
        Address: row.address,
        "Leave From": row.leaveDate,
        "Leave To": row.returnDate,
        Reason: row.reason,
        Status: row.status,
        Contact: row.contactNo,
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GatePass");
    XLSX.writeFile(wb, `GatePass_${row.studentName}_${row.id}.xlsx`);
  };
  const columns = [
    {
      id: "photo",
      header: "Photo",
      cell: ({ row }) => {
        const name = row.original.studentName;
        return (
          <img
            src={`https://hostel-backend-module-production-iist.up.railway.app/api/student/photo/${row.original.studentId}`}
            alt={name}
            className="w-10 h-10 rounded-full object-cover border"
            style={{ minWidth: 40, minHeight: 40 }}
            onError={(e) => (e.currentTarget.src = "/no-image.png")}
          />
        );
      },
    },
    {
      accessorKey: "studentId",
      header: "Student ID",
    },
    {
      accessorKey: "studentName",
      header: "Student Name",
    },
    {
      accessorKey: "roomNo",
      header: "Room No",
    },
    {
      accessorKey: "stream",
      header: "Stream",
    },
    {
      accessorKey: "permissionType",
      header: "Permission Type",
    },
    {
      id: "address",
      header: "Address",
      cell: ({ row }) => row.original.address || "-",
    },
    {
      id: "passPeriod",
      header: "Pass Period",
      cell: ({ row }) => {
        const passType = row.original.passType;
        const leaveDate = row.original.leaveDate;
        const returnDate = row.original.returnDate;
        if (passType && passType.toUpperCase() === "HOUR") {
          return (
            <>
              {formatTimeLocal(leaveDate)} - {formatTimeLocal(returnDate)}
            </>
          );
        } else if (passType && passType.toUpperCase() === "DAYS") {
          return (
            <>
              {formatDateLocal(leaveDate)} {formatTimeLocal(leaveDate)} -{" "}
              {formatDateLocal(returnDate)} {formatTimeLocal(returnDate)}
            </>
          );
        } else {
          return <>{formatDateLocal(leaveDate)} - {formatDateLocal(returnDate)}</>;
        }
      },
    },
    {
      accessorKey: "createdAt",
      header: "Pass Generated",
      cell: ({ row }) => formatDateLocal(row.original.createdAt),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return <Badge className={cn("status-badge", getStatusColor(status))}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        if (!todaysPasses.some((r) => r.id === row.original.id)) return null;
        const request = row.original;
        const isPending = request.status === "Pending";
        return (
          <div className="flex space-x-2">
            {isPending && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => {
                    fetch(`${backendUrl}/${request.id}/status?status=approved`, { method: "POST" })
                      .then((res) => res.json())
                      .then(() => {
                        toast({ title: "Leave Request Approved" });
                        setRequests((prev) =>
                          prev.map((r) => (r.id === request.id ? { ...r, status: "Approved" } : r))
                        );
                        setTodaysPasses((prev) =>
                          prev.map((r) => (r.id === request.id ? { ...r, status: "Approved" } : r))
                        );
                      });
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    fetch(`${backendUrl}/${request.id}/status?status=rejected`, { method: "POST" })
                      .then((res) => res.json())
                      .then(() => {
                        toast({ title: "Leave Request Rejected" });
                        setRequests((prev) =>
                          prev.map((r) => (r.id === request.id ? { ...r, status: "Rejected" } : r))
                        );
                        setTodaysPasses((prev) =>
                          prev.map((r) => (r.id === request.id ? { ...r, status: "Rejected" } : r))
                        );
                      });
                  }}
                >
                  Reject
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDetailsRequest(request);
                setIsDetailsDialogOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditRequest(request);
                setIsEditModalOpen(true);
              }}
              title="Edit Pass Period"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownloadRow(request)}
              title="Download Pass as Excel"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
  // Columns for Check-In/Out Table
  const checkInOutColumns = [
    {
      accessorKey: "studentId",
      header: "Student ID",
    },
    {
      accessorKey: "studentName",
      header: "Student Name",
    },
    {
      accessorKey: "gender",
      header: "Gender",
    },
    {
      accessorKey: "course",
      header: "Course",
    },
    {
      accessorKey: "branch",
      header: "Branch",
    },
    {
      accessorKey: "passType",
      header: "Pass Type",
    },
    {
      accessorKey: "reason",
      header: "Reason",
    },
    {
      accessorKey: "destination",
      header: "Destination",
    },
    {
      id: "checkOutTime",
      header: "Check-Out Time",
      cell: ({ row }) => (row.original.checkOutTime ? formatTimeLocal(row.original.checkOutTime) : "-"),
    },
    {
      id: "checkInTime",
      header: "Check-In Time",
      cell: ({ row }) => (row.original.checkInTime ? formatTimeLocal(row.original.checkInTime) : "-"),
    },
  ];
  if (loading || !admin)
    return (
      <Layout2>
        <div className="p-8">Loading...</div>
      </Layout2>
    );
  return (
    <Layout2>
      <div>
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h2 className="page-title">Leave Requests</h2>
            <p className="page-description">Requests generated today ({todayUTC})</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowCheckInOut(true)}
              className="flex items-center gap-2"
              title="View Check-In/Out"
            >
              <CalendarDays className="w-4 h-4" />
              View Check-In/Out
            </Button>
            <Button variant="outline" onClick={() => setShowHistory(true)}>
              Pass History
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Today's Leave Requests</CardTitle>
            <CardDescription>Only passes strictly generated on today's date will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={todaysPasses}
              searchColumn="studentName"
              searchPlaceholder="Search by student name..."
            />
            {todaysPasses.length === 0 && <div className="pt-4">No passes found for today.</div>}
          </CardContent>
        </Card>
        {/* Pass History Modal */}
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Pass History</DialogTitle>
              <DialogDescription>Only passes generated on the selected date will be shown.</DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 mb-4">
              <label className="font-medium">Select Date:</label>
              <DatePicker
                selected={selectedHistoryDate}
                onChange={(date) => date && setSelectedHistoryDate(date)}
                includeDates={historyDates}
                dateFormat="yyyy-MM-dd"
                className="input"
                placeholderText="Select a date"
                showPopperArrow={false}
                isClearable={false}
              />
              <Button
                onClick={() => {
                  const ws = XLSX.utils.json_to_sheet(
                    historyPasses.map((row) => ({
                      "Student ID": row.studentId,
                      "Student Name": row.studentName,
                      "Room No": row.roomNo,
                      Stream: row.stream,
                      "Permission Type": row.permissionType,
                      Address: row.address,
                      "Leave From": row.leaveDate,
                      "Leave To": row.returnDate,
                      Reason: row.reason,
                      Status: row.status,
                      Contact: row.contactNo,
                    }))
                  );
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "GatePassHistory");
                  XLSX.writeFile(wb, `GatePassHistory_${getUTCDateOnly(selectedHistoryDate)}.xlsx`);
                }}
                className="ml-auto"
                size="sm"
              >
                <Download className="h-4 w-4 mr-1" /> Download Excel
              </Button>
            </div>
            <DataTable
              columns={columns.filter((col) => col.id !== "actions" && col.id !== "download")}
              data={historyPasses}
              searchColumn="studentName"
              searchPlaceholder="Search by student name..."
            />
            {historyPasses.length === 0 && <div className="pt-4">No passes found for this date.</div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHistory(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Leave Request Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Leave Request Details</DialogTitle>
              <DialogDescription>Leave request information for {detailsRequest?.studentName}</DialogDescription>
            </DialogHeader>
            {detailsRequest?.photoPath && (
              <div className="flex justify-center mb-6">
                <img
                  src={`https://hostel-backend-module-production-iist.up.railway.app/api/student/photo/${detailsRequest?.studentId}`}
                  alt={detailsRequest?.studentName}
                  className="w-32 h-32 rounded-full object-cover border"
                  onError={(e) => (e.currentTarget.src = "/no-image.png")}
                />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Student Name</p>
                <p className="text-sm text-gray-700">{detailsRequest?.studentName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Student ID</p>
                <p className="text-sm text-gray-700">{detailsRequest?.studentId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Room No</p>
                <p className="text-sm text-gray-700">{detailsRequest?.roomNo || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Course</p>
                <p className="text-sm text-gray-700">{detailsRequest?.stream}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Contact Number</p>
                <p className="text-sm text-gray-700">{detailsRequest?.contactNo}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-gray-700">{detailsRequest?.address || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Pass Period</p>
                <p className="text-sm text-gray-700">
                  {detailsRequest?.passType?.toUpperCase() === "HOUR" ? (
                    <>
                      {formatTimeLocal(detailsRequest?.leaveDate)} -{" "}
                      {formatTimeLocal(detailsRequest?.returnDate)}
                    </>
                  ) : detailsRequest?.passType?.toUpperCase() === "DAYS" ? (
                    <>
                      {formatDateLocal(detailsRequest?.leaveDate)}{" "}
                      {formatTimeLocal(detailsRequest?.leaveDate)} -{" "}
                      {formatDateLocal(detailsRequest?.returnDate)}{" "}
                      {formatTimeLocal(detailsRequest?.returnDate)}
                    </>
                  ) : (
                    <>
                      {formatDateLocal(detailsRequest?.leaveDate)} -{" "}
                      {formatDateLocal(detailsRequest?.returnDate)}
                    </>
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Pass Generated</p>
                <p className="text-sm text-gray-700">{formatDateLocal(detailsRequest?.createdAt)}</p>
              </div>
              <div className="md:col-span-2 space-y-1">
                <p className="text-sm font-medium">Reason for Leave</p>
                <p className="text-sm text-gray-700">{detailsRequest?.reason}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Edit Pass Period Modal */}
        <EditPassPeriodModal
          pass={editRequest}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditPassPeriod}
        />
        {/* Check-In/Out Modal */}
        <Dialog open={showCheckInOut} onOpenChange={setShowCheckInOut}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Check-In/Out Logs</DialogTitle>
              <DialogDescription>
                Logs of students who have checked in or out on the selected date.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 mb-4">
              <label className="font-medium">Select Date:</label>
              <DatePicker
                selected={checkInOutDate}
                onChange={(date) => date && setCheckInOutDate(date)}
                dateFormat="yyyy-MM-dd"
                className="input"
                placeholderText="Select a date"
                showPopperArrow={false}
              />
            </div>
            {checkInOutLoading ? (
              <div className="text-center py-4">Loading logs...</div>
            ) : (
              <DataTable
                columns={checkInOutColumns}
                data={checkInOutData}
                searchColumn="studentName"
                searchPlaceholder="Search by student name..."
              />
            )}
            {checkInOutData.length === 0 && !checkInOutLoading && (
              <div className="pt-4">No logs found for this date.</div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCheckInOut(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout2>
  );
};
export default RequestLeave;
