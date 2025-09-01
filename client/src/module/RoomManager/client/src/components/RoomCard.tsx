import { RoomTypeStats } from "@/types";
import { Button } from "@/components/ui/button";


interface RoomCardProps {
  stats: RoomTypeStats;
  imageSrc: string;
  onManage: (type: string) => void;
}


const RoomCard = ({ stats, imageSrc, onManage }: RoomCardProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <img
        src={imageSrc}
        alt={`${stats.type} room`}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{stats.type} Room</h3>
        <p className="text-gray-600 mb-3">
          {stats.type === "3-Seater" && "Standard accommodation with three beds, desks, and storage spaces."}
          {stats.type === "2-Seater" && "Comfortable accommodation with two beds, desks, and more space."}
          {stats.type === "1-Seater" && "Private accommodation with one bed, desk, and private space."}
        </p>
        <p className="text-sm text-gray-500 mb-2">
          Available: <span className="font-semibold text-green-600">{stats.available}</span>
        </p>
        <p className="text-sm text-gray-500 mb-2">
          Occupied: <span className="font-semibold text-red-600">{stats.occupied}</span>
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Total: <span className="font-semibold">{stats.total}</span>
        </p>
        <Button
          variant="secondary"
          className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 w-full transition-colors"
          onClick={() => onManage(stats.type)}
        >
          Manage
        </Button>
      </div>
    </div>
  );
};


export default RoomCard;






