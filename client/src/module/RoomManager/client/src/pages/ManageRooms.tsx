import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { RoomTypeStats } from "@/types";
import RoomCard from "@/components/RoomCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

const roomImages = {
  "3-Seater": "https://images.unsplash.com/photo-1555854877-5cfb1c78db08?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
  "2-Seater": "https://images.unsplash.com/photo-1520277739336-7bf67edfa768?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
  "1-Seater": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
};

const ManageRooms = () => {
  const { toast } = useToast();
  const [roomStats, setRoomStats] = useState<RoomTypeStats[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showRoomTypeModal, setShowRoomTypeModal] = useState<boolean>(false);
  const [selectedRoomType, setSelectedRoomType] = useState<string>("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [newRoomType, setNewRoomType] = useState<string>("");
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch room statistics
        const roomStatsResponse = await fetch('/api/stats/rooms');
        if (!roomStatsResponse.ok) {
          throw new Error('Failed to fetch room statistics');
        }
        const roomStatsData = await roomStatsResponse.json();
        setRoomStats(roomStatsData);
        
        // Fetch all rooms
        const roomsResponse = await fetch('/api/rooms');
        if (!roomsResponse.ok) {
          throw new Error('Failed to fetch rooms');
        }
        const roomsData = await roomsResponse.json();
        setRooms(roomsData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load room data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const handleManageRoomType = (type: string) => {
    setSelectedRoomType(type);
    setShowRoomTypeModal(true);
    
    // Filter rooms of this type
    const roomsOfType = rooms.filter(room => room.type === type);
    if (roomsOfType.length > 0) {
      setSelectedRoom(roomsOfType[0].id.toString());
      setNewRoomType(roomsOfType[0].type);
    }
  };
  
  const handleUpdateRoomType = async () => {
    if (!selectedRoom || !newRoomType) {
      toast({
        title: "Error",
        description: "Please select a room and room type.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get capacity based on room type
      const capacity = parseInt(newRoomType[0]);
      
      const response = await fetch(`/api/rooms/${selectedRoom}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newRoomType,
          capacity,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update room');
      }
      
      toast({
        title: "Room Updated",
        description: `Room has been updated to ${newRoomType} successfully.`,
      });
      
      // Refresh data
      const roomsResponse = await fetch('/api/rooms');
      const roomsData = await roomsResponse.json();
      setRooms(roomsData);
      
      const roomStatsResponse = await fetch('/api/stats/rooms');
      const roomStatsData = await roomStatsResponse.json();
      setRoomStats(roomStatsData);
      
      setShowRoomTypeModal(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update room. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Room Management</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading room data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomStats.map((stat) => (
            <RoomCard
              key={stat.type}
              stats={stat}
              imageSrc={roomImages[stat.type as keyof typeof roomImages]}
              onManage={handleManageRoomType}
            />
          ))}
        </div>
      )}
      
      {/* Room Type Management Modal */}
      <Dialog open={showRoomTypeModal} onOpenChange={setShowRoomTypeModal}>
        <DialogContent className="bg-white rounded-lg shadow-lg w-full max-w-md">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">Manage {selectedRoomType} Rooms</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowRoomTypeModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="room-select">Select Room</Label>
              <Select 
                value={selectedRoom} 
                onValueChange={(value) => {
                  setSelectedRoom(value);
                  // Set the current room type as default
                  const room = rooms.find(r => r.id.toString() === value);
                  if (room) {
                    setNewRoomType(room.type);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms
                    .filter(room => room.type === selectedRoomType)
                    .map(room => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        Room {room.roomNo} (Floor {room.floor})
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="room-type">Change Room Type</Label>
              <Select 
                value={newRoomType} 
                onValueChange={setNewRoomType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-Seater">1-Seater</SelectItem>
                  <SelectItem value="2-Seater">2-Seater</SelectItem>
                  <SelectItem value="3-Seater">3-Seater</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Note: Changing room type will update the room capacity.
                This is only possible if no students are currently allocated or if you're increasing capacity.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowRoomTypeModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRoomType}
            >
              Update Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageRooms;
