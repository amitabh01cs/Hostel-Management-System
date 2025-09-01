import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Printer } from "lucide-react";
import { Student, Room, Bed } from "@/types";
import { useReactToPrint } from "react-to-print";


interface PrintableFormModalProps {
  student: Student;
  room: Room;
  bed: Bed;
  roommates: Student[];
  floorName: string;
  onClose: () => void;
}


const PrintableFormModal = ({
  student,
  room,
  bed,
  roommates,
  floorName,
  onClose
}: PrintableFormModalProps) => {
  const printableRef = useRef<HTMLDivElement>(null);
 
  // Generate a form ID
  const formId = `RA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
 
  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };
 
  const currentDate = formatDate(new Date());
 
  // Calculate end date (6 months from now)
  const endDate = formatDate(new Date(new Date().setMonth(new Date().getMonth() + 6)));
 
  const handlePrint = useReactToPrint({
    content: () => printableRef.current,
    documentTitle: `Room_Allocation_${student.regNo}`,
  });


  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-xl font-semibold">Room Allocation Form</DialogTitle>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrint}
              className="text-primary hover:text-blue-700"
            >
              <Printer className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
       
        <div ref={printableRef} className="p-4 border rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-bold">Boys Hostel Room Allocation Form</h4>
              <p className="text-sm text-gray-600">Academic Year {new Date().getFullYear()}-{new Date().getFullYear() + 1}</p>
            </div>
            <div className="text-sm text-gray-600">
              <p>Form #: <span className="font-medium">{formId}</span></p>
              <p>Date: <span className="font-medium">{currentDate}</span></p>
            </div>
          </div>
         
          <div className="mb-6">
            <h5 className="font-semibold mb-2 text-gray-700 border-b pb-1">1. Student Information</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{student.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registration Number</p>
                <p className="font-medium">{student.regNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Course</p>
                <p className="font-medium">{student.course}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Year of Study</p>
                <p className="font-medium">{student.year_of_study}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact Number</p>
                <p className="font-medium">{student.contactNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{student.email}</p>
              </div>
            </div>
          </div>
         
          <div className="mb-6">
            <h5 className="font-semibold mb-2 text-gray-700 border-b pb-1">2. Room Allocation Details</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Hostel Block</p>
                <p className="font-medium">Boys Hostel Block A</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Floor</p>
                <p className="font-medium">{floorName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Room Number</p>
                <p className="font-medium">{room.roomNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bed Number</p>
                <p className="font-medium">B{room.roomNo}{bed.bedNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Room Type</p>
                <p className="font-medium">{room.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Joining</p>
                <p className="font-medium">{currentDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Ending</p>
                <p className="font-medium">{endDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Fees</p>
                <p className="font-medium">₹60,000</p>
              </div>
            </div>
          </div>
         
          <div className="mb-6">
            <h5 className="font-semibold mb-2 text-gray-700 border-b pb-1">3. Roommate Details</h5>
            {roommates.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-2 px-3">Name</th>
                    <th className="text-left py-2 px-3">Registration No.</th>
                    <th className="text-left py-2 px-3">Course</th>
                    <th className="text-left py-2 px-3">Contact Number</th>
                  </tr>
                </thead>
                <tbody>
                  {roommates.map((roommate, index) => (
                    <tr key={roommate.id} className={index < roommates.length - 1 ? "border-b" : ""}>
                      <td className="py-2 px-3">{roommate.name}</td>
                      <td className="py-2 px-3">{roommate.regNo}</td>
                      <td className="py-2 px-3">{roommate.course}</td>
                      <td className="py-2 px-3">{roommate.contactNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-600">No roommates assigned yet.</p>
            )}
          </div>
         
          <div className="mb-6">
            <h5 className="font-semibold mb-2 text-gray-700 border-b pb-1">4. Fee Payment Details</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-medium">₹60,000</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Mode</p>
                <p className="font-medium">Online Transfer</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className="font-medium text-green-600">Paid</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transaction ID</p>
                <p className="font-medium">HOSTEL{new Date().getFullYear()}{Math.floor(100000 + Math.random() * 900000)}</p>
              </div>
            </div>
          </div>
         
          <div className="mb-6">
            <h5 className="font-semibold mb-2 text-gray-700 border-b pb-1">5. Declaration</h5>
            <p className="text-sm mb-4">I hereby declare that I will abide by all the rules and regulations of the hostel. I will maintain the room and the furniture in good condition. I understand that any damage to the room or furniture will be my responsibility, and I am liable to pay the required charges.</p>
           
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Student Signature</p>
                <div className="h-12 border-b border-gray-400 mt-2"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Warden Signature</p>
                <div className="h-12 border-b border-gray-400 mt-2"></div>
              </div>
            </div>
          </div>
         
          <div className="text-sm text-gray-500 text-center pt-2 border-t">
            <p>This is an official document. Please keep it safe for future reference.</p>
            <p className="mt-1">For any queries, contact the Hostel Office at +91 98765 43210</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default PrintableFormModal;


