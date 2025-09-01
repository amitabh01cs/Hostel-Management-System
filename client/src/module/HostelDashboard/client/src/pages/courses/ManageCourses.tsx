import { useState } from "react";
import { Link } from "wouter";
import { DataTable } from "../../components/ui/data-table";
import { Button } from "../../components/ui/button";
import Layout2 from "../../components/layout/Layout2";

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Badge } from "../../components/ui/badge";
import { PlusCircle, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "../../lib/utils";

// Define course data type
type Course = {
  id: string;
  name: string;
  code: string;
  duration: string;
  students: number;
  status: string;
};

// Mock data
const courses: Course[] = [
  { id: "1", name: "B.Tech Computer Science", code: "CS-01", duration: "4 Years", students: 120, status: "Active" },
  { id: "2", name: "B.Tech Electronics", code: "EC-02", duration: "4 Years", students: 95, status: "Active" },
  { id: "3", name: "B.Tech Mechanical", code: "ME-03", duration: "4 Years", students: 85, status: "Active" },
  { id: "4", name: "B.Tech Civil", code: "CE-04", duration: "4 Years", students: 45, status: "Active" },
];

const ManageCourses = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const { toast } = useToast();

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Simulate delete operation
    toast({
      title: "Course Deleted",
      description: `Course "${courseToDelete?.name}" has been deleted.`,
    });
    setIsDeleteDialogOpen(false);
  };

  const columns = [
    {
      accessorKey: "id",
      header: "Course ID",
    },
    {
      accessorKey: "name",
      header: "Course Name",
    },
    {
      accessorKey: "duration",
      header: "Duration",
    },
    {
      accessorKey: "students",
      header: "Students",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={cn(
            "status-badge",
            status === "Active" ? "status-badge-success" : "status-badge-error"
          )}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const course = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log("Edit", course.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteClick(course)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <Layout2>
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="page-title">Manage Courses</h2>
          <p className="page-description">View and manage all courses</p>
        </div>
        <Link href="/courses/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Courses</CardTitle>
          <CardDescription>
            A list of all courses in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={courses} 
            searchColumn="name" 
            searchPlaceholder="Search courses..."
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this course?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              course <span className="font-medium">{courseToDelete?.name}</span> and
              remove its data from the server.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </Layout2>
  );
};

export default ManageCourses;
