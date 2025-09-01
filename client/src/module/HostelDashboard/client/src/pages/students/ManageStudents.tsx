import { useState, useEffect } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  PlusCircle,
  MoreHorizontal,
  Pencil,
  Eye,
  Trash
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { formatDate } from "../../lib/utils";
import { useAdminAuth } from "../../hooks/useAdminAuth";

type Student = {
  id: number;
  fullName: string;
  dob?: string;
  age?: number;
  gender?: string;
  religion?: string;
  category?: string;
  nationality?: string;
  mobileNo: string;
  emailId: string;
  aadharNo?: string;
  course: string;
  semesterYear?: string;
  instituteName?: string;
  courseName?: string;
  branch?: string;
  yearOfStudy?: string;
  dateOfAdmission?: string;
  hostelJoinDate?: string;
  photoPath?: string;
  fatherName?: string;
  fatherOccupation?: string;
  fatherEducation?: string;
  fatherEmail?: string;
  fatherMobile?: string;
  motherName?: string;
  motherOccupation?: string;
  motherEducation?: string;
  motherEmail?: string;
  motherMobile?: string;
  permanentAddress?: string;
  cityDistrict?: string;
  state?: string;
  pinCode?: string;
  phoneResidence?: string;
  phoneOffice?: string;
  officeAddress?: string;
  localGuardianName?: string;
  localGuardianAddress?: string;
  localGuardianPhone?: string;
  localGuardianMobile?: string;
  emergencyContactName?: string;
  emergencyContactNo?: string;
  bloodGroup?: string;
  seriousDisease?: string;
  regularMedication?: string;
  hospitalRecord?: string;
  emergencyMedicine?: string;
  allergicTo?: string;
  roomNo?: string;
};

const initialEditState: Partial<Student> = {};

const ManageStudents = () => {
  const { admin, loading } = useAdminAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [detailsStudent, setDetailsStudent] = useState<Student | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Partial<Student>>(initialEditState);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !admin) {
      window.location.href = "/login";
    }
  }, [admin, loading]);

  useEffect(() => {
    if (!admin) return;

    const adminUserRaw = localStorage.getItem("adminUser");
    let adminType = "";
    if (adminUserRaw) {
      try {
        const adminUser = JSON.parse(adminUserRaw);
        adminType = adminUser.adminType ? adminUser.adminType.trim().toLowerCase() : "";
      } catch (e) {}
    }

    let url = "https://hostel-backend-module-production-iist.up.railway.app/api/student/filtered-list";
    if (adminType === "varahmihir") {
      url += "?gender=M";
    } else if (adminType === "maitreyi") {
      url += "?gender=F";
    }
    fetch(url)
      .then(res => res.json())
      .then(data => setStudents(data));
  }, [admin]);

  if (loading) return <Layout2><div className="p-8">Loading...</div></Layout2>;
  if (!admin) return null;

  // Handlers:
  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (student: Student) => {
    setDetailsStudent(student);
    setIsDetailsDialogOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setEditStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If photoBlob is present in Student, exclude it here. If not, just use as below.
    fetch(`https://hostel-backend-module-production-iist.up.railway.app/api/student/update/${editStudent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editStudent),
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update student");
        return res.text();
      })
      .then(() => {
        setStudents(prev =>
          prev.map(s => (s.id === editStudent.id ? { ...s, ...editStudent } : s))
        );
        setIsEditDialogOpen(false);
        toast({
          title: "Student Updated",
          description: `Student "${editStudent.fullName}" has been updated.`,
        });
      })
      .catch(() => {
        toast({
          title: "Failed",
          description: "Could not update student",
          variant: "destructive",
        });
      });
  };

  const handleDeleteConfirm = () => {
    fetch(`https://hostel-backend-module-production-iist.up.railway.app/api/student/delete/${studentToDelete?.id}`, {
      method: "DELETE",
    })
      .then(res => res.text())
      .then(msg => {
        if (msg.includes("successfully")) {
          setStudents(prev => prev.filter(s => s.id !== studentToDelete?.id));
          toast({
            title: "Student Removed",
            description: `Student "${studentToDelete?.fullName}" has been removed.`,
          });
        } else {
          toast({
            title: "Failed",
            description: msg,
            variant: "destructive",
          });
        }
      })
      .catch(() => {
        toast({
          title: "Failed",
          description: "Could not remove student",
          variant: "destructive",
        });
      })
      .finally(() => setIsDeleteDialogOpen(false));
  };

  const columns = [
    {
      id: "photo",
      header: "Photo",
      cell: ({ row }) => {
        const name = row.original.fullName as string;
        return (
          <img
            src={`https://hostel-backend-module-production-iist.up.railway.app/api/student/photo/${row.original.id}`}
            alt={name}
            className="w-10 h-10 rounded-full object-cover border"
            style={{ minWidth: 40, minHeight: 40 }}
            onError={(e) => e.currentTarget.src = "/no-image.png"}
          />
        );
      },
    },
    {
      accessorKey: "fullName",
      header: "Student Name",
      cell: ({ row }) => {
        const name = row.getValue("fullName") as string;
        const course = row.original.course as string;
        const year = row.original.yearOfStudy as string;
        return (
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-gray-500">{course} {year ? `| Year: ${year}` : ""}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "yearOfStudy",
      header: "Year",
      cell: ({ row }) => row.getValue("yearOfStudy") || "-",
    },
    {
      accessorKey: "roomNo",
      header: "Room No",
      cell: ({ row }) => row.original.roomNo || "-",
    },
    {
      accessorKey: "mobileNo",
      header: "Contact No",
    },
    {
      accessorKey: "fatherName",
      header: "Father's Name",
      cell: ({ row }) => row.original.fatherName || "-",
    },
    {
      accessorKey: "fatherMobile",
      header: "Father's Phone",
      cell: ({ row }) => row.original.fatherMobile || "-",
    },
    {
      accessorKey: "motherName",
      header: "Mother's Name",
      cell: ({ row }) => row.original.motherName || "-",
    },
    {
      accessorKey: "motherMobile",
      header: "Mother's Phone",
      cell: ({ row }) => row.original.motherMobile || "-",
    },
    {
      accessorKey: "hostelJoinDate",
      header: "Staying From",
      cell: ({ row }) => {
        const date = row.getValue("hostelJoinDate") as string | undefined;
        return date ? formatDate(new Date(date)) : "-";
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const student = row.original;
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
              <DropdownMenuItem onClick={() => handleViewDetails(student)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditClick(student)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(student)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  function DetailRow({ label, value }: { label: string, value?: string | number }) {
    if (!value) return null;
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-gray-700">{value}</p>
      </div>
    );
  }

  return (
    <Layout2>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="page-title">Manage Students</h2>
            <p className="page-description">View and manage all students</p>
          </div>
          <Link href="/students/add">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Students</CardTitle>
            <CardDescription>
              A list of all students in the hostel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={students}
              searchColumn="fullName"
              searchPlaceholder="Search students..."
            />
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
              <DialogDescription>
                Detailed information about {detailsStudent?.fullName}
              </DialogDescription>
            </DialogHeader>
            {detailsStudent && (
              <div className="flex justify-center mb-6">
                <img
                  src={`https://hostel-backend-module-production-iist.up.railway.app/api/student/photo/${detailsStudent.id}`}
                  alt={detailsStudent.fullName}
                  className="w-32 h-32 rounded-full object-cover border"
                  onError={(e) => e.currentTarget.src = "/no-image.png"}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 py-4">
              <DetailRow label="Name" value={detailsStudent?.fullName} />
              <DetailRow label="Email" value={detailsStudent?.emailId} />
              <DetailRow label="Mobile" value={detailsStudent?.mobileNo} />
              <DetailRow label="Year of Study" value={detailsStudent?.yearOfStudy} />
              <DetailRow label="DOB" value={detailsStudent?.dob ? formatDate(new Date(detailsStudent.dob)) : undefined} />
              <DetailRow label="Age" value={detailsStudent?.age} />
              <DetailRow label="Gender" value={detailsStudent?.gender} />
              <DetailRow label="Religion" value={detailsStudent?.religion} />
              <DetailRow label="Category" value={detailsStudent?.category} />
              <DetailRow label="Nationality" value={detailsStudent?.nationality} />
              <DetailRow label="Aadhar No" value={detailsStudent?.aadharNo} />
              <DetailRow label="Course" value={detailsStudent?.course} />
              <DetailRow label="Semester/Year" value={detailsStudent?.semesterYear} />
              <DetailRow label="Institute Name" value={detailsStudent?.instituteName} />
              <DetailRow label="Course Name" value={detailsStudent?.courseName} />
              <DetailRow label="Branch" value={detailsStudent?.branch} />
              <DetailRow label="Date of Admission" value={detailsStudent?.dateOfAdmission ? formatDate(new Date(detailsStudent.dateOfAdmission)) : undefined} />
              <DetailRow label="Hostel Join Date" value={detailsStudent?.hostelJoinDate ? formatDate(new Date(detailsStudent.hostelJoinDate)) : undefined} />
              <DetailRow label="Room No" value={detailsStudent?.roomNo} />
              <DetailRow label="Father Name" value={detailsStudent?.fatherName} />
              <DetailRow label="Father Occupation" value={detailsStudent?.fatherOccupation} />
              <DetailRow label="Father Education" value={detailsStudent?.fatherEducation} />
              <DetailRow label="Father Email" value={detailsStudent?.fatherEmail} />
              <DetailRow label="Father Mobile" value={detailsStudent?.fatherMobile} />
              <DetailRow label="Mother Name" value={detailsStudent?.motherName} />
              <DetailRow label="Mother Occupation" value={detailsStudent?.motherOccupation} />
              <DetailRow label="Mother Education" value={detailsStudent?.motherEducation} />
              <DetailRow label="Mother Email" value={detailsStudent?.motherEmail} />
              <DetailRow label="Mother Mobile" value={detailsStudent?.motherMobile} />
              <DetailRow label="Permanent Address" value={detailsStudent?.permanentAddress} />
              <DetailRow label="City/District" value={detailsStudent?.cityDistrict} />
              <DetailRow label="State" value={detailsStudent?.state} />
              <DetailRow label="Pin Code" value={detailsStudent?.pinCode} />
              <DetailRow label="Phone (Residence)" value={detailsStudent?.phoneResidence} />
              <DetailRow label="Phone (Office)" value={detailsStudent?.phoneOffice} />
              <DetailRow label="Office Address" value={detailsStudent?.officeAddress} />
              <DetailRow label="Local Guardian Name" value={detailsStudent?.localGuardianName} />
              <DetailRow label="Local Guardian Address" value={detailsStudent?.localGuardianAddress} />
              <DetailRow label="Local Guardian Phone" value={detailsStudent?.localGuardianPhone} />
              <DetailRow label="Local Guardian Mobile" value={detailsStudent?.localGuardianMobile} />
              <DetailRow label="Emergency Contact Name" value={detailsStudent?.emergencyContactName} />
              <DetailRow label="Emergency Contact No" value={detailsStudent?.emergencyContactNo} />
              <DetailRow label="Blood Group" value={detailsStudent?.bloodGroup} />
              <DetailRow label="Serious Disease" value={detailsStudent?.seriousDisease} />
              <DetailRow label="Regular Medication" value={detailsStudent?.regularMedication} />
              <DetailRow label="Hospital Record" value={detailsStudent?.hospitalRecord} />
              <DetailRow label="Emergency Medicine" value={detailsStudent?.emergencyMedicine} />
              <DetailRow label="Allergic To" value={detailsStudent?.allergicTo} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Student Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Edit the details for <span className="font-medium">{editStudent.fullName}</span>
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Full Name</label>
                  <input
                    className="input"
                    name="fullName"
                    value={editStudent.fullName || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Year</label>
                  <input
                    className="input"
                    name="yearOfStudy"
                    value={editStudent.yearOfStudy || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Course</label>
                  <input
                    className="input"
                    name="course"
                    value={editStudent.course || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Mobile No</label>
                  <input
                    className="input"
                    name="mobileNo"
                    value={editStudent.mobileNo || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    className="input"
                    name="emailId"
                    value={editStudent.emailId || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                {/* Add more fields here if you want */}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure you want to remove this student?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently remove the
                student <span className="font-medium">{studentToDelete?.fullName}</span> and
                their data from the system.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout2>
  );
};

export default ManageStudents;
