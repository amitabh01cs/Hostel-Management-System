import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Student, Floor, Room, Bed } from "@/types";
import ConfirmationModal from "./modals/ConfirmationModal";
import BedDetailsDialog from "./bed/BedDetailsDialog";
import EmptyBedDialog from "./bed/EmptyBedDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Layout,
  AlertCircle,
  Trash2,
  ArrowRightLeft,
  EyeOff,
  Eye,
  Filter,
  Search,
  User,
  Calendar,
  Book,
  Phone,
  Lock,
  Shuffle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import headerImg from "@assets/header.png";


interface RoomLayoutProps {
  floors: Floor[];
  student: Student;
  onShowDemoRoom: () => void;
  allStudents: Student[];
}


// Sample room and bed data structure
interface SampleRoom {
  id: number;
  roomNo: string;
  floor: number;
  type: "1-Seater" | "2-Seater" | "3-Seater";
  capacity: number;
  beds: SampleBed[];
}


interface SampleBed {
  id: number;
  bedNo: string;
  roomId: number;
  status: "available" | "occupied" | "unavailable";
  studentId: number | null;
  student?: Student;
}


// Generate sample rooms for a floor
const generateSampleRooms = (floor: number, allStudents: Student[]): SampleRoom[] => {
  const rooms: SampleRoom[] = [];
 
  // Generate 12 rooms per floor (6 on each side with a gap in the middle)
  for (let i = 1; i <= 12; i++) {
    // Room number format: floor number (1 digit) + room number (2 digits)
    const roomNo = `${floor}${i.toString().padStart(2, '0')}`;
   
    // Determine room type and capacity
    let type: "1-Seater" | "2-Seater" | "3-Seater";
    let capacity: number;
   
    // Distribute room types across the floor
    if (i <= 4) {
      type = "3-Seater";
      capacity = 3;
    } else if (i <= 8) {
      type = "2-Seater";
      capacity = 2;
    } else {
      type = "1-Seater";
      capacity = 1;
    }
   
    // Create the room
    const room: SampleRoom = {
      id: floor * 100 + i,
      roomNo,
      floor,
      type,
      capacity,
      beds: []
    };
   
    // Create beds for the room
    const bedLetters = ['A', 'B', 'C'];
    for (let j = 0; j < capacity; j++) {
      // Randomly set some beds as unavailable (about 10%)
      const isUnavailable = Math.random() < 0.1;
     
      const bed: SampleBed = {
        id: room.id * 10 + j,
        bedNo: bedLetters[j],
        roomId: room.id,
        status: isUnavailable ? 'unavailable' : 'available',
        studentId: null
      };
     
      // Set some beds as occupied for demo purposes if not unavailable
      if (!isUnavailable && ((room.id % 4 === 0 && j === 0) || (room.id % 7 === 0 && j === 1))) {
        bed.status = 'occupied';
        const randomStudentIndex = Math.floor(Math.random() * allStudents.length);
        bed.studentId = allStudents[randomStudentIndex].id;
        bed.student = allStudents[randomStudentIndex];
      }
     
      room.beds.push(bed);
    }
   
    rooms.push(room);
  }
 
  return rooms;
};


