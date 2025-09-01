import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Student, Floor } from "@/types";
import StudentInfo from "@/components/StudentInfo";
import RoomLayout from "@/components/RoomLayout";
import DemoRoomModal from "@/components/modals/DemoRoomModal";
import demoRoomImg from "@assets/demo_room_img.jpeg";


// Sample student data
const sampleStudents: Student[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    regNo: "H25001",
    year: "1st Year",
    course: "B.Tech Computer Science",
    gender: "Male",
    contactNo: "+91 9876543210",
    email: "rahul.s@example.com",
  },
  {
    id: 2,
    name: "Amit Kumar",
    regNo: "H25002",
    year: "1st Year",
    course: "B.Tech CS",
    gender: "Male",
    contactNo: "+91 9876543211",
    email: "amit.k@example.com",
  },
  {
    id: 3,
    name: "Priya Patel",
    regNo: "H25003",
    year: "2nd Year",
    course: "B.Tech Electronics",
    gender: "Female",
    contactNo: "+91 9876543213",
    email: "priya.p@example.com",
  },
  {
    id: 4,
    name: "Sunita Gupta",
    regNo: "H25004",
    year: "3rd Year",
    course: "B.Tech Mechanical",
    gender: "Female",
    contactNo: "+91 9876543214",
    email: "sunita.g@example.com",
  },
  {
    id: 5,
    name: "Vijay Singh",
    regNo: "H25005",
    year: "1st Year",
    course: "B.Tech CS",
    gender: "Male",
    contactNo: "+91 9876543212",
    email: "vijay.s@example.com",
  }
];


// Sample floor data
const sampleFloors: Floor[] = [
  { id: 0, name: "Ground Floor" },
  { id: 1, name: "First Floor" },
  { id: 2, name: "Second Floor" },
  { id: 3, name: "Third Floor" },
];


const RoomAllocation = () => {
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [floors, setFloors] = useState<Floor[]>(sampleFloors);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDemoRoom, setShowDemoRoom] = useState<boolean>(false);


  useEffect(() => {
    // Set sample student
    setStudent(sampleStudents[0]);
  }, []);


  // Function to handle student selection (will be used later with database)
  const handleStudentSelect = (selectedStudent: Student) => {
    setStudent(selectedStudent);
  };


  if (!student) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading student data...</p>
      </div>
    );
  }


  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Boys Hostel Room Allocation</h1>
     
      <StudentInfo student={student} />
     
      <RoomLayout
        floors={floors}
        student={student}
        onShowDemoRoom={() => setShowDemoRoom(true)}
        allStudents={sampleStudents}
      />
     
      <DemoRoomModal
        isOpen={showDemoRoom}
        onClose={() => setShowDemoRoom(false)}
        demoRoomImg={demoRoomImg}
      />
    </div>
  );
};


export default RoomAllocation;




