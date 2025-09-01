import React, { useState, useEffect } from "react";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import Layout2 from "../components/layout/Layout2";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Eye } from "lucide-react";
import { formatDate, getStatusColor } from "../lib/utils";

// --- AUTH IMPORT ---
import { useAdminAuth } from "../hooks/useAdminAuth";

type Complaint = {
  id: string;
  fullName: string;
  mobileNo: string;
  emailId: string;
  roomNo?: string; // Add roomNo to type
  issueDate: string;
  topic: string;
  description: string;
  status: string;
  feedback?: string;
  studentClosed?: boolean;
};

const ComplaintBox = () => {
  // --- AUTH HOOK ---
  const { admin, loading } = useAdminAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [detailsComplaint, setDetailsComplaint] = useState<Complaint | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // --- AUTH GUARD ---
  useEffect(() => {
    if (!loading && !admin) {
      window.location.href = "/login";
    }
  }, [admin, loading]);

  useEffect(() => {
    if (loading || !admin) return; // Wait for auth check

    // --- Gender filter logic from adminUser start ---
    const adminType = admin?.adminType ? admin.adminType.trim().toLowerCase() : "";
    let url = "https://hostel-backend-module-production-iist.up.railway.app/api/complaints";
    if (adminType === "varahmihir") {
      url += "?gender=M";
    } else if (adminType === "maitreyi") {
      url += "?gender=F";
    }
    // --- Gender filter logic from adminUser end ---
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const sorted = [...data].sort((a, b) => {
          const aTime = a.issueDate ? new Date(a.issueDate).getTime() : 0;
          const bTime = b.issueDate ? new Date(b.issueDate).getTime() : 0;
          return bTime - aTime;
        });
        setComplaints(sorted);
      });
  }, [admin, loading]);

  if (loading) return <Layout2><div className="p-8">Loading...</div></Layout2>;
  if (!admin) return null;

  const filteredComplaints = statusFilter === "all" 
    ? complaints 
    : complaints.filter(complaint => 
        complaint.status?.toLowerCase() === statusFilter.toLowerCase()
      );

  const handleViewDetails = (complaint: Complaint) => {
    setDetailsComplaint(complaint);
    setIsDetailsDialogOpen(true);
  };

  // PATCH request to backend to update complaint status
  const updateComplaintStatus = (complaintId: string, newStatus: string) => {
    fetch(`https://hostel-backend-module-production-iist.up.railway.app/api/complaints/${complaintId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(res => res.json())
      .then((updatedComplaint) => {
        setComplaints(cs =>
          cs.map(c =>
            c.id === String(updatedComplaint.id) ? { ...c, status: updatedComplaint.status } : c
          )
        );
        setIsDetailsDialogOpen(false);
      });
  };

  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "fullName",
      header: "Name",
    },
    {
      accessorKey: "roomNo",
      header: "Room No",
    },
    {
      accessorKey: "mobileNo",
      header: "Contact",
    },
    {
      accessorKey: "emailId",
      header: "Email",
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
      cell: ({ row }: any) => {
        const date = row.getValue("issueDate") as string;
        return date ? formatDate(new Date(date)) : "-";
      },
    },
    {
      accessorKey: "topic",
      header: "Topic",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const complaint = row.original;
        return (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleViewDetails(complaint)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <Layout2>
      <div>
        <div className="space-y-1 mb-6">
          <h2 className="page-title">Complaint Box</h2>
          <p className="page-description">View and manage student complaints</p>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>All Complaints</CardTitle>
                <CardDescription>
                  Track and resolve student complaints
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={filteredComplaints} 
              searchColumn="fullName" 
              searchPlaceholder="Search by student name..."
            />
          </CardContent>
        </Card>
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Complaint Details</DialogTitle>
              <DialogDescription>
                Complaint #{detailsComplaint?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-gray-700">{detailsComplaint?.fullName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Room No</p>
                <p className="text-sm text-gray-700">{detailsComplaint?.roomNo || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Contact</p>
                <p className="text-sm text-gray-700">{detailsComplaint?.mobileNo}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-700">{detailsComplaint?.emailId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Issue Date</p>
                <p className="text-sm text-gray-700">
                  {detailsComplaint?.issueDate ? formatDate(new Date(detailsComplaint.issueDate)) : ""}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Status</p>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(detailsComplaint?.status || "")}>
                    {detailsComplaint?.status}
                  </Badge>
                  {detailsComplaint?.status?.toLowerCase() !== "resolved" && (
                    <Select
                      onValueChange={(value) => {
                        if (detailsComplaint) {
                          updateComplaintStatus(detailsComplaint.id, value);
                        }
                      }}
                    >
                      <SelectTrigger className="h-7 w-[120px]">
                        <SelectValue placeholder="Update" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm font-medium">Topic</p>
                <p className="text-sm text-gray-700">{detailsComplaint?.topic}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-gray-700">{detailsComplaint?.description}</p>
              </div>
              {detailsComplaint?.feedback && (
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm font-medium">Student Feedback</p>
                  <p className="text-sm text-gray-700">{detailsComplaint.feedback}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout2>
  );
};

export default ComplaintBox;