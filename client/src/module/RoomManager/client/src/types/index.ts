export interface Student {
  id: number;
  fullName: string;
  // regNo: string;
  year_of_study: string;
  course: string;
  gender: string;
  contactNo: string;
  email: string;
}

export interface Room {
  id: number;
  roomNo: string;
  floor: number;
  type: string;
  capacity: number;
}

export interface Bed {
  id: number;
  bedNo: string;
  roomId: number;
  status: string;
  studentId: number | null;
}

export interface BedWithStudent extends Bed {
  student?: Student;
}

export interface RoomWithBeds extends Room {
  beds: Bed[];
}

export interface RoomWithBedsAndStudents extends Room {
  beds: BedWithStudent[];
}

export interface Allocation {
  id: number;
  studentId: number;
  roomId: number;
  bedId: number;
  allocatedOn: string;
}

export interface Floor {
  id: number;
  name: string;
}

export interface RoomTypeStats {
  type: string;
  available: number;
  occupied: number;
  total: number;
}

export interface ConfirmationData {
  student: Student;
  room: Room;
  bed: Bed;
  roommates: Student[];
  floorName: string;
}

export interface PrintableFormData {
  id: string;
  date: string;
  student: Student;
  room: Room;
  bed: Bed;
  roommates: { name: string; regNo: string; course: string; bedNo: string }[];
  allocation: Allocation;
  block: string;
  floorName: string;
}
