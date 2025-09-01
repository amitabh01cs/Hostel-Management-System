import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Users, Bed, Maximize } from "lucide-react";
import { RoomTypeStats } from "@/types";

const Dashboard = () => {
  const { toast } = useToast();
  const [roomStats, setRoomStats] = useState<RoomTypeStats[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [studentCount, setStudentCount] = useState<number>(0);
  
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
        
        // Fetch student count
        const studentsResponse = await fetch('/api/students');
        if (!studentsResponse.ok) {
          throw new Error('Failed to fetch students');
        }
        const studentsData = await studentsResponse.json();
        setStudentCount(studentsData.length);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Calculate summary statistics
  const totalRooms = roomStats.reduce((sum, stat) => sum + stat.total / parseInt(stat.type[0]), 0);
  const totalBeds = roomStats.reduce((sum, stat) => sum + stat.total, 0);
  const occupiedBeds = roomStats.reduce((sum, stat) => sum + stat.occupied, 0);
  const availableBeds = roomStats.reduce((sum, stat) => sum + stat.available, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Hostel Management Dashboard</h1>
        <Link href="/room-allocation">
          <Button className="bg-primary text-white hover:bg-blue-700">
            Allocate Room
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid place-items-center h-64">
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentCount}</div>
                <p className="text-xs text-muted-foreground">
                  {occupiedBeds} allocated, {studentCount - occupiedBeds} unallocated
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRooms}</div>
                <p className="text-xs text-muted-foreground">
                  Across 4 floors
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Available Beds</CardTitle>
                <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableBeds}</div>
                <p className="text-xs text-muted-foreground">
                  Out of {totalBeds} total beds
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                <Maximize className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{occupancyRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {occupiedBeds} out of {totalBeds} beds occupied
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Room Type Summary */}
          <h2 className="text-xl font-semibold mb-4">Room Type Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {roomStats.map((stat) => (
              <Card key={stat.type}>
                <CardHeader>
                  <CardTitle>{stat.type} Rooms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Available:</span>
                      <span className="font-medium text-green-600">{stat.available}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Occupied:</span>
                      <span className="font-medium text-red-600">{stat.occupied}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total:</span>
                      <span className="font-medium">{stat.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(stat.occupied / stat.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-right text-gray-500">
                      {Math.round((stat.occupied / stat.total) * 100)}% occupied
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Quick Actions */}
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/room-allocation">
              <Button variant="outline" className="w-full justify-start p-4 h-auto">
                <div className="flex flex-col items-start">
                  <span className="text-lg font-medium">Room Allocation</span>
                  <span className="text-sm text-gray-500">Allocate rooms to students</span>
                </div>
              </Button>
            </Link>
            
            <Link href="/manage-rooms">
              <Button variant="outline" className="w-full justify-start p-4 h-auto">
                <div className="flex flex-col items-start">
                  <span className="text-lg font-medium">Manage Rooms</span>
                  <span className="text-sm text-gray-500">Update room configurations</span>
                </div>
              </Button>
            </Link>
            
            <Link href="/manage-students">
              <Button variant="outline" className="w-full justify-start p-4 h-auto">
                <div className="flex flex-col items-start">
                  <span className="text-lg font-medium">Manage Students</span>
                  <span className="text-sm text-gray-500">Add or update student details</span>
                </div>
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
