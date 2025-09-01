import React from "react";
import { HostelStudent } from "@/types/hostel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BedDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bedId: string;
  student: HostelStudent;
  onRemove: () => void;
  onRelocate: () => void;
}

const BedDetailsDialog: React.FC<BedDetailsDialogProps> = ({
  isOpen,
  onClose,
  bedId,
  student,
  onRemove,
  onRelocate,
}) => {
  if (!student) return null;

  const descId = `bed-details-desc-${bedId}`;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-white p-6 max-w-md" aria-describedby={descId}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Bed {bedId} Details</DialogTitle>
          <DialogDescription id={descId}>
            Details of the student assigned to this bed.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          <div>
            <span className="font-semibold">Name:</span> {student.fullName}
          </div>
          <div>
            <span className="font-semibold">Branch:</span> {student.branch}
          </div>
          <div>
            {/* <span className="font-semibold">Year:</span> {student.yearOfStudy} */}
          </div>
          <div>
            <span className="font-semibold">Institute:</span> {student.institute_name || student.instituteName}
          </div>
          <div>
            <span className="font-semibold">Course:</span> {student.course}
          </div>
          <div>
            <span className="font-semibold">Mobile No:</span> {student.mobileNo}
          </div>
          <div>
            <span className="font-semibold">Email ID:</span> {student.emailId}
          </div>
          <div>
            <span className="font-semibold">Category:</span> {student.category}
          </div>
          <div>
            <span className="font-semibold">Gender:</span> {student.gender}
          </div>
          {/* <div>
            <span className="font-semibold">Reg No:</span> {student.regNo}
          </div> */}
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={onRemove}>
            Remove Student
          </Button>
          <Button className="flex-1" onClick={onRelocate}>
            Relocate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BedDetailsDialog;