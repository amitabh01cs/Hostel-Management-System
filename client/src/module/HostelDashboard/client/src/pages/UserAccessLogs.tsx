import { useState, useEffect } from "react";
import { DataTable } from "../components/ui/data-table";
// import UserActivityLogsTable from "../components/UserActivityLogsTable";
import Layout2 from "../components/layout/Layout2";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { formatDateTime, getStatusColor } from "../lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "../../../../../../src/getUser"; // 👈 Import  import App from ""
import { logUserActivity } from "../../../../../../src/utils/activityLogger"; // 👈 Import

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

const UserAccessLogs = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Log page visit
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      logUserActivity({
        ...user,
        actionType: "VISIT",
        pageUrl: "/user-access-logs",
        actionDescription: "Visited User Access Logs page"
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
          status: log.status
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

  // Clear logs via backend API
  const handleClearLogs = () => {
    setIsAlertDialogOpen(false);
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

        // Log clear action
        const user = getCurrentUser();
        if (user) {
          logUserActivity({
            ...user,
            actionType: "ACTION",
            pageUrl: "/user-access-logs",
            actionDescription: "Cleared all access logs"
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
    {
      accessorKey: "id",
      header: "Sr No.",
    },
    {
      accessorKey: "userId",
      header: "User ID",
    },
    {
      accessorKey: "userEmail",
      header: "User Email",
    },
    {
      accessorKey: "userType",
      header: "User Type",
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
    },
    {
      accessorKey: "loginTime",
      header: "Login Time",
      cell: ({ row }: any) => {
        const date = row.getValue("loginTime") as string;
        return formatDateTime(date);
      },
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
  ];

  return (
    <Layout2>
      <div>
        <div className="space-y-1 mb-6">
          <h2 className="page-title">User Access Logs</h2>
          <p className="page-description">Track user login activities</p>
        </div>
{/*          <div className="p-8">
        <h2 className="text-xl font-bold mb-4">User Activity Logs</h2>
        <UserActivityLogsTable />
      </div> */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>Access Logs</CardTitle>
                <CardDescription>
                  A history of user login activities
                </CardDescription>
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
                  onClick={() => setIsAlertDialogOpen(true)}
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
        <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to clear the logs?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all
                user access logs from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearLogs} className="bg-red-600 hover:bg-red-700">
                Clear Logs
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout2>
  );
};

export default UserAccessLogs;
