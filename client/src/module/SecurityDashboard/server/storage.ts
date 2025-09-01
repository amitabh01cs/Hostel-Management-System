import { students, activityLogs, type Student, type InsertStudent, type ActivityLog, type InsertActivityLog } from "@shared/schema";

export interface IStorage {
  // Student operations
  getAllStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  
  // Activity log operations
  getAllActivityLogs(): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivityLogs(limit?: number): Promise<ActivityLog[]>;
}

export class MemStorage implements IStorage {
  private students: Map<number, Student>;
  private activityLogs: Map<number, ActivityLog>;
  private currentStudentId: number;
  private currentLogId: number;

  constructor() {
    this.students = new Map();
    this.activityLogs = new Map();
    this.currentStudentId = 1;
    this.currentLogId = 1;
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    const demoStudents: InsertStudent[] = [
      {
        name: "Kartavya Agrawal",
        course: "CSE 1st",
        passNumber: "XXXX24052025",
        passType: "hourly",
        reason: "Haircut",
        destination: "Indore",
        status: "active",
        photoUrl: "/attached_assets/profile1.jpeg",
      },
      {
        name: "Nikhil Jha",
        course: "ECE 2nd",
        passNumber: "XXXX24052026",
        passType: "days",
        reason: "Medical Appointment",
        destination: "Bhopal",
        status: "active",
        photoUrl: "/attached_assets/profile2.jpeg",
      },
      {
        name: "Harshit Choudhary",
        course: "ME 3rd",
        passNumber: "XXXX24052027",
        passType: "hourly",
        reason: "Shopping",
        destination: "City Mall",
        status: "active",
        photoUrl: "/attached_assets/profile1.jpeg",
      },
      {
        name: "Ashwani Tiwari",
        course: "EE 2nd",
        passNumber: "XXXX24052028",
        passType: "days",
        reason: "Family Visit",
        destination: "Jabalpur",
        status: "active",
        photoUrl: "/attached_assets/profile2.jpeg",
      },
      {
        name: "Kshitiz Bharadwaj",
        course: "CSE 3rd",
        passNumber: "XXXX24052029",
        passType: "hourly",
        reason: "Bank Work",
        destination: "SBI Branch",
        status: "active",
        photoUrl: "/attached_assets/profile1.jpeg",
      },
      {
        name: "Amitabh Ranjan",
        course: "MBA 1st",
        passNumber: "XXXX24052030",
        passType: "days",
        reason: "Interview",
        destination: "IT Park",
        status: "active",
        photoUrl: "/attached_assets/profile2.jpeg",
      },
    ];

    demoStudents.forEach(student => {
      this.createStudent(student);
    });
  }

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    const student: Student = {
      id,
      name: insertStudent.name,
      course: insertStudent.course,
      passNumber: insertStudent.passNumber,
      passType: insertStudent.passType,
      reason: insertStudent.reason,
      destination: insertStudent.destination,
      status: insertStudent.status || "active",
      photoUrl: insertStudent.photoUrl ?? null,
      checkOutTime: null,
      checkInTime: null,
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;

    const updatedStudent = { ...student, ...updates };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<boolean> {
    return this.students.delete(id);
  }

  async getAllActivityLogs(): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values());
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.currentLogId++;
    const log: ActivityLog = {
      ...insertLog,
      id,
      reason: insertLog.reason || null,
      destination: insertLog.destination || null,
      timestamp: new Date(),
    };
    this.activityLogs.set(id, log);
    return log;
  }

  async getRecentActivityLogs(limit: number = 10): Promise<ActivityLog[]> {
    const logs = Array.from(this.activityLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    return logs;
  }
}

export const storage = new MemStorage();
