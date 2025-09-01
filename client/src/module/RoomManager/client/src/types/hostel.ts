// Types for the hostel room management system based on requirements

export type Institution = "IIST" | "IIP" | "IIMR";

export interface HostelStudent {
  id: number;
  fullName: string;
  // regNo: string;
  year: string;
  course: string;
  branch: string;
  institution: Institution;
  contactNo: string;

  // ------------ Added for parent info --------------
  fatherName?: string;
  fatherMobile?: string;
  motherName?: string;
  motherMobile?: string;
  // -------------------------------------------------
}

export interface HostelBed {
  id: number;
  bedId: string; // Format: BB001A, BB001B, etc.
  roomId: number;
  status: "empty" | "occupied";
  studentId?: number;
  student?: HostelStudent;
}

export interface HostelRoom {
  id: number;
  roomNo: string; // Format: 001, 002, etc.
  floor: number;
  type: "1-Seater" | "2-Seater" | "3-Seater";
  beds: HostelBed[];
}

export interface HostelFloor {
  id: number;
  fullName: string;
  rooms: HostelRoom[];
}

export type VacancyFilter = "all" | "vacant" | "partially" | "filled";
export type YearFilter = "all" | "1st" | "2nd" | "3rd" | "4th";
export type RoomTypeFilter = "all" | "1-Seater" | "2-Seater" | "3-Seater";
export type InstitutionFilter = "all" | Institution;