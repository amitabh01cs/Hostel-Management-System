import { HostelRoom, HostelBed } from '@/types/hostel';
import BedComponent from './BedComponent';


interface RoomComponentProps {
  room: HostelRoom;
  onBedClick: (room: HostelRoom, bed: HostelBed) => void;
  onAddBed: (room: HostelRoom) => void;
  onRoomHover: (room: HostelRoom | null) => void;
}


const RoomComponent = ({ room, onBedClick, onAddBed, onRoomHover }: RoomComponentProps) => {
  const canAddBed = room.beds.length < 3;
 
  return (
    <div
      className="bg-white shadow-sm p-4 rounded-lg border border-gray-200 relative"
      onMouseEnter={() => onRoomHover(room)}
      onMouseLeave={() => onRoomHover(null)}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-gray-800 font-semibold">Room {room.roomNo}</span>
        <button
          className="text-amber-600 hover:text-amber-800 text-xs px-2 py-1 rounded-md bg-amber-50 border border-amber-100"
          onClick={() => onRoomHover(room)}
        >
          details
        </button>
      </div>
     
      <div className="space-y-1">
        {room.beds.map(bed => (
          <BedComponent
            key={bed.id}
            bed={bed}
            room={room}
            onBedClick={onBedClick}
          />
        ))}
      </div>
     
      {canAddBed && (
        <button
          className="w-full mt-3 text-sm text-green-600 border border-green-200 rounded-md py-1 hover:bg-green-50"
          onClick={() => onAddBed(room)}
        >
          + add bed
        </button>
      )}
    </div>
  );
};


export default RoomComponent;


