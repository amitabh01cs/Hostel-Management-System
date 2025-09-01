import { Student } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

interface EmptyBedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bedId: string;
  students: Student[];
  hostelName: string; // Pass this prop!
  onAssignStudent: (studentId: number) => void;
  onRemoveBed: () => void;
}

const EmptyBedDialog = ({
  isOpen,
  onClose,
  bedId,
  students,
  hostelName,
  onAssignStudent,
  onRemoveBed
}: EmptyBedDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // Gender logic according to hostel
  let allowedGender: string | undefined = undefined;
  if (hostelName.toLowerCase().includes("maytri")) {
    allowedGender = "Female";
  } else if (hostelName.toLowerCase().includes("varahmihir")) {
    allowedGender = "Male";
  }

  // Hostel and gender filter
  const filteredStudents = students.filter(student =>
    (!allowedGender || student.gender === allowedGender) &&
    student.hostelName === hostelName &&
    (
      (student.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.regNo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.course || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.branch || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.yearOfStudy || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.instituteName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.emailId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.mobileNo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.gender || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleAssign = () => {
    if (selectedStudentId) {
      onAssignStudent(selectedStudentId);
      onClose();
    }
  };

  // Unique id for aria-describedby
  const descId = `empty-bed-desc-${bedId}`;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent
        className="bg-white p-6 max-w-md"
        aria-describedby={descId}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Empty Bed {bedId}</DialogTitle>
          <DialogDescription id={descId}>
            Assign a student to this empty bed or remove this bed from the room.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Assign Student</h3>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search students (name, reg no, branch, etc)..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-6">
            <Select onValueChange={value => setSelectedStudentId(parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {filteredStudents.length === 0 ? (
                  <SelectItem value="" disabled>No students found</SelectItem>
                ) : (
                  filteredStudents.map(student => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      <div>
                        <div className="font-semibold">
                          {student.fullName} ({student.regNo})
                        </div>
                        <div className="text-xs text-gray-600">
                          {student.branch} | {student.yearOfStudy} | {student.instituteName} | {student.course}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.emailId} | {student.mobileNo} | {student.category} | {student.gender}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-white text-red-500 border-red-200 hover:bg-red-50"
              onClick={onRemoveBed}
            >
              Remove Bed
            </Button>
            <Button
              className="flex-1"
              onClick={handleAssign}
              disabled={!selectedStudentId}
            >
              Assign Student
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmptyBedDialog;