import { HostelStudent } from "@/types/hostel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BedDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bedId: string;
  student?: HostelStudent;
  onRemove: () => void;
  onRelocate: () => void;
}

const BedDetailsDialog = ({
  isOpen,
  onClose,
  bedId,
  student,
  onRemove,
  onRelocate
}: BedDetailsDialogProps) => {
  if (!student) return null;

  // Unique id for aria-describedby
  const descId = `bed-details-desc-${bedId}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white p-0 max-w-md" aria-describedby={descId}>
        <DialogHeader>
          <DialogTitle className="p-4 text-xl font-bold">Bed {bedId} - Student Details</DialogTitle>
          <DialogDescription id={descId}>
            View details of the student assigned to this bed. You can remove or relocate the student.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-gray-50 rounded-lg mx-4 mb-4">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold">{student.fullName}</h3>
              <p className="text-gray-800 font-bold">{student.branch}</p>
              <p className="text-gray-600">{student.year ?? student.yearOfStudy}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div><span className="font-semibold">Course:</span> {student.course}</div>
            <div><span className="font-semibold">Institute:</span> {student.instituteName ?? student.institution}</div>
            <div><span className="font-semibold">Mobile:</span> {student.mobileNo ?? student.contactNo}</div>
            <div><span className="font-semibold">Email:</span> {student.emailId}</div>
            <div><span className="font-semibold">Category:</span> {student.category}</div>
            <div><span className="font-semibold">Gender:</span> {student.gender}</div>
            <div><span className="font-semibold">Father's Name:</span> {student.fatherName}</div>
            <div><span className="font-semibold">Father's Phone:</span> {student.fatherMobile}</div>
            <div><span className="font-semibold">Mother's Name:</span> {student.motherName}</div>
            <div><span className="font-semibold">Mother's Phone:</span> {student.motherMobile}</div>
          </div>

          <div className="flex mt-6 gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-white text-red-500 border-red-200 hover:bg-red-50"
              onClick={onRemove}
            >
              Remove
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-white text-blue-500 border-blue-200 hover:bg-blue-50"
              onClick={onRelocate}
            >
              Relocate
            </Button>
          </div>
        </div>

        <div className="p-4 text-right">
          <Button
            variant="outline"
            className="text-amber-600 border-amber-200 hover:bg-amber-50"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BedDetailsDialog;