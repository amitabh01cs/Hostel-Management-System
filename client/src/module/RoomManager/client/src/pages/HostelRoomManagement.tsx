import { useState, useEffect } from 'react';
import { useAdminAuth } from "../../../../HostelDashboard/client/src/hooks/useAdminAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { HostelRoom, HostelBed, HostelStudent } from '../types/hostel';
import RoomComponent from '../components/hostel/RoomComponent';
import RoomHoverDetails from '../components/hostel/RoomHoverDetails';
import BedDetailsDialog from '../components/hostel/BedDetailsDialog';
import EmptyBedDialog from '../components/hostel/EmptyBedDialog';
import Layout2 from "../../../../HostelDashboard/client/src/components/layout/Layout2";

const floors = [
  { id: -1, name: "All Floors" },
  { id: 0, name: "Ground Floor" },
  { id: 1, name: "First Floor" },
  { id: 2, name: "Second Floor" },
  { id: 3, name: "Third Floor" },
];

const HostelRoomManagement = () => {
  // HOOKS TOP PAR
  const { admin, loading } = useAdminAuth();
  const { toast } = useToast();

  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [students, setStudents] = useState<HostelStudent[]>([]);
  const [hoveredRoom, setHoveredRoom] = useState<HostelRoom | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [institutionFilter, setInstitutionFilter] = useState<string>("all");
  const [vacancyFilter, setVacancyFilter] = useState<string>("all");
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  const [selectedBed, setSelectedBed] = useState<{ room: HostelRoom, bed: HostelBed } | null>(null);
  const [showEmptyBedDialog, setShowEmptyBedDialog] = useState<boolean>(false);
  const [showOccupiedBedDialog, setShowOccupiedBedDialog] = useState<boolean>(false);

  // REDIRECT LOGIC -- DO NOT RETURN! Only side-effect here!
  useEffect(() => {
    if (!loading && !admin) {
      window.location.href = "/login";
    }
  }, [admin, loading]);

  // Get hostelName from localStorage.adminUser.adminType
  let hostelName = "Varahmihir";
  const adminUserStr = typeof window !== "undefined" ? localStorage.getItem('adminUser') : null;
  if (adminUserStr) {
    try {
      const adminUser = JSON.parse(adminUserStr);
      hostelName = adminUser.adminType || hostelName;
    } catch {}
  }

  // Fetch students from backend
  useEffect(() => {
    if (!admin || loading) return; // Do not run this effect if not allowed
    fetch('https://hostel-backend-module-production-iist.up.railway.app/api/students')
      .then(res => res.json())
      .then((data: HostelStudent[]) => {
        setStudents(data);
        const yearSet = new Set<string>();
        data.forEach(student => {
          if (student.yearOfStudy) yearSet.add(student.yearOfStudy);
        });
        setYearOptions(Array.from(yearSet).sort());
      })
      .catch(() => {
        setStudents([]);
        setYearOptions([]);
      });
  }, [admin, loading]);

  // Fetch rooms from backend (filtered by hostelName)
  const fetchRooms = () => {
    fetch(`https://hostel-backend-module-production-iist.up.railway.app/api/hostel/rooms?hostelName=${encodeURIComponent(hostelName)}`)
      .then(res => res.json())
      .then((data: HostelRoom[]) => {
        if (selectedFloor === -1) setRooms(data);
        else setRooms(data.filter((room) => room.floor === selectedFloor));
      })
      .catch(() => setRooms([]));
  };

  useEffect(() => {
    if (!admin || loading) return; // Do not run this effect if not allowed
    fetchRooms();
    // eslint-disable-next-line
  }, [selectedFloor, hostelName, admin, loading]);

  // UI render ke andar loading check aur early return
  if (loading) return <Layout2><div className="p-8">Loading...</div></Layout2>;
  if (!admin) return null;

  // Handlers
  const handleFloorChange = (value: string) => {
    setSelectedFloor(parseInt(value));
  };

  const handleBedClick = (room: HostelRoom, bed: HostelBed) => {
    setSelectedBed({ room, bed });
    if (bed.status === 'empty') {
      setShowEmptyBedDialog(true);
      setShowOccupiedBedDialog(false);
    } else if (bed.status === 'occupied') {
      setShowEmptyBedDialog(false);
      setShowOccupiedBedDialog(true);
    }
  };

  const handleAssignStudent = (studentId: number) => {
    if (!selectedBed) return;
    fetch(`https://hostel-backend-module-production-iist.up.railway.app/api/hostel/assign?bedId=${selectedBed.bed.id}&studentId=${studentId}`, { method: "POST" })
      .then(() => {
        toast({ title: "Student Assigned", description: "Student assigned to bed!" });
        fetchRooms();
      })
      .catch(() => toast({ title: "Error", description: "Failed to assign student" }));
    setSelectedBed(null);
    setShowEmptyBedDialog(false);
  };

  const handleRemoveStudent = () => {
    if (!selectedBed) return;
    fetch(`https://hostel-backend-module-production-iist.up.railway.app/api/hostel/remove-student?bedId=${selectedBed.bed.id}`, { method: "POST" })
      .then(() => {
        toast({ title: "Student Removed", description: "Removed student from bed." });
        fetchRooms();
      })
      .catch(() => toast({ title: "Error", description: "Failed to remove student" }));
    setSelectedBed(null);
    setShowOccupiedBedDialog(false);
  };

  const handleRelocateStudent = () => {
    handleRemoveStudent();
    toast({ title: "Ready to Relocate", description: "Student has been removed. Select another bed to relocate to." });
  };

  const handleAddBed = (room: HostelRoom) => {
    fetch(`https://hostel-backend-module-production-iist.up.railway.app/api/hostel/add-bed?roomId=${room.id}`, { method: "POST" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to add bed");
        return res.json();
      })
      .then(() => {
        toast({ title: "Bed Added", description: `New bed added to Room ${room.roomNo}` });
        fetchRooms();
      })
      .catch(() => toast({ title: "Error", description: "Failed to add bed" }));
  };

  const handleRemoveBed = (bedId: number) => {
    fetch(`https://hostel-backend-module-production-iist.up.railway.app/api/hostel/remove-bed?bedId=${bedId}`, { method: "POST" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to remove bed");
        return res.text();
      })
      .then(() => {
        toast({ title: "Bed Removed", description: "Bed has been removed from the room." });
        fetchRooms();
      })
      .catch(() => toast({ title: "Error", description: "Failed to remove bed" }));
  };

  // Filtering
  const filteredRooms = rooms.filter(room => {
    if (filterType !== "all" && room.type !== filterType) return false;
    if (yearFilter !== "all") {
      const hasStudentOfYear = room.beds.some(bed =>
        bed.status === 'occupied' &&
        bed.student &&
        bed.student?.yearOfStudy === yearFilter
      );
      if (!hasStudentOfYear) return false;
    }
    if (institutionFilter !== "all") {
      const hasStudentFromInstitution = room.beds.some(bed =>
        bed.status === 'occupied' &&
        bed.student &&
        bed.student.instituteName === institutionFilter
      );
      if (!hasStudentFromInstitution) return false;
    }
    if (vacancyFilter !== "all") {
      const occupiedBedCount = room.beds.filter(bed => bed.status === 'occupied').length;
      if (vacancyFilter === "vacant" && occupiedBedCount > 0) return false;
      else if (vacancyFilter === "partially" && (occupiedBedCount === 0 || occupiedBedCount === room.beds.length)) return false;
      else if (vacancyFilter === "filled" && occupiedBedCount < room.beds.length) return false;
    }
    return true;
  });

  const leftRooms = filteredRooms.slice(0, 6);
  const rightRooms = filteredRooms.slice(6, 12);

  return (
    <Layout2>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-center mb-2">
            {hostelName} Hostel Room Allocation
          </h2>
        </div>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-2">
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
                {yearOptions.map(year => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="institutionFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Institution
            </label>
            <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
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
            <Select value={vacancyFilter} onValueChange={setVacancyFilter}>
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
        {/* Reset Filters Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            className="text-gray-600 hover:text-gray-800"
            onClick={() => {
              setSelectedFloor(0);
              setFilterType("all");
              setYearFilter("all");
              setInstitutionFilter("all");
              setVacancyFilter("all");
            }}
          >
            Reset Filters
          </Button>
        </div>
        {/* Rooms display */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{floors.find(f => f.id === selectedFloor)?.name}</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column of rooms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leftRooms.map(room => (
                <div key={room.id} className="relative">
                  <RoomComponent
                    room={room}
                    onBedClick={handleBedClick}
                    onAddBed={handleAddBed}
                    onRoomHover={setHoveredRoom}
                  />
                  {hoveredRoom?.id === room.id && (
                    <RoomHoverDetails
                      room={room}
                      floorName={floors.find(f => f.id === selectedFloor)?.name || ""}
                    />
                  )}
                </div>
              ))}
              {leftRooms.length === 0 && (
                <div className="col-span-3 text-center p-4 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No rooms match your filters</p>
                </div>
              )}
            </div>
            {/* Right column of rooms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rightRooms.map(room => (
                <div key={room.id} className="relative">
                  <RoomComponent
                    room={room}
                    onBedClick={handleBedClick}
                    onAddBed={handleAddBed}
                    onRoomHover={setHoveredRoom}
                  />
                  {hoveredRoom?.id === room.id && (
                    <RoomHoverDetails
                      room={room}
                      floorName={floors.find(f => f.id === selectedFloor)?.name || ""}
                    />
                  )}
                </div>
              ))}
              {rightRooms.length === 0 && leftRooms.length > 0 && (
                <div className="col-span-3 text-center p-4 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No more rooms match your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Empty Bed Dialog */}
        {selectedBed && showEmptyBedDialog && (
          <EmptyBedDialog
            isOpen={showEmptyBedDialog}
            onClose={() => {
              setShowEmptyBedDialog(false);
              setSelectedBed(null);
            }}
            bedId={selectedBed.bed.bedId}
            students={students}
            onAssignStudent={handleAssignStudent}
            onRemoveBed={() => handleRemoveBed(selectedBed.bed.id)}
          />
        )}
        {/* Occupied Bed Dialog */}
        {selectedBed && selectedBed.bed.student && showOccupiedBedDialog && (
          <BedDetailsDialog
            isOpen={showOccupiedBedDialog}
            onClose={() => {
              setShowOccupiedBedDialog(false);
              setSelectedBed(null);
            }}
            bedId={selectedBed.bed.bedId}
            student={selectedBed.bed.student}
            onRemove={handleRemoveStudent}
            onRelocate={handleRelocateStudent}
          />
        )}
      </div>
    </Layout2>
  );
};

export default HostelRoomManagement;