import { useState } from 'react';
import { HostelRoom } from '@/types/hostel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';


interface RoomDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  room: HostelRoom;
  floorName: string;
}


const RoomDetailsDialog = ({ isOpen, onClose, room, floorName }: RoomDetailsDialogProps) => {
  const occupiedBeds = room.beds.filter(bed => bed.status === 'occupied' && bed.student);
 
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white p-6 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">ROOM DETAILS</DialogTitle>
        </DialogHeader>
       
        <div className="mt-4">
          <p className="text-sm mb-1">Room no: {room.roomNo}</p>
          <p className="text-sm mb-1">Floor: {floorName}</p>
          <p className="text-sm mb-3">Type: {room.type}</p>
         
          <h5 className="font-bold text-sm mb-2">Current occupants:</h5>
          {occupiedBeds.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {occupiedBeds.map(bed => (
                <div key={bed.id} className="p-3 bg-gray-200 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">{bed.student?.fullName}</p>
                      <p className="text-sm">{bed.student?.yearOfStudy} • {bed.student?.course}</p>
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {bed.student?.institution}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No occupants</p>
          )}
        </div>
       
        <div className="mt-6 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-primary text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default RoomDetailsDialog;