const RoomLayout = ({ floors, student, onShowDemoRoom, allStudents }: RoomLayoutProps) => {
  const { toast } = useToast();
  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  const [rooms, setRooms] = useState<SampleRoom[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFloorAlert, setShowFloorAlert] = useState<boolean>(false);
  const [selectedBed, setSelectedBed] = useState<{
    roomId: number;
    bedId: number;
  } | null>(null);
  const [confirmationData, setConfirmationData] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [showRelocateOptions, setShowRelocateOptions] = useState<boolean>(false);
  const [allocationSuccessful, setAllocationSuccessful] = useState<boolean>(false);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [adminPasskeyInput, setAdminPasskeyInput] = useState<string>("");
  const [showPasskeyDialog, setShowPasskeyDialog] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [searchStudentQuery, setSearchStudentQuery] = useState<string>("");
  const [hoveredRoom, setHoveredRoom] = useState<SampleRoom | null>(null);
 
  // Load rooms for the selected floor
  useEffect(() => {
    const fetchRooms = () => {
      setIsLoading(true);
     
      try {
        // Generate sample rooms based on the selected floor
        const sampleRooms = generateSampleRooms(selectedFloor, allStudents);
        setRooms(sampleRooms);
       
        // Show alert for 1st year students on 3rd/4th floor
        if (student.year.includes('1st') && (selectedFloor === 2 || selectedFloor === 3)) {
          setShowFloorAlert(true);
        } else {
          setShowFloorAlert(false);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load rooms. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
   
    fetchRooms();
  }, [selectedFloor, student.year, toast, allStudents]);
 
  const handleFloorChange = (value: string) => {
    setSelectedFloor(parseInt(value));
  };
 
  const handleBedClick = (room: SampleRoom, bed: SampleBed) => {
    if (bed.status === 'unavailable') {
      toast({
        title: "Bed Unavailable",
        description: "This bed is marked as unavailable and cannot be allocated.",
        variant: "destructive",
      });
      return;
    }
   
    if (bed.status === 'occupied') {
      if (bed.studentId === student.id) {
        // If this is the student's current bed, offer relocation options
        setShowRelocateOptions(true);
        toast({
          title: "Student's Current Bed",
          description: "This student is already allocated to this bed. You can remove or relocate them.",
          variant: "default",
        });
      } else {
        toast({
          title: "Bed Occupied",
          description: "This bed is already allocated to another student.",
          variant: "destructive",
        });
      }
      return;
    }
   
    setSelectedBed({ roomId: room.id, bedId: bed.id });
   
    // Get roommates
    const roommates = room.beds
      .filter((b) => b.status === 'occupied' && b.student && b.student.id !== student.id)
      .map((b) => b.student!);
   
    setConfirmationData({
      student,
      room,
      bed,
      roommates,
      floorName: floors.find((f) => f.id === selectedFloor)?.name || '',
    });
   
    setShowConfirmation(true);
  };
 
  const handleConfirmAllocation = () => {
    if (!confirmationData) return;
   
    try {
      // Update bed status in our sample data
      const updatedRooms = [...rooms];
      const roomIndex = updatedRooms.findIndex(r => r.id === confirmationData.room.id);
     
      if (roomIndex !== -1) {
        const bedIndex = updatedRooms[roomIndex].beds.findIndex(b => b.id === confirmationData.bed.id);
       
        if (bedIndex !== -1) {
          updatedRooms[roomIndex].beds[bedIndex].status = 'occupied';
          updatedRooms[roomIndex].beds[bedIndex].studentId = student.id;
          updatedRooms[roomIndex].beds[bedIndex].student = student;
         
          setRooms(updatedRooms);
        }
      }
     
      toast({
        title: "Room Allocated",
        description: `Room ${confirmationData.room.roomNo}, Bed ${confirmationData.bed.bedNo} has been allocated to ${student.name}`,
      });
     
      // Keep the confirmation dialog open to show printable form
      setAllocationSuccessful(true);
     
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to allocate room. Please try again.",
        variant: "destructive",
      });
      setShowConfirmation(false);
    }
  };
 
  const handleRemoveStudent = () => {
    // Find the student's current bed
    let foundBed: SampleBed | null = null;
    let foundRoom: SampleRoom | null = null;
   
    for (const room of rooms) {
      for (const bed of room.beds) {
        if (bed.studentId === student.id) {
          foundBed = bed;
          foundRoom = room;
          break;
        }
      }
      if (foundBed) break;
    }
   
    if (foundBed && foundRoom) {
      // Update the bed status
      const updatedRooms = [...rooms];
      const roomIndex = updatedRooms.findIndex(r => r.id === foundRoom!.id);
     
      if (roomIndex !== -1) {
        const bedIndex = updatedRooms[roomIndex].beds.findIndex(b => b.id === foundBed!.id);
       
        if (bedIndex !== -1) {
          updatedRooms[roomIndex].beds[bedIndex].status = 'available';
          updatedRooms[roomIndex].beds[bedIndex].studentId = null;
          updatedRooms[roomIndex].beds[bedIndex].student = undefined;
         
          setRooms(updatedRooms);
         
          toast({
            title: "Allocation Removed",
            description: `${student.name} has been removed from Room ${foundRoom.roomNo}, Bed ${foundBed.bedNo}`,
          });
        }
      }
    }
   
    setShowRelocateOptions(false);
  };
 
  // Toggle bed availability in admin mode
  const toggleBedAvailability = (room: SampleRoom, bed: SampleBed) => {
    if (!isAdminMode) return;
   
    // Don't allow toggling occupied beds
    if (bed.status === 'occupied') {
      toast({
        title: "Cannot Change Occupied Bed",
        description: "You must remove the student allocation first before changing bed availability.",
        variant: "destructive",
      });
      return;
    }
   
    // Update the bed status
    const updatedRooms = [...rooms];
    const roomIndex = updatedRooms.findIndex(r => r.id === room.id);
   
    if (roomIndex !== -1) {
      const bedIndex = updatedRooms[roomIndex].beds.findIndex(b => b.id === bed.id);
     
      if (bedIndex !== -1) {
        // Toggle between available and unavailable
        const newStatus = bed.status === 'available' ? 'unavailable' : 'available';
        updatedRooms[roomIndex].beds[bedIndex].status = newStatus;
       
        setRooms(updatedRooms);
       
        toast({
          title: `Bed ${newStatus === 'unavailable' ? 'Disabled' : 'Enabled'}`,
          description: `Room ${room.roomNo}, Bed ${bed.bedNo} is now ${newStatus}.`,
        });
      }
    }
  };


  // States for tracking interactions
  const [hoveredBedId, setHoveredBedId] = useState<number | null>(null);
  const [selectedBedForDetails, setSelectedBedForDetails] = useState<{room: SampleRoom, bed: SampleBed} | null>(null);
  const [showEmptyBedDialog, setShowEmptyBedDialog] = useState<boolean>(false);
 
  // Format room layout for display
  const renderRoomLayout = () => {
    if (rooms.length === 0) return null;
   
    // Split rooms into two columns (left and right)
    // In the mockup, rooms are numbered 001-012
    // Left side has rooms 009, 008, 007, 010, 011, 012
    // Right side has rooms 006, 005, 004, 001, 002, 003
    const leftRooms = rooms.slice(0, 6);
    const rightRooms = rooms.slice(6, 12);
   
    // Function to render a single bed
    const renderBed = (room: SampleRoom, bed: SampleBed) => {
      let bgColor = '';
      let cursorClass = 'cursor-pointer hover:opacity-80';
      let clickHandler;
      let bedTitle = '';
      let displayText = '';
     
      // Format bed ID according to new format: BB (Boys Bed) + room number + bed letter
      const bedId = `B${room.roomNo}${String.fromCharCode(65 + parseInt(bed.bedNo) - 1)}`;
     
      if (bed.status === 'available') {
        bgColor = 'bg-gray-200';
        displayText = 'Empty bed';
      } else if (bed.status === 'occupied') {
        bgColor = 'bg-green-400';
        displayText = bedId;
      } else if (bed.status === 'unavailable') {
        bgColor = 'bg-red-400';
        cursorClass = isAdminMode ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed';
        displayText = 'Unavailable';
      }
     
      // Set different behaviors based on admin mode and bed status
      if (isAdminMode) {
        clickHandler = () => toggleBedAvailability(room, bed);
        bedTitle = bed.status === 'unavailable'
          ? 'Click to mark as available'
          : bed.status === 'available'
            ? 'Click to mark as unavailable'
            : 'Occupied - cannot change status';
      } else {
        // When not in admin mode, handle clicks based on bed status
        if (bed.status === 'available') {
          // For empty beds, show the empty bed dialog
          clickHandler = () => {
            setSelectedBedForDetails({ room, bed });
            setShowEmptyBedDialog(true);
          };
          bedTitle = 'Click to assign a student to this bed';
        } else if (bed.status === 'occupied') {
          // For occupied beds, show the student details dialog
          clickHandler = () => {
            setSelectedBedForDetails({ room, bed });
            setShowEmptyBedDialog(false);
          };
          bedTitle = 'Click to view student details';
        } else {
          // For unavailable beds
          clickHandler = () => {}; // No action
          bedTitle = 'This bed is unavailable';
        }
      }
     
      // Show student name on hover for occupied beds
      const isHovered = hoveredBedId === bed.id;
      if (bed.status === 'occupied' && bed.student && isHovered) {
        displayText = bed.student.name;
      }
     
      return (
        <div
          key={bed.id}
          className={`h-12 rounded-md ${cursorClass} flex items-center justify-center text-center ${bgColor} mb-2`}
          onClick={clickHandler}
          title={bedTitle}
          onMouseEnter={() => setHoveredBedId(bed.id)}
          onMouseLeave={() => setHoveredBedId(null)}
        >
          <span className="font-medium text-sm">{displayText}</span>
        </div>
      );
    };
   
    // Function to render a single room
    const renderRoom = (room: SampleRoom) => {
      // Add bed function availability - show only if room has less than 3 beds
      const canAddBed = room.beds.length < 3;
     
      return (
        <div
          key={room.id}
          className="bg-white shadow-sm p-4 rounded-lg border border-gray-200 relative"
          onMouseEnter={() => setHoveredRoom(room)}
          onMouseLeave={() => setHoveredRoom(null)}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-800 font-semibold">Room {room.roomNo}</span>
            <button
              className="text-amber-600 hover:text-amber-800 text-xs px-2 py-1 rounded-md bg-amber-50 border border-amber-100"
              onClick={() => {
                // Show room details popup
                toast({
                  title: "Room Details",
                  description: `Room ${room.roomNo} - ${room.type} (Capacity: ${room.capacity})`,
                });
              }}
            >
              details
            </button>
          </div>
         
          <div className="space-y-1">
            {room.beds.map(bed => renderBed(room, bed))}
          </div>
         
          {/* Add Bed Button - only show if room has less than 3 beds */}
          {canAddBed && (
            <button
              className="w-full mt-3 text-sm text-green-600 border border-green-200 rounded-md py-1 hover:bg-green-50"
              onClick={() => {
                // Logic to add a new bed to this room
                const updatedRooms = [...rooms];
                const roomIndex = updatedRooms.findIndex(r => r.id === room.id);
               
                if (roomIndex !== -1) {
                  const newBedNo = (updatedRooms[roomIndex].beds.length + 1).toString();
                  const newBedId = room.id * 10 + parseInt(newBedNo);
                 
                  // Create new bed object
                  const newBed: SampleBed = {
                    id: newBedId,
                    bedNo: newBedNo,
                    roomId: room.id,
                    status: 'available',
                    studentId: null
                  };
                 
                  // Add bed to the room
                  updatedRooms[roomIndex].beds.push(newBed);
                  updatedRooms[roomIndex].capacity += 1;
                 
                  setRooms(updatedRooms);
                 
                  toast({
                    title: "Bed Added",
                    description: `A new bed has been added to Room ${room.roomNo}`,
                  });
                }
              }}
            >
              + add bed
            </button>
          )}
         
          {/* Room hover details - matching the hover_layout.png design */}
          {hoveredRoom?.id === room.id && (
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full z-10 bg-gray-50 p-4 shadow-lg rounded-md border border-gray-200 w-64">
              <h4 className="font-bold text-lg mb-2">ROOM DETAILS</h4>
              <p className="text-sm mb-1">Room no: {room.roomNo}</p>
              <p className="text-sm mb-3">Floor: {floors.find(f => f.id === Math.floor(parseInt(room.roomNo) / 100))?.name || 'Unknown'}</p>
             
              <h5 className="font-bold text-sm mb-2">Current occupants:</h5>
              {room.beds.some(b => b.status === 'occupied') ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {room.beds.filter(b => b.status === 'occupied' && b.student).map(bed => (
                    <div key={bed.id} className="p-3 bg-gray-200 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold">{bed.student?.fulName}</p>
                          <p className="text-sm">{bed.student?.yearOfStudy} • {bed.student?.course}</p>
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          IIST
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No occupants</p>
              )}
            </div>
          )}
        </div>
      );
    };
   
    // Filter rooms based on selected filters
    const filteredLeftRooms = leftRooms.filter(room => {
      // Filter by room type
      if (filterType !== "all" && room.type !== filterType) {
        return false;
      }
     
      // Filter by year (look at occupants)
      if (yearFilter !== "all") {
        const hasStudentOfYear = room.beds.some(bed =>
          bed.status === 'occupied' &&
          bed.student &&
          bed.student.yearOfStudy.toLowerCase().includes(yearFilter.toLowerCase())
        );
        if (!hasStudentOfYear) {
          return false;
        }
      }
     
      return true;
    });
   
    const filteredRightRooms = rightRooms.filter(room => {
      // Filter by room type
      if (filterType !== "all" && room.type !== filterType) {
        return false;
      }
     
      // Filter by year (look at occupants)
      if (yearFilter !== "all") {
        const hasStudentOfYear = room.beds.some(bed =>
          bed.status === 'occupied' &&
          bed.student &&
          bed.student.year.toLowerCase().includes(yearFilter.toLowerCase())
        );
        if (!hasStudentOfYear) {
          return false;
        }
      }
     
      return true;
    });
   
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column of rooms */}
        <div className="grid grid-cols-3 gap-4">
          {filteredLeftRooms.map(renderRoom)}
          {filteredLeftRooms.length === 0 && (
            <div className="col-span-3 text-center p-4 bg-gray-50 rounded-md">
              <p className="text-gray-500">No rooms match your filters</p>
            </div>
          )}
        </div>


        {/* Right column of rooms */}
        <div className="grid grid-cols-3 gap-4">
          {filteredRightRooms.map(renderRoom)}
          {filteredRightRooms.length === 0 && filteredLeftRooms.length > 0 && (
            <div className="col-span-3 text-center p-4 bg-gray-50 rounded-md">
              <p className="text-gray-500">No rooms match your filters</p>
            </div>
          )}
        </div>
      </div>
    );
  };


  // Function to handle bed allocation
  const handleAssignStudent = (studentId: number) => {
    if (!selectedBedForDetails) return;
   
    const { room, bed } = selectedBedForDetails;
    const student = allStudents.find(s => s.id === studentId);
   
    if (!student) return;
   
    // Update the bed with the student
    const updatedRooms = [...rooms];
    const roomIndex = updatedRooms.findIndex(r => r.id === room.id);
   
    if (roomIndex !== -1) {
      const bedIndex = updatedRooms[roomIndex].beds.findIndex(b => b.id === bed.id);
     
      if (bedIndex !== -1) {
        updatedRooms[roomIndex].beds[bedIndex].status = 'occupied';
        updatedRooms[roomIndex].beds[bedIndex].studentId = student.id;
        updatedRooms[roomIndex].beds[bedIndex].student = student;
       
        setRooms(updatedRooms);
       
        toast({
          title: "Student Assigned",
          description: `${student.name} has been assigned to Room ${room.roomNo}, Bed ${bed.bedNo}`,
        });
      }
    }
   
    setSelectedBedForDetails(null);
  };
 
  // Function to handle bed removal
  const handleRemoveBed = () => {
    if (!selectedBedForDetails) return;
   
    const { room, bed } = selectedBedForDetails;
   
    // Remove the bed from the room
    const updatedRooms = [...rooms];
    const roomIndex = updatedRooms.findIndex(r => r.id === room.id);
   
    if (roomIndex !== -1) {
      // Filter out the selected bed
      updatedRooms[roomIndex].beds = updatedRooms[roomIndex].beds.filter(b => b.id !== bed.id);
      updatedRooms[roomIndex].capacity = updatedRooms[roomIndex].beds.length;
     
      // Update room type based on new capacity
      if (updatedRooms[roomIndex].capacity === 1) {
        updatedRooms[roomIndex].type = "1-Seater";
      } else if (updatedRooms[roomIndex].capacity === 2) {
        updatedRooms[roomIndex].type = "2-Seater";
      } else if (updatedRooms[roomIndex].capacity === 3) {
        updatedRooms[roomIndex].type = "3-Seater";
      }
     
      setRooms(updatedRooms);
     
      toast({
        title: "Bed Removed",
        description: `Bed has been removed from Room ${room.roomNo}`,
      });
    }
   
    setSelectedBedForDetails(null);
  };
 
  // Function to handle student removal from bed
  const handleRemoveStudent = () => {
    if (!selectedBedForDetails) return;
   
    const { room, bed } = selectedBedForDetails;
   
    if (!bed.student) return;
   
    // Update the bed status
    const updatedRooms = [...rooms];
    const roomIndex = updatedRooms.findIndex(r => r.id === room.id);
   
    if (roomIndex !== -1) {
      const bedIndex = updatedRooms[roomIndex].beds.findIndex(b => b.id === bed.id);
     
      if (bedIndex !== -1) {
        const studentName = updatedRooms[roomIndex].beds[bedIndex].student?.name || "Student";
       
        updatedRooms[roomIndex].beds[bedIndex].status = 'available';
        updatedRooms[roomIndex].beds[bedIndex].studentId = null;
        updatedRooms[roomIndex].beds[bedIndex].student = undefined;
       
        setRooms(updatedRooms);
       
        toast({
          title: "Student Removed",
          description: `${studentName} has been removed from Room ${room.roomNo}, Bed ${bed.bedNo}`,
        });
      }
    }
   
    setSelectedBedForDetails(null);
  };
 
  // Function to start the relocate process
  const handleStartRelocate = () => {
    if (!selectedBedForDetails) return;
   
    handleRemoveStudent();
   
    toast({
      title: "Ready to Relocate",
      description: "Student has been removed. You can now select another bed to relocate to.",
    });
  };
 
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      {/* Header with logo */}
      <div className="mb-6">
        <img src={headerImg} alt="Hostel Management Header" className="h-16 w-auto object-contain mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-center mb-2">Varahmihir Boys Hostel Room Allocation</h2>
      </div>
     
      <div className="flex flex-col space-y-4 mb-6">
        {/* Room filters and controls */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
              Floor
            </label>
            <Select value={selectedFloor.toString()} onValueChange={handleFloorChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Floor" />
              </SelectTrigger>
              <SelectContent>
                {floors.map((floor) => (
                  <SelectItem key={floor.id} value={floor.id.toString()}>
                    {floor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
         
          <div>
            <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">
              Seating
            </label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="1-Seater">1-Seater</SelectItem>
                <SelectItem value="2-Seater">2-Seater</SelectItem>
                <SelectItem value="3-Seater">3-Seater</SelectItem>
              </SelectContent>
            </Select>
          </div>
         
          <div>
            <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="1st">1st Year</SelectItem>
                <SelectItem value="2nd">2nd Year</SelectItem>
                <SelectItem value="3rd">3rd Year</SelectItem>
                <SelectItem value="4th">4th Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
         
          <div>
            <label htmlFor="institutionFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Institution
            </label>
            <Select value="all" onValueChange={() => {}}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Institution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                <SelectItem value="IIST">IIST</SelectItem>
                <SelectItem value="IIP">IIP</SelectItem>
                <SelectItem value="IIMR">IIMR</SelectItem>
              </SelectContent>
            </Select>
          </div>
         
          <div>
            <label htmlFor="vacancyFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Vacancy
            </label>
            <Select value="all" onValueChange={() => {}}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Vacancy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
                <SelectItem value="partially">Partially Filled</SelectItem>
                <SelectItem value="filled">Fully Filled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
       
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            variant="outline"
            className="px-4 py-2 bg-white text-gray-700 border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center h-10"
            onClick={onShowDemoRoom}
          >
            <Layout className="mr-1 h-4 w-4" /> Demo Room
          </Button>
         
          <Button
            variant="outline"
            className="px-4 py-2 bg-white text-indigo-600 border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors flex items-center justify-center h-10"
            onClick={() => {
              // Implement student reshuffling by year
              const studentsToReshuffle = allStudents.filter(s =>
                s.year.toLowerCase().includes(yearFilter === 'all' ? '' : yearFilter.toLowerCase())
              );
             
              if (studentsToReshuffle.length === 0) {
                toast({
                  title: "No Students to Reshuffle",
                  description: "No students match the current year filter.",
                  variant: "destructive",
                });
                return;
              }
             
              // First, free up all beds occupied by these students
              const updatedRooms = [...rooms];
              let relocatedCount = 0;
             
              updatedRooms.forEach(room => {
                room.beds.forEach(bed => {
                  if (bed.status === 'occupied' && bed.student) {
                    const matchesFilter = bed.student.year.toLowerCase().includes(
                      yearFilter === 'all' ? '' : yearFilter.toLowerCase()
                    );
                   
                    if (matchesFilter) {
                      bed.status = 'available';
                      bed.studentId = null;
                      bed.student = undefined;
                      relocatedCount++;
                    }
                  }
                });
              });
             
              // Then randomly assign them to new beds
              const availableBeds = updatedRooms.flatMap(room =>
                room.beds
                  .filter(bed => bed.status === 'available')
                  .map(bed => ({ bed, room }))
              );
             
              // Shuffle the students
              const shuffledStudents = [...studentsToReshuffle]
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.min(studentsToReshuffle.length, availableBeds.length));
             
              shuffledStudents.forEach((student, idx) => {
                if (idx < availableBeds.length) {
                  const { bed, room } = availableBeds[idx];
                  const roomIdx = updatedRooms.findIndex(r => r.id === room.id);
                  const bedIdx = updatedRooms[roomIdx].beds.findIndex(b => b.id === bed.id);
                 
                  updatedRooms[roomIdx].beds[bedIdx].status = 'occupied';
                  updatedRooms[roomIdx].beds[bedIdx].studentId = student.id;
                  updatedRooms[roomIdx].beds[bedIdx].student = student;
                }
              });
             
              setRooms(updatedRooms);
             
              toast({
                title: "Students Reshuffled",
                description: `${shuffledStudents.length} students have been reshuffled to new beds.`,
              });
            }}
          >
            <Shuffle className="mr-1 h-4 w-4" /> Reshuffle Students
          </Button>
         
          <Button
            variant="outline"
            className="px-4 py-2 bg-white text-amber-600 border-amber-200 rounded-md hover:bg-amber-50 transition-colors flex items-center justify-center h-10"
            onClick={() => setShowPasskeyDialog(true)}
          >
            <Lock className="mr-1 h-4 w-4" /> {isAdminMode ? "Exit Admin Mode" : "Enter Admin Mode"}
          </Button>
         
          {showRelocateOptions && (
            <>
              <Button
                variant="outline"
                className="px-4 py-2 bg-white text-red-600 border-red-200 rounded-md hover:bg-red-50 transition-colors flex items-center justify-center h-10"
                onClick={handleRemoveStudent}
              >
                <Trash2 className="mr-1 h-4 w-4" /> Remove Allocation
              </Button>
              <Button
                variant="outline"
                className="px-4 py-2 bg-white text-blue-600 border-blue-200 rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center h-10"
                onClick={() => {
                  handleRemoveStudent();
                  toast({
                    title: "Ready to Relocate",
                    description: "Student's current allocation has been removed. You can now assign a new bed.",
                  });
                }}
              >
                <ArrowRightLeft className="mr-1 h-4 w-4" /> Relocate Student
              </Button>
            </>
          )}
        </div>
      </div>
     
      {/* Admin Mode Passkey Dialog */}
      <Dialog open={showPasskeyDialog} onOpenChange={setShowPasskeyDialog}>
        <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isAdminMode ? "Confirm Exit Admin Mode" : "Enter Admin Passkey"}
            </DialogTitle>
            <DialogDescription>
              {isAdminMode
                ? "Are you sure you want to exit admin mode?"
                : "Enter the admin passkey to access administrative features."}
            </DialogDescription>
          </DialogHeader>
         
          {!isAdminMode && (
            <div className="my-4">
              <label htmlFor="passkey" className="block text-sm font-medium text-gray-700 mb-1">
                Passkey
              </label>
              <Input
                id="passkey"
                type="password"
                placeholder="Enter passkey"
                value={adminPasskeyInput}
                onChange={(e) => setAdminPasskeyInput(e.target.value)}
                className="w-full"
              />
            </div>
          )}
         
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPasskeyDialog(false);
                setAdminPasskeyInput("");
              }}
              className="px-4 py-2"
            >
              Cancel
            </Button>
           
            <Button
              onClick={() => {
                if (isAdminMode) {
                  // Exit admin mode
                  setIsAdminMode(false);
                  setShowPasskeyDialog(false);
                  toast({
                    title: "Admin Mode Disabled",
                    description: "You've exited administrative mode.",
                  });
                } else {
                  // Validate passkey
                  if (adminPasskeyInput === "passkey123") {
                    setIsAdminMode(true);
                    setShowPasskeyDialog(false);
                    setAdminPasskeyInput("");
                    toast({
                      title: "Admin Mode Enabled",
                      description: "You can now mark beds as unavailable by clicking on them.",
                    });
                  } else {
                    toast({
                      title: "Invalid Passkey",
                      description: "The passkey you entered is incorrect.",
                      variant: "destructive",
                    });
                  }
                }
              }}
              className="px-4 py-2 bg-primary text-white"
            >
              {isAdminMode ? "Confirm Exit" : "Unlock Admin Mode"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {showFloorAlert && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Floor Allocation Warning</AlertTitle>
          <AlertDescription>
            1st year students should be allocated to Ground or First floor only.
          </AlertDescription>
        </Alert>
      )}


      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading room layout...</p>
        </div>
      ) : (
        <div id="roomLayout" className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          {renderRoomLayout()}


          <div className="mt-4 flex justify-center">
            <div className="grid grid-cols-4 gap-4 w-full max-w-md">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-sm bg-green-500 mr-2"></div>
                <span className="text-gray-700 text-sm">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-sm bg-gray-400 mr-2"></div>
                <span className="text-gray-700 text-sm">Occupied</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-sm bg-red-500 mr-2"></div>
                <span className="text-gray-700 text-sm">Unavailable</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-sm bg-blue-500 mr-2"></div>
                <span className="text-gray-700 text-sm">Selected</span>
              </div>
            </div>
          </div>
        </div>
      )}


      {showConfirmation && confirmationData && (
        <ConfirmationModal
          data={confirmationData}
          onConfirm={handleConfirmAllocation}
          onCancel={() => {
            setShowConfirmation(false);
            setAllocationSuccessful(false);
          }}
          isAllocated={allocationSuccessful}
        />
      )}
    </div>
  );
};


export default RoomLayout;




