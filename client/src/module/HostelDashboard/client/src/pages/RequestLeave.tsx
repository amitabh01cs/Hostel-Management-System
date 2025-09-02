import { useState, useEffect } from "react";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import Layout2 from "../components/layout/Layout2";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "../components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Eye, CalendarDays, Pencil, Download } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { cn, getStatusColor } from "../lib/utils";
import { useAdminAuth } from "../hooks/useAdminAuth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";

// Helper: convert Date to local datetime-local string for input
function toLocalDatetimeLocalString(date) {
  if (!date) return "";
  const tzoffset = date.getTimezoneOffset() * 60000; //offset in ms
  const localISO = new Date(date - tzoffset).toISOString().slice(0, 16);
  return localISO;
}

// Format time in HH:mm local time
function formatTimeLocal(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
}

// Format date display as DD/MM/YYYY local time
function formatDateDisplayLocal(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
}

// Function to get initials from name
function getInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .filter(n => n.length > 0)
    .map(n => n[0])
    .join("")
    .toUpperCase();
}

const backendUrl = "https://hostel-backend-module-production-iist.up.railway.app/api/gate-pass";
const checkInOutUrl = "https://hostel-backend-module-production-iist.up.railway.app/api/security/completed-logs";

function EditPassPeriodModal({
  pass,
  open,
  onClose,
  onSave,
}) {
  const [from, setFrom] = useState(
    pass?.leaveDate ? toLocalDatetimeLocalString(new Date(pass.leaveDate)) : ""
  );
  const [to, setTo] = useState(
    pass?.returnDate ? toLocalDatetimeLocalString(new Date(pass.returnDate)) : ""
  );
  const [loading, setLoading] = useState(false);

  // Update state when pass changes
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
          <DialogDescription>
            Change the Out Time and In Time for this pass
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Out Time</label>
            <input
              type="datetime-local"
              className="border p-2 w-full rounded"
              value={from}
              onChange={e => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">In Time</label>
            <input
              type="datetime-local"
              className="border p-2 w-full rounded"
              value={to}
              onChange={e => setTo(e.target.value)}
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

  const todayUTC = new Date().toISOString().slice(0, 10);

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
      .then(res => res.json())
      .then((data) => {
        const mapped = data.map(mapBackendToLeaveRequest);

        mapped.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });

        setRequests(mapped);
        const onlyToday = mapped.filter(r => r.createdAt?.slice(0, 10) === todayUTC);
        setTodaysPasses(onlyToday);

        const uniqueHistoryDates = [...new Set(mapped.map(r => r.createdAt?.slice(0, 10)).filter(Boolean))];
        const datesArr = uniqueHistoryDates.map(d => new Date(d + "T00:00:00"));
        setHistoryDates(datesArr);

        const todayDateObj = datesArr.find(d => d.toISOString().slice(0,10) === todayUTC);
        if (todayDateObj) {
          setSelectedHistoryDate(todayDateObj);
        } else if (datesArr.length > 0) {
          setSelectedHistoryDate(datesArr.sort((a,b) => b.getTime() - a.getTime())[0]);
        } else {
          setSelectedHistoryDate(null);
        }
      });
  }, [admin, loading, isEditModalOpen]);

  const historyPasses = requests.filter(r => selectedHistoryDate && r.createdAt?.slice(0,10) === selectedHistoryDate.toISOString().slice(0,10));

  useEffect(() => {
    if (!showCheckInOut) return;
    setCheckInOutLoading(true);
    const adminType = admin?.adminType ? admin.adminType.trim().toLowerCase() : "";
    let url = `${checkInOutUrl}?date=${checkInOutDate.toISOString().slice(0,10)}`;
    if (adminType === "varahmihir") {
      url += "&gender=M";
    } else if (adminType === "maitreyi") {
      url += "&gender=F";
    }
    fetch(url)
      .then(res => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setCheckInOutData([]);
          return;
        }
        const mapped = data.map((r) => ({
          id: r.id,
          studentId: r.studentId,
          studentName: r.studentName ?? r.fullName ?? "",
          gender: r.gender ?? "",
          course: r.course ?? r.branch ?? "",
          branch: r.branch ?? "",
          checkOutTime: r.checkOutTime ?? null,
          checkInTime: r.checkInTime ?? null,
          passType: r.passType ?? "",
          reason: r.reason ?? "",
          destination: r.destination ?? "",
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
    const ws = XLSX.utils.json_to_sheet([{
      "Student ID": row.studentId,
      "Student Name": row.studentName,
      "Room No": row.roomNo,
      "Stream": row.stream,
      "Permission Type": row.permissionType,
      "Address": row.address,
      "Leave From": row.leaveDate,
      "Leave To": row.returnDate,
      "Reason": row.reason,
      "Status": row.status,
      "Contact": row.contactNo,
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GatePass");
    XLSX.writeFile(wb, `GatePass_${row.studentName}_${row.id}.xlsx`);
  };

  const columns = [
    {
      id: "photo",
      header: "Photo",
      cell: ({ row }) => {
        const photoPath = row.original.photoPath;
        const name = row.original.studentName;
        return photoPath
          ? <img
              src={`https://hostel-backend-module-production-iist.up.railway.app/api/student/photo/${row.original.studentId}`}
              alt={name}
              className="w-10 h-10 rounded-full object-cover border"
              style={{ minWidth: 40, minHeight: 40 }}
            />
          : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-gray-700 border">
              {getInitials(name)}
            </div>
          );
      },
    },
    { accessorKey: "studentId", header: "Student ID" },
    { accessorKey: "studentName", header: "Student Name" },
    { accessorKey: "roomNo", header: "Room No" },
    { accessorKey: "stream", header: "Stream" },
    { accessorKey: "permissionType", header: "Permission Type" },
    {
      id: "address",
      header: "Address",
      cell: ({ row }) => row.original.address || "-",
    },
    {
      id: "passPeriod",
      header: "Pass Period",
      cell: ({ row }) => {
        const p = row.original;
        if (p.passType?.toUpperCase() === "HOUR") {
          return (
            <>
              {formatTimeLocal(p.leaveDate)} - {formatTimeLocal(p.returnDate)}
            </>
          );
        } else if (p.passType?.toUpperCase() === "DAYS") {
          return (
            <>
              {formatDateDisplayLocal(p.leaveDate)} {formatTimeLocal(p.leaveDate)} - {formatDateDisplayLocal(p.returnDate)} {formatTimeLocal(p.returnDate)}
            </>
          );
        } else {
          return (
            <>
              {formatDateDisplayLocal(p.leaveDate)} - {formatDateDisplayLocal(p.returnDate)}
            </>
          );
        }
      },
    },
    {
      accessorKey: "createdAt",
      header: "Pass Generated",
      cell: ({ row }) => formatDateDisplayLocal(row.original.createdAt),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={cn("status-badge", getStatusColor(row.original.status))}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        if (!todaysPasses.some(r => r.id === row.original.id)) return null;
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
                      .then(res => res.json())
                      .then(() => {
                        toast({ title: "Leave Request Approved" });
                        setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: "Approved" } : r));
                        setTodaysPasses(prev => prev.map(r => r.id === request.id ? { ...r, status: "Approved" } : r));
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
                      .then(res => res.json())
                      .then(() => {
                        toast({ title: "Leave Request Rejected" });
                        setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: "Rejected" } : r));
                        setTodaysPasses(prev => prev.map(r => r.id === request.id ? { ...r, status: "Rejected" } : r));
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
    { accessorKey: "studentId", header: "Student ID" },
    { accessorKey: "studentName", header: "Student Name" },
    { accessorKey: "gender", header: "Gender" },
    { accessorKey: "course", header: "Course" },
    { accessorKey: "branch", header: "Branch" },
    { accessorKey: "passType", header: "Pass Type" },
    { accessorKey: "reason", header: "Reason" },
    { accessorKey: "destination", header: "Destination" },
    {
      id: "checkOutTime",
      header: "Check-Out Time",
      cell: ({ row }) => row.original.checkOutTime ? formatTimeLocal(row.original.checkOutTime) : "-",
    },
    {
      id: "checkInTime",
      header: "Check-In Time",
      cell: ({ row }) => row.original.checkInTime ? formatTimeLocal(row.original.checkInTime) : "-",
    },
  ];

  if (loading || !admin)
    return <Layout2><div className="p-8">Loading...</div></Layout2>;

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
            <CardDescription>
              Only passes strictly generated on today's date will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={todaysPasses}
              searchColumn="studentName"
              searchPlaceholder="Search by student name..."
            />
            {todaysPasses.length === 0 && (
              <div className="pt-4">No passes found for today.</div>
            )}
          </CardContent>
        </Card>

        {/* Pass History Modal */}
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Pass History</DialogTitle>
              <DialogDescription>
                Only passes generated on the selected date will be shown.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 mb-4">
              <label className="font-medium">Select Date:</label>
              <DatePicker
                selected={selectedHistoryDate}
                onChange={date => date && setSelectedHistoryDate(date)}
                includeDates={historyDates}
                dateFormat="yyyy-MM-dd"
                className="input"
                placeholderText="Select a date"
                showPopperArrow={false}
                isClearable={false}
              />
              <Button
                onClick={() => {
                  const ws = XLSX.utils.json_to_sheet(historyPasses.map(row => ({
                    "Student ID": row.studentId,
                    "Student Name": row.studentName,
                    "Room No": row.roomNo,
                    "Stream": row.stream,
                    "Permission Type": row.permissionType,
                    "Address": row.address,
                    "Leave From": row.leaveDate,
                    "Leave To": row.returnDate,
                    "Reason": row.reason,
                    "Status": row.status,
                    "Contact": row.contactNo,
                  })));
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "GatePassHistory");
                  XLSX.writeFile(wb, `GatePassHistory_${selectedHistoryDate.toISOString().slice(0,10)}.xlsx`);
                }}
                className="ml-auto"
                size="sm"
              >
                <Download className="h-4 w-4 mr-1" /> Download Excel
              </Button>
            </div>
            <DataTable
              columns={columns.filter(col => col.id !== "actions")}
              data={historyPasses}
              searchColumn="studentName"
              searchPlaceholder="Search by student name..."
            />
            {historyPasses.length === 0 && (
              <div className="pt-4">No passes found for this date.</div>
            )}
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
              <DialogDescription>
                Leave request information for {detailsRequest?.studentName}
              </DialogDescription>
            </DialogHeader>
            {detailsRequest?.photoPath && (
              <div className="flex justify-center mb-6">
                <img
                  src={`https://hostel-backend-module-production-iist.up.railway.app/api/student/photo/${detailsRequest?.studentId}`}
                  alt={detailsRequest?.studentName}
                  className="w-32 h-32 rounded-full object-cover border"
                  onError={(e) => e.currentTarget.src = "/no-image.png"}
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
                  {detailsRequest?.passType?.toUpperCase() === "HOUR"
                    ? (
                      <>
                        {formatTimeLocal(detailsRequest?.leaveDate)} - {formatTimeLocal(detailsRequest?.returnDate)}
                      </>
                    )
                    : detailsRequest?.passType?.toUpperCase() === "DAYS"
                      ? (
                        <>
                          {formatDateDisplayLocal(detailsRequest?.leaveDate)} {formatTimeLocal(detailsRequest?.leaveDate)} - {formatDateDisplayLocal(detailsRequest?.returnDate)} {formatTimeLocal(detailsRequest?.returnDate)}
                        </>
                      )
                      : (
                        <>
                          {formatDateDisplayLocal(detailsRequest?.leaveDate)} - {formatDateDisplayLocal(detailsRequest?.returnDate)}
                        </>
                      )
                  }
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Pass Generated</p>
                <p className="text-sm text-gray-700">{formatDateDisplayLocal(detailsRequest?.createdAt)}</p>
              </div>
              <div className="md:col-span-2 space-y-1">
                <p className="text-sm font-medium">Reason for Leave</p>
                <p className="text-sm text-gray-700">{detailsRequest?.reason}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
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
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View Check-In/Out</DialogTitle>
              <DialogDescription>
                Date-wise filtered records of all student check-in/check-out for the selected day.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 mb-4">
              <label className="font-medium">Select Date:</label>
              <DatePicker
                selected={checkInOutDate}
                onChange={date => date && setCheckInOutDate(date)}
                maxDate={new Date()}
                dateFormat="yyyy-MM-dd"
                className="input"
                placeholderText="Pick a date"
                showPopperArrow={false}
                isClearable={false}
              />
              <Button
                onClick={() => {
                  const ws = XLSX.utils.json_to_sheet(checkInOutData.map(row => ({
                    "Student ID": row.studentId,
                    "Student Name": row.studentName,
                    "Gender": row.gender,
                    "Course": row.course,
                    "Branch": row.branch,
                    "Pass Type": row.passType,
                    "Reason": row.reason,
                    "Destination": row.destination,
                    "Check Out Time": row.checkOutTime ? formatTimeLocal(row.checkOutTime) : "-",
                    "Check In Time": row.checkInTime ? formatTimeLocal(row.checkInTime) : "-",
                  })));
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "CheckInOut");
                  XLSX.writeFile(wb, `CheckInOut_${checkInOutDate.toISOString().slice(0,10)}.xlsx`);
                }}
                className="ml-auto"
                size="sm"
              >
                <Download className="h-4 w-4 mr-1" /> Download Excel
              </Button>
            </div>
            <DataTable
              columns={checkInOutColumns}
              data={checkInOutData}
              searchColumn="studentName"
              searchPlaceholder="Search by student name..."
              isLoading={checkInOutLoading}
              noDataMessage="No check-in/check-out records found for this date."
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCheckInOut(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout2>
  );
};

export default RequestLeave;

