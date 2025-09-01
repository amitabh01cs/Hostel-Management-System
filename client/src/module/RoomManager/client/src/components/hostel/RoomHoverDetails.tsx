//yearOfStudey


import { HostelRoom } from '@/types/hostel';


interface RoomHoverDetailsProps {
  room: HostelRoom;
  floorName: string;
}


const RoomHoverDetails = ({ room, floorName }: RoomHoverDetailsProps) => {
  // Defensive: if beds is undefined, fallback to empty array
  const beds = Array.isArray(room.beds) ? room.beds : [];


  const occupiedBeds = beds.filter(bed => bed.status === 'occupied' && bed.student);


  return (
    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full z-10 bg-gray-50 p-4 shadow-lg rounded-md border border-gray-200 w-64">
      <h4 className="font-bold text-lg mb-2">ROOM DETAILS</h4>
      <p className="text-sm mb-1">Room no: {room.roomNo}</p>
      <p className="text-sm mb-3">Floor: {floorName}</p>


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
                  {bed.student?.instituteName}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No occupants</p>
      )}
    </div>
  );
};


export default RoomHoverDetails;