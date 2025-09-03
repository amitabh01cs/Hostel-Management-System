import { useState, useEffect } from "react";
import { DataTable } from "../components/ui/data-table";
import Layout2 from "../components/layout/Layout2";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
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
import { formatDateTime } from "../lib/utils";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "https://hostel-backend-module-production-iist.up.railway.app";

// YE POORA CODE COPY-PASTE KAREIN
type ActivityLog = {
  id: number;
  user_id: string;
  user_email: string;
  user_type: string;
  ip_address: string;
  action: string;
  page_url: string;
  action_time: string;
};

const UserActivityLogs = () => {
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchLogs = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/activity-log`)
      .then((res) => res.json())
      .then((data) => {
        setActivityLogs(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to load activity logs.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClearLogs = () => {
    setIsAlertDialogOpen(false);
    fetch(`${API_BASE_URL}/api/activity-log`, { method: "DELETE" })
      .then(() => {
        setActivityLogs([]);
        toast({
          title: "Logs Cleared",
          description: "All activity logs have been successfully cleared.",
        });
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
    { accessorKey: "id", header: "ID" },
    { accessorKey: "user_email", header: "User Email" },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }: any) => <Badge variant="outline">{row.getValue("action")}</Badge>,
    },
    { accessorKey: "page_url", header: "Page URL" },
    {
      accessorKey: "action_time",
      header: "Time",
      cell: ({ row }: any) => formatDateTime(row.getValue("action_time")),
    },
    { accessorKey: "ip_address", header: "IP Address" },
  ];

  return (
    <Layout2>
      <div>
        <div className="space-y-1 mb-6">
          <h2 className="page-title">User Activity Logs</h2>
          <p className="page-description">Track all user activities in the system.</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Activity History</CardTitle>
                <CardDescription>A record of all actions performed by users.</CardDescription>
              </div>
              <Button variant="destructive" onClick={() => setIsAlertDialogOpen(true)} disabled={activityLogs.length === 0}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Logs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={activityLogs} 
              searchColumn="user_email" 
              searchPlaceholder="Search by user email..."
              loading={loading}
            />
          </CardContent>
        </Card>
        <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete all activity logs. This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearLogs} className="bg-red-600 hover:bg-red-700">Clear Logs</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout2>
  );
};

export default UserActivityLogs;
