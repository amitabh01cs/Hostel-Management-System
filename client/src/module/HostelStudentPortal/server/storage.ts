import { 
  users, 
  leaveRequests, 
  complaints, 
  antiRaggingReports,
  type User, 
  type InsertUser,
  type LeaveRequest,
  type InsertLeaveRequest,
  type Complaint,
  type InsertComplaint,
  type AntiRaggingReport,
  type InsertAntiRaggingReport
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Leave request operations
  createLeaveRequest(request: InsertLeaveRequest & { userId: number }): Promise<LeaveRequest>;
  getLeaveRequestsByUserId(userId: number): Promise<LeaveRequest[]>;
  
  // Complaint operations
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  getComplaintsByUserId(userId: number): Promise<Complaint[]>;
  
  // Anti-ragging report operations
  createAntiRaggingReport(report: InsertAntiRaggingReport): Promise<AntiRaggingReport>;
  getAntiRaggingReportsByUserId(userId: number): Promise<AntiRaggingReport[]>;
  
  // Password operations
  updateUserPassword(userId: number, newPassword: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private leaveRequests: Map<number, LeaveRequest>;
  private complaints: Map<number, Complaint>;
  private antiRaggingReports: Map<number, AntiRaggingReport>;
  private currentUserId: number;
  private currentLeaveId: number;
  private currentComplaintId: number;
  private currentReportId: number;

  constructor() {
    this.users = new Map();
    this.leaveRequests = new Map();
    this.complaints = new Map();
    this.antiRaggingReports = new Map();
    this.currentUserId = 1;
    this.currentLeaveId = 1;
    this.currentComplaintId = 1;
    this.currentReportId = 1;
    
    // Create a default student user
    this.createDefaultUser();
  }

  private async createDefaultUser() {
    const defaultUser: User = {
      id: 1,
      username: "student",
      password: "password123",
      name: "John Doe",
      studentId: "ST2024001",
      course: "Computer Science",
      room: "A-204",
      email: "john.doe@example.com",
      phone: "+91-9876543210"
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;
    
    // Add some sample leave requests
    this.createSampleLeaveRequests();
  }

  private createSampleLeaveRequests() {
    const sampleRequests: LeaveRequest[] = [
      {
        id: 1,
        userId: 1,
        requestId: "LR2024001",
        fromDate: "2024-01-15",
        toDate: "2024-01-20",
        days: 5,
        reason: "Family Function",
        status: "approved",
        appliedOn: "2024-01-10"
      },
      {
        id: 2,
        userId: 1,
        requestId: "LR2024002",
        fromDate: "2024-02-01",
        toDate: "2024-02-03",
        days: 2,
        reason: "Medical Appointment",
        status: "pending",
        appliedOn: "2024-01-28"
      },
      {
        id: 3,
        userId: 1,
        requestId: "LR2024003",
        fromDate: "2024-01-05",
        toDate: "2024-01-08",
        days: 3,
        reason: "Personal Work",
        status: "rejected",
        appliedOn: "2024-01-02"
      }
    ];
    
    sampleRequests.forEach(request => {
      this.leaveRequests.set(request.id, request);
    });
    this.currentLeaveId = 4;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createLeaveRequest(request: InsertLeaveRequest & { userId: number }): Promise<LeaveRequest> {
    const id = this.currentLeaveId++;
    const requestId = `LR${new Date().getFullYear()}${String(id).padStart(3, '0')}`;
    const appliedOn = new Date().toISOString().split('T')[0];
    
    const leaveRequest: LeaveRequest = {
      ...request,
      id,
      requestId,
      appliedOn,
      status: "pending"
    };
    
    this.leaveRequests.set(id, leaveRequest);
    return leaveRequest;
  }

  async getLeaveRequestsByUserId(userId: number): Promise<LeaveRequest[]> {
    return Array.from(this.leaveRequests.values()).filter(request => request.userId === userId);
  }

  async createComplaint(complaint: InsertComplaint): Promise<Complaint> {
    const id = this.currentComplaintId++;
    const complaintId = `CMP${new Date().getFullYear()}${String(id).padStart(4, '0')}`;
    const createdAt = new Date().toISOString();
    
    const newComplaint: Complaint = {
      ...complaint,
      id,
      complaintId,
      status: "pending",
      createdAt
    };
    
    this.complaints.set(id, newComplaint);
    return newComplaint;
  }

  async getComplaintsByUserId(userId: number): Promise<Complaint[]> {
    // For simplicity, return all complaints since we don't have userId in complaints table
    return Array.from(this.complaints.values());
  }

  async createAntiRaggingReport(report: InsertAntiRaggingReport): Promise<AntiRaggingReport> {
    const id = this.currentReportId++;
    const reportId = `AR${new Date().getFullYear()}${String(id).padStart(4, '0')}`;
    const createdAt = new Date().toISOString();
    
    const newReport: AntiRaggingReport = {
      ...report,
      id,
      reportId,
      status: "pending",
      createdAt
    };
    
    this.antiRaggingReports.set(id, newReport);
    return newReport;
  }

  async getAntiRaggingReportsByUserId(userId: number): Promise<AntiRaggingReport[]> {
    // For simplicity, return all reports since we don't have userId in reports table
    return Array.from(this.antiRaggingReports.values());
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (user) {
      user.password = newPassword;
      this.users.set(userId, user);
      return true;
    }
    return false;
  }
}

export const storage = new MemStorage();
