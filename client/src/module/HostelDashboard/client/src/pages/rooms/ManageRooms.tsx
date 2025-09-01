import { useState } from "react";
import { Link } from "wouter";
import { DataTable } from "../../components/ui/data-table";
import { Button } from "../../components/ui/button";

import Layout2 from "../../components/layout/Layout2"; 
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Badge } from "../../components/ui/badge";
import { 
  PlusCircle, 
  MoreHorizontal, 
  Pencil, 
  Eye
} from "lucide-react";
import { cn, getStatusColor } from "../../lib/utils";

// Define room data type
type Room = {
  id: string;
  roomNumber: string;
  floor: string;
  type: string;
  capacity: number;
  occupied: number;
  status: string;
};

// Mock data
const rooms: Room[] = [
  { id: "1", roomNumber: "101", floor: "1", type: "3-Seater", capacity: 3, occupied: 3, status: "Full" },
  { id: "2", roomNumber: "102", floor: "1", type: "3-Seater", capacity: 3, occupied: 2, status: "Partially Occupied" },
  { id: "3", roomNumber: "103", floor: "1", type: "3-Seater", capacity: 3, occupied: 0, status: "Available" },
  { id: "4", roomNumber: "201", floor: "2", type: "3-Seater", capacity: 3, occupied: 0, status: "Maintenance" },
];

// Floor summary cards
const floorSummary = [
  { floor: "Floor 1", rooms: 12, occupied: 8, available: 4, color: "border-primary" },
  { floor: "Floor 2", rooms: 12, occupied: 10, available: 2, color: "border-secondary" },
  { floor: "Floor 3", rooms: 12, occupied: 11, available: 1, color: "border-green-500" },
  { floor: "Floor 4", rooms: 12, occupied: 12, available: 0, color: "border-red-500" },
];

const ManageRooms = () => {
  const [detailsRoom, setDetailsRoom] = useState<Room | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleViewDetails = (room: Room) => {
    setDetailsRoom(room);
    setIsDetailsDialogOpen(true);
  };

  const columns = [
    {
      accessorKey: "roomNumber",
      header: "Room No",
    },
    {
      accessorKey: "floor",
      header: "Floor",
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
    },
    {
      accessorKey: "occupied",
      header: "Occupied",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={cn(
            "status-badge",
            getStatusColor(status)
          )}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const room = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewDetails(room)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("Edit", room.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <Layout2>
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="page-title">Manage Rooms</h2>
          <p className="page-description">View and manage all hostel rooms</p>
        </div>
        <Link href="/rooms/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </Link>
      </div>
      
      {/* Floor Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {floorSummary.map((floor, index) => (
          <Card key={index} className={cn("border-l-4", floor.color)}>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-700">{floor.floor}</h3>
              <p className="text-xl font-semibold text-gray-800">{floor.rooms} Rooms</p>
              <p className="text-sm text-gray-500">
                {floor.occupied} Occupied, {floor.available} Available
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Rooms</CardTitle>
          <CardDescription>
            A list of all rooms in the hostel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={rooms} 
            searchColumn="roomNumber" 
            searchPlaceholder="Search rooms..."
          />
        </CardContent>
      </Card>

      {/* Room Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room Details</DialogTitle>
            <DialogDescription>
              Detailed information about Room {detailsRoom?.roomNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Room Number</p>
              <p className="text-sm text-gray-700">{detailsRoom?.roomNumber}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Floor</p>
              <p className="text-sm text-gray-700">{detailsRoom?.floor}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Type</p>
              <p className="text-sm text-gray-700">{detailsRoom?.type}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Capacity</p>
              <p className="text-sm text-gray-700">{detailsRoom?.capacity}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Occupied</p>
              <p className="text-sm text-gray-700">{detailsRoom?.occupied}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Status</p>
              <Badge className={cn(
                "status-badge",
                getStatusColor(detailsRoom?.status || "")
              )}>
                {detailsRoom?.status}
              </Badge>
            </div>
            
            <div className="col-span-2 space-y-1">
              <p className="text-sm font-medium">Facilities</p>
              <p className="text-sm text-gray-700">WiFi, Attached Bathroom, Study Table</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </Layout2>
  );
};

export default ManageRooms;
