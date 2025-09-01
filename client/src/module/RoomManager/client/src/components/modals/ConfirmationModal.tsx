import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ConfirmationData } from "@/types";
import { useState } from "react";
import PrintableFormModal from "./PrintableFormModal";


interface ConfirmationModalProps {
  data: ConfirmationData;
  onConfirm: () => void;
  onCancel: () => void;
  isAllocated?: boolean;
}


const ConfirmationModal = ({ data, onConfirm, onCancel, isAllocated = false }: ConfirmationModalProps) => {
  const [showPrintable, setShowPrintable] = useState<boolean>(false);
 
  const handleConfirm = () => {
    onConfirm();
    // Don't automatically open the printable form, wait for allocation to complete
  };


  return (
    <>
      <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className="bg-white rounded-lg shadow-lg w-full max-w-md">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">
              {isAllocated ? "Room Allocation Successful" : "Confirm Room Allocation"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>
         
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Student</p>
                <p className="font-medium">{data.student.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Registration Number</p>
                <p className="font-medium">{data.student.regNo}</p>
              </div>
            </div>
           
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Floor</p>
                <p className="font-medium">{data.floorName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Room Number</p>
                <p className="font-medium">{data.room.roomNo}</p>
              </div>
            </div>
           
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Bed Number</p>
                <p className="font-medium">{data.bed.bedNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Room Type</p>
                <p className="font-medium">{data.room.type}</p>
              </div>
            </div>
           
            <div>
              <p className="text-sm text-gray-500">Current Roommates</p>
              {data.roommates.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {data.roommates.map((roommate) => (
                    <li key={roommate.id} className="text-sm font-medium">
                      • {roommate.name} (Bed {roommate.id % 10})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm font-medium mt-1">No current roommates</p>
              )}
            </div>
          </div>
         
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            {isAllocated ? (
              <>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Close
                </Button>
                <Button
                  onClick={() => setShowPrintable(true)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Print Allocation Form
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Confirm Allocation
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
     
      {showPrintable && (
        <PrintableFormModal
          student={data.student}
          room={data.room}
          bed={data.bed}
          roommates={data.roommates}
          floorName={data.floorName}
          onClose={() => setShowPrintable(false)}
        />
      )}
    </>
  );
};


export default ConfirmationModal;


