import { useState, useEffect } from "react";
import { DataTable } from "../components/ui/data-table";
import Layout2 from "../components/layout/Layout2";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Trash2 } from "lucide-react";
import { formatDateTime, getStatusColor } from "../lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "../../../../../../src/getUser";
import { logUserActivity } from "../../../../../../src/utils/activityLogger";

type AccessLog = {
  id: number;
  userId: string;
  userEmail: string;
  userType: string;
  ipAddress: string;
  loginTime: string;
  logoutTime: string | null;
  status: string;
};

type Activity = {
  id: number;
  pageUrl: string;
  actionType: string;
  actionDescription: string;
  timestamp: string;
};

const UserAccessLogs = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      logUserActivity({
        ...user,
        actionType: "VISIT",
        pageUrl: "/user-access-logs",
        actionDescription: "Visited User Access Logs page",
      });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("https://hostel-backend-module-production-iist.up.railway.app/api/access-log")
      .then((res) => res.json())
      .then((data) => {
        const logs = (Array.isArray(data) ? data : data.logs).map((log: any) => ({
          id: log.id,
          userId: log.user_id,
          userEmail: log.user_email,
          userType: log.user_type,
          ipAddress: log.ip_address,
          loginTime: log.login_time,
          logoutTime: log.logout_time,
          status: log.status,
        }));
        setAccessLogs(logs);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to load access logs.",
          variant: "destructive",
        });
      });
  }, []);

  // Fetch selected user activities
  const openActivityModal = (userId: string) => {
    setSelectedUserId(userId);
    setActivityModalOpen(true);
    setActivitiesLoading(true);
    fetch(`https://hostel-backend-module-production-iist.up.railway.app/api/user-activities/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setActivities(data);
        setActivitiesLoading(false);
      })
      .catch(() => {
        setActivities([]);
        setActivitiesLoading(false);
        toast({
          title: "Error",
          description: "Failed to load user activities.",
          variant: "destructive",
        });
      });
  };

  const closeActivityModal = () => {
    setActivityModalOpen(false);
    setActivities([]);
  };

  const handleClearLogs = () => {
    setIsConfirmOpen(false);
    fetch("https://hostel-backend-module-production-iist.up.railway.app/api/access-log", {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        setAccessLogs([]);
        toast({
          title: "Logs Cleared",
          description: "Access logs have been successfully cleared.",
        });
        const user = getCurrentUser();
        if (user) {
          logUserActivity({
            ...user,
            actionType: "ACTION",
            pageUrl: "/user-access-logs",
            actionDescription: "Cleared all access logs",
          });
        }
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to clear logs.",
          variant: "destructive",
        });
      });
  };

  const columns = [
    { accessorKey: "id", header: "Sr No." },
    { accessorKey: "userId", header: "User ID" },
    { accessorKey: "userEmail", header: "User Email" },
    { accessorKey: "userType", header: "User Type" },
    { accessorKey: "ipAddress", header: "IP Address" },
    {
      accessorKey: "loginTime",
      header: "Login Time",
      cell: ({ row }: any) => formatDateTime(row.getValue("loginTime") as string),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={getStatusColor(row.getValue("status") as string)}>
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }: any) => (
        <Button onClick={() => openActivityModal(row.original.userId)}>View Activity</Button>
      ),
    },
  ];

  return (
    <Layout2>
      <div>
        <div className="space-y-1 mb-6">
          <h2 className="page-title">User Access Logs</h2>
          <p className="page-description">Track user login activities</p>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>Access Logs</CardTitle>
                <CardDescription>A history of user login activities</CardDescription>
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-[180px]"
                />
                <Button
                  variant="destructive"
                  onClick={() => setIsConfirmOpen(true)}
                  disabled={accessLogs.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Logs
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={accessLogs}
              searchColumn="userEmail"
              searchPlaceholder="Search by user email..."
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* User Activity Modal */}
        {activityModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
            onClick={closeActivityModal}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                width: "80%",
                maxWidth: "600px",
                maxHeight: "70vh",
                overflowY: "auto",
                padding: "20px",
                boxSizing: "border-box",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>User Activity Details</h3>
              {activitiesLoading && <p>Loading...</p>}
              {!activitiesLoading && activities.length === 0 && <p>No activities found.</p>}
              <ul>
                {activities.map((act) => (
                  <li key={act.id}>
                    <strong>{new Date(act.timestamp).toLocaleString()}</strong> | {act.pageUrl} | {act.actionType} | {act.actionDescription}
                  </li>
                ))}
              </ul>
              <Button onClick={closeActivityModal}>Close</Button>
            </div>
          </div>
        )}

        {/* Confirm Clear Logs Dialog */}
        {isConfirmOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
            onClick={() => setIsConfirmOpen(false)}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                width: "300px",
                padding: "20px",
                boxSizing: "border-box",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Are you sure you want to clear the logs?</h3>
              <p>This action cannot be undone. This will permanently delete all user access logs from the system.</p>
              <div style={{ marginTop: "1rem", textAlign: "right" }}>
                <Button onClick={() => setIsConfirmOpen(false)} style={{ marginRight: "8px" }}>Cancel</Button>
                <Button variant="destructive" onClick={handleClearLogs}>Clear Logs</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout2>
  );
};

export default UserAccessLogs;
