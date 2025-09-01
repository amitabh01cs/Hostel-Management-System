import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useState, useRef } from "react";
import LayoutS from "../components/LayoutS";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";

// PassCard component
function PassCard({ request, onClose }: { request: any, onClose: () => void }) {
  const passRef = useRef<HTMLDivElement>(null);

  const qrPassData = {
    studentName: request.student?.fullName || "",
    roomNo: request.student?.roomNo || "",
    yearOfStudy: request.student?.yearOfStudy || "",
    outTime: request.fromTime,
    inTime: request.toTime,
    reason: request.reason,
    address: request.address || "-",
    srNo: request.id,
    id: request.id,
    fromTime: request.fromTime,
    toTime: request.toTime,
    appliedOn: request.createdAt,
    branch: request.student?.branch || "",
    mobileNo: request.student?.mobileNo || "",
  };

  const handleDownload = async () => {
    if (passRef.current) {
      const canvas = await html2canvas(passRef.current, { useCORS: true });
      const link = document.createElement("a");
      link.download = `GatePass_${request.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  if (!request) return null;
  const student = request.student || {};

  return (
    <div>
      <div
        ref={passRef}
        style={{
          border: "1px solid #222",
          padding: 20,
          width: 410,
          background: "#fff",
          fontFamily: "sans-serif",
          boxShadow: "0 4px 32px rgba(0,0,0,.13)"
        }}
      >
        {/* HEADER */}
        <div style={{
          background: "#f1f5f9",
          padding: 10,
          borderRadius: 8,
          marginBottom: 10,
          textAlign: "center",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ fontWeight: "bold", fontSize: 20 }}>
            IIST BOYS / GIRLS HOSTEL
          </div>
          <div style={{ fontSize: 12 }}>
            Affiliated to - RGPV (Bhopal) | DAVV (Indore)
          </div>
          <div style={{
            fontWeight: "bold",
            marginTop: 5,
            fontSize: 16
          }}>
            Gate Pass / Leave Permit
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, width: 240 }}>
            <b>Sr. No:</b> {request.id}<br />
            <b>Date:</b> {new Date(request.createdAt).toLocaleDateString()}<br />
            <b>Name(s):</b> {student.fullName}<br />
            <b>Room No:</b> {student.roomNo} <b>| Branch/Yr:</b> {student.branch}/{student.yearOfStudy}<br />
            <b>Leave Period:</b>{" "}
            {new Date(request.fromTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} to{" "}
            {new Date(request.toTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}<br />
            <b>Address During Leave:</b> {request.address || "-"}<br />
            <b>Contact No:</b> {student.mobileNo}<br />
            <b>Purpose:</b> {request.reason}<br />
          </div>
          <div>
            <img
              src={`https://hostel-backend-module-production-iist.up.railway.app/api/student/photo/${student.id}`}
              alt="student"
              style={{
                width: 110,
                height: 110,
                border: "2px solid #111",
                borderRadius: "50%",
                objectFit: "cover"
              }}
              onError={(e) => (e.currentTarget.src = "/default.png")}
            />
          </div>
        </div>

        <div style={{ marginTop: 20, fontSize: 13 }}>
          <b>Out Time:</b> {new Date(request.fromTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
          | <b>In Time:</b> {new Date(request.toTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>

        <div style={{ marginTop: 18, textAlign: "center" }}>
          <QRCode value={JSON.stringify(qrPassData)} size={120} />
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button className="p-2 border rounded bg-green-200 mr-2" onClick={handleDownload}>
          Download Pass
        </button>
        <button className="p-2 border rounded bg-gray-100" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function LeaveStatus() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showPass, setShowPass] = useState(false);
  const [selectedPass, setSelectedPass] = useState<any>(null);

  const studentUser = JSON.parse(localStorage.getItem("studentUser") || "{}");
  const studentId = studentUser.studentId;

  const { data: leaveRequests = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/gate-pass/student", studentId],
    queryFn: async () => {
      const r = await fetch(`https://hostel-backend-module-production-iist.up.railway.app/api/gate-pass/student/${studentId}`);
      return r.json();
    },
    enabled: !!studentId,
  });

  const filteredRequests = leaveRequests.filter(request =>
    statusFilter === "all" || request.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    const variants: { [k: string]: string } = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800"
    };
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!studentId) {
    return <LayoutS><div className="p-8 text-red-500">Student not logged in.</div></LayoutS>;
  }
  if (isLoading) {
    return <LayoutS><div className="p-8">Loading...</div></LayoutS>;
  }

  return (
    <LayoutS>
      <div className="p-8">
        {/* Filters */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Leave Request Status</h1>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium">Request ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Applied On</th>
                  <th />
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No leave requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{request.id}</td>
                      <td className="px-6 py-4">{new Date(request.fromTime).toLocaleString()}</td>
                      <td className="px-6 py-4">{new Date(request.toTime).toLocaleString()}</td>
                      <td className="px-6 py-4">{request.reason}</td>
                      <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                      <td className="px-6 py-4">{new Date(request.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {request.status === "approved" && (
                          <button
                            className="text-blue-600 underline"
                            onClick={() => {
                              setShowPass(true);
                              setSelectedPass(request);
                            }}
                          >
                            View Pass
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {showPass && (
          <div
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 1000
            }}
          >
            <PassCard request={selectedPass} onClose={() => setShowPass(false)} />
          </div>
        )}
      </div>
    </LayoutS>
  );
}
