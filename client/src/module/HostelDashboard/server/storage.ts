import { 
  users, 
  courses, 
  rooms, 
  students, 
  attendances, 
  leaveRequests, 
  complaints, 
  accessLogs,
  type User, 
  type InsertUser,
  type Course,
  type InsertCourse,
  type Room,
  type InsertRoom,
  type Student,
  type InsertStudent,
  type Attendance,
  type InsertAttendance,
  type LeaveRequest,
  type InsertLeaveRequest,
  type Complaint,
  type InsertComplaint,
  type AccessLog,
  type InsertAccessLog
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean>;

  // Course operations
  getAllCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: InsertCourse): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;

  // Room operations
  getAllRooms(floor?: number, status?: string): Promise<Room[]>;
  getRoom(id: number): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: number, room: InsertRoom): Promise<Room | undefined>;

  // Student operations
  getAllStudents(courseId?: number, roomId?: number): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: InsertStudent): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;

  // Attendance operations
  getAttendanceByDate(date: string, courseId?: number): Promise<any[]>;
  createBulkAttendance(date: string, attendanceRecords: any[]): Promise<any>;

  // Leave request operations
  getAllLeaveRequests(status?: string): Promise<any[]>;
  createLeaveRequest(leaveRequest: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequestStatus(id: number, status: string, approvedBy: number): Promise<LeaveRequest | undefined>;

  // Complaint operations
  getAllComplaints(status?: string): Promise<any[]>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaintStatus(id: number, status: string, assignedTo?: number, notes?: string, resolvedDate?: string): Promise<Complaint | undefined>;

  // Access log operations
  createAccessLog(log: Partial<InsertAccessLog>): Promise<AccessLog>;
  updateAccessLogOnLogout(userId: number): Promise<boolean>;
  getAccessLogs(date?: string, userId?: number): Promise<any[]>;
  clearAccessLogs(): Promise<void>;

  // Dashboard statistics
  getDashboardStats(): Promise<any>;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private coursesData: Map<number, Course>;
  private roomsData: Map<number, Room>;
  private studentsData: Map<number, Student>;
  private attendancesData: Map<number, Attendance>;
  private leaveRequestsData: Map<number, LeaveRequest>;
  private complaintsData: Map<number, Complaint>;
  private accessLogsData: Map<number, AccessLog>;
  
  private userId: number = 1;
  private courseId: number = 1;
  private roomId: number = 1;
  private studentId: number = 1;
  private attendanceId: number = 1;
  private leaveRequestId: number = 1;
  private complaintId: number = 1;
  private accessLogId: number = 1;

  constructor() {
    this.usersData = new Map();
    this.coursesData = new Map();
    this.roomsData = new Map();
    this.studentsData = new Map();
    this.attendancesData = new Map();
    this.leaveRequestsData = new Map();
    this.complaintsData = new Map();
    this.accessLogsData = new Map();
    
    // Initialize with an admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@hostel.edu",
      userType: "admin"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.usersData.set(id, user);
    return user;
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.getUser(userId);
    
    if (!user || user.password !== currentPassword) {
      return false;
    }
    
    user.password = newPassword;
    this.usersData.set(userId, user);
    return true;
  }

  // Course operations
  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.coursesData.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.coursesData.get(id);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.courseId++;
    const newCourse: Course = { ...course, id };
    this.coursesData.set(id, newCourse);
    return newCourse;
  }

  async updateCourse(id: number, course: InsertCourse): Promise<Course | undefined> {
    if (!this.coursesData.has(id)) {
      return undefined;
    }
    
    const existingCourse = this.coursesData.get(id)!;
    const updatedCourse: Course = { ...existingCourse, ...course };
    this.coursesData.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<boolean> {
    if (!this.coursesData.has(id)) {
      return false;
    }
    
    // Check if there are students in this course
    const studentsInCourse = Array.from(this.studentsData.values()).some(
      (student) => student.courseId === id
    );
    
    if (studentsInCourse) {
      throw new Error("Cannot delete course with enrolled students");
    }
    
    return this.coursesData.delete(id);
  }

  // Room operations
  async getAllRooms(floor?: number, status?: string): Promise<Room[]> {
    let rooms = Array.from(this.roomsData.values());
    
    if (floor !== undefined) {
      rooms = rooms.filter(room => room.floor === floor);
    }
    
    if (status) {
      rooms = rooms.filter(room => room.status === status);
    }
    
    return rooms;
  }

  async getRoom(id: number): Promise<Room | undefined> {
    return this.roomsData.get(id);
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const id = this.roomId++;
    const newRoom: Room = { ...room, id };
    this.roomsData.set(id, newRoom);
    return newRoom;
  }

  async updateRoom(id: number, room: InsertRoom): Promise<Room | undefined> {
    if (!this.roomsData.has(id)) {
      return undefined;
    }
    
    const existingRoom = this.roomsData.get(id)!;
    const updatedRoom: Room = { ...existingRoom, ...room };
    this.roomsData.set(id, updatedRoom);
    return updatedRoom;
  }

  // Student operations
  async getAllStudents(courseId?: number, roomId?: number): Promise<Student[]> {
    let students = Array.from(this.studentsData.values());
    
    if (courseId !== undefined) {
      students = students.filter(student => student.courseId === courseId);
    }
    
    if (roomId !== undefined) {
      students = students.filter(student => student.roomId === roomId);
    }
    
    return students;
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.studentsData.get(id);
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const id = this.studentId++;
    const newStudent: Student = { ...student, id };
    
    // Update room occupancy
    const room = await this.getRoom(student.roomId);
    if (room) {
      room.occupied += 1;
      
      // Update room status if it becomes full
      if (room.occupied >= room.capacity) {
        room.status = "full";
      } else if (room.occupied > 0) {
        room.status = "partially occupied";
      }
      
      this.roomsData.set(room.id, room);
    }
    
    this.studentsData.set(id, newStudent);
    return newStudent;
  }

  async updateStudent(id: number, student: InsertStudent): Promise<Student | undefined> {
    if (!this.studentsData.has(id)) {
      return undefined;
    }
    
    const existingStudent = this.studentsData.get(id)!;
    
    // Handle room change if applicable
    if (existingStudent.roomId !== student.roomId) {
      // Decrease occupancy in old room
      const oldRoom = await this.getRoom(existingStudent.roomId);
      if (oldRoom) {
        oldRoom.occupied = Math.max(0, oldRoom.occupied - 1);
        
        // Update old room status
        if (oldRoom.occupied === 0) {
          oldRoom.status = "available";
        } else if (oldRoom.occupied < oldRoom.capacity) {
          oldRoom.status = "partially occupied";
        }
        
        this.roomsData.set(oldRoom.id, oldRoom);
      }
      
      // Increase occupancy in new room
      const newRoom = await this.getRoom(student.roomId);
      if (newRoom) {
        newRoom.occupied += 1;
        
        // Update new room status
        if (newRoom.occupied >= newRoom.capacity) {
          newRoom.status = "full";
        } else {
          newRoom.status = "partially occupied";
        }
        
        this.roomsData.set(newRoom.id, newRoom);
      }
    }
    
    const updatedStudent: Student = { ...existingStudent, ...student };
    this.studentsData.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<boolean> {
    if (!this.studentsData.has(id)) {
      return false;
    }
    
    const student = this.studentsData.get(id)!;
    
    // Update room occupancy
    const room = await this.getRoom(student.roomId);
    if (room) {
      room.occupied = Math.max(0, room.occupied - 1);
      
      // Update room status
      if (room.occupied === 0) {
        room.status = "available";
      } else if (room.occupied < room.capacity) {
        room.status = "partially occupied";
      }
      
      this.roomsData.set(room.id, room);
    }
    
    return this.studentsData.delete(id);
  }

  // Attendance operations
  async getAttendanceByDate(date: string, courseId?: number): Promise<any[]> {
    // Get all attendances for the given date
    const attendances = Array.from(this.attendancesData.values()).filter(
      (attendance) => attendance.date.toString() === date
    );
    
    // If courseId is provided, filter students by course
    const studentIds = courseId 
      ? Array.from(this.studentsData.values())
          .filter(student => student.courseId === courseId)
          .map(student => student.id)
      : Array.from(this.studentsData.keys());
    
    // For each student, get their attendance status or return null
    return studentIds.map(studentId => {
      const student = this.studentsData.get(studentId);
      const attendance = attendances.find(a => a.studentId === studentId);
      
      if (!student) return null;
      
      const course = this.coursesData.get(student.courseId);
      const room = this.roomsData.get(student.roomId);
      
      return {
        studentId,
        name: student.name,
        registrationNumber: student.registrationNumber,
        course: course?.name || '',
        roomNumber: room?.roomNumber || '',
        attendance: attendance?.status || null,
        notes: attendance?.notes || ''
      };
    }).filter(Boolean);
  }

  async createBulkAttendance(date: string, attendanceRecords: any[]): Promise<any> {
    const results = [];
    
    for (const record of attendanceRecords) {
      const { studentId, status, notes } = record;
      
      // Check if attendance already exists for this student on this date
      const existingAttendance = Array.from(this.attendancesData.values()).find(
        (a) => a.studentId === studentId && a.date.toString() === date
      );
      
      if (existingAttendance) {
        // Update existing attendance
        existingAttendance.status = status;
        existingAttendance.notes = notes || existingAttendance.notes;
        this.attendancesData.set(existingAttendance.id, existingAttendance);
        results.push(existingAttendance);
      } else {
        // Create new attendance
        const id = this.attendanceId++;
        const newAttendance: Attendance = {
          id,
          studentId,
          date: new Date(date),
          status,
          notes: notes || ''
        };
        
        this.attendancesData.set(id, newAttendance);
        results.push(newAttendance);
      }
    }
    
    return results;
  }

  // Leave request operations
  async getAllLeaveRequests(status?: string): Promise<any[]> {
    let requests = Array.from(this.leaveRequestsData.values());
    
    if (status) {
      requests = requests.filter(request => request.status === status);
    }
    
    // Enrich with student information
    return requests.map(request => {
      const student = this.studentsData.get(request.studentId);
      const course = student ? this.coursesData.get(student.courseId) : undefined;
      
      return {
        ...request,
        studentName: student?.name || '',
        registrationNumber: student?.registrationNumber || '',
        stream: course?.name || '',
      };
    });
  }

  async createLeaveRequest(leaveRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const id = this.leaveRequestId++;
    const createdAt = new Date();
    const newLeaveRequest: LeaveRequest = { ...leaveRequest, id, createdAt };
    this.leaveRequestsData.set(id, newLeaveRequest);
    return newLeaveRequest;
  }

  async updateLeaveRequestStatus(id: number, status: string, approvedBy: number): Promise<LeaveRequest | undefined> {
    if (!this.leaveRequestsData.has(id)) {
      return undefined;
    }
    
    const leaveRequest = this.leaveRequestsData.get(id)!;
    leaveRequest.status = status;
    leaveRequest.approvedBy = approvedBy;
    
    this.leaveRequestsData.set(id, leaveRequest);
    return leaveRequest;
  }

  // Complaint operations
  async getAllComplaints(status?: string): Promise<any[]> {
    let complaints = Array.from(this.complaintsData.values());
    
    if (status) {
      complaints = complaints.filter(complaint => complaint.status === status);
    }
    
    // Enrich with student information
    return complaints.map(complaint => {
      const student = this.studentsData.get(complaint.studentId);
      const course = student ? this.coursesData.get(student.courseId) : undefined;
      
      return {
        ...complaint,
        name: student?.name || '',
        class: course?.name || '',
        contact: student?.contactNumber || '',
        email: student?.email || '',
      };
    });
  }

  async createComplaint(complaint: InsertComplaint): Promise<Complaint> {
    const id = this.complaintId++;
    const newComplaint: Complaint = { ...complaint, id };
    this.complaintsData.set(id, newComplaint);
    return newComplaint;
  }

  async updateComplaintStatus(
    id: number, 
    status: string, 
    assignedTo?: number, 
    notes?: string, 
    resolvedDate?: string
  ): Promise<Complaint | undefined> {
    if (!this.complaintsData.has(id)) {
      return undefined;
    }
    
    const complaint = this.complaintsData.get(id)!;
    complaint.status = status;
    
    if (assignedTo !== undefined) {
      complaint.assignedTo = assignedTo;
    }
    
    if (notes) {
      complaint.notes = notes;
    }
    
    if (resolvedDate && (status === "resolved" || status === "closed")) {
      complaint.resolvedDate = new Date(resolvedDate);
    }
    
    this.complaintsData.set(id, complaint);
    return complaint;
  }

  // Access log operations
  async createAccessLog(log: Partial<InsertAccessLog>): Promise<AccessLog> {
    const id = this.accessLogId++;
    const loginTime = log.loginTime || new Date();
    const newLog: AccessLog = {
      id,
      userId: log.userId!,
      ipAddress: log.ipAddress || '',
      loginTime,
      logoutTime: log.logoutTime || null,
      status: log.status!,
      userAgent: log.userAgent || ''
    };
    
    this.accessLogsData.set(id, newLog);
    return newLog;
  }

  async updateAccessLogOnLogout(userId: number): Promise<boolean> {
    // Find active sessions for this user
    const activeLogs = Array.from(this.accessLogsData.values()).filter(
      log => log.userId === userId && log.status === "active" && !log.logoutTime
    );
    
    if (activeLogs.length === 0) {
      return false;
    }
    
    // Update all active logs with logout time
    const now = new Date();
    for (const log of activeLogs) {
      log.logoutTime = now;
      log.status = "success";
      this.accessLogsData.set(log.id, log);
    }
    
    return true;
  }

  async getAccessLogs(date?: string, userId?: number): Promise<any[]> {
    let logs = Array.from(this.accessLogsData.values());
    
    if (date) {
      const targetDate = new Date(date);
      logs = logs.filter(log => {
        const logDate = new Date(log.loginTime);
        return logDate.getFullYear() === targetDate.getFullYear() &&
               logDate.getMonth() === targetDate.getMonth() &&
               logDate.getDate() === targetDate.getDate();
      });
    }
    
    if (userId !== undefined) {
      logs = logs.filter(log => log.userId === userId);
    }
    
    // Add user information
    return logs.map(log => {
      const user = this.usersData.get(log.userId);
      return {
        ...log,
        userEmail: user?.email || '',
        username: user?.username || '',
        userType: user?.userType || ''
      };
    });
  }

  async clearAccessLogs(): Promise<void> {
    this.accessLogsData.clear();
    this.accessLogId = 1;
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<any> {
    const totalStudents = this.studentsData.size;
    const totalRooms = this.roomsData.size;
    const totalCourses = this.coursesData.size;
    
    // Calculate floor statistics
    const floors = [1, 2, 3, 4];
    const floorStats = floors.map(floor => {
      const roomsOnFloor = Array.from(this.roomsData.values()).filter(
        room => room.floor === floor
      );
      
      const totalRoomsOnFloor = roomsOnFloor.length;
      const occupiedRoomsOnFloor = roomsOnFloor.filter(
        room => room.occupied > 0
      ).length;
      
      const availableRoomsOnFloor = roomsOnFloor.filter(
        room => room.occupied < room.capacity
      ).length;
      
      return {
        floor: `Floor ${floor}`,
        rooms: totalRoomsOnFloor,
        occupied: occupiedRoomsOnFloor,
        available: availableRoomsOnFloor,
        occupancyRate: totalRoomsOnFloor > 0 
          ? Math.round((occupiedRoomsOnFloor / totalRoomsOnFloor) * 100) 
          : 0
      };
    });
    
    // Get recent activity
    const now = new Date();
    const recentActivity = [
      // Check for new students
      ...Array.from(this.studentsData.values())
        .filter(student => {
          if (!student.joiningDate) return false;
          const joinDate = new Date(student.joiningDate);
          const diffDays = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        })
        .map(student => ({
          type: 'student_registered',
          title: 'New student registered',
          timestamp: student.joiningDate,
          details: `${student.name} (${student.registrationNumber})`
        })),
      
      // Check for leave requests
      ...Array.from(this.leaveRequestsData.values())
        .filter(request => {
          const createdAt = new Date(request.createdAt);
          const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        })
        .map(request => {
          const student = this.studentsData.get(request.studentId);
          return {
            type: `leave_request_${request.status.toLowerCase()}`,
            title: `Leave request ${request.status.toLowerCase()}`,
            timestamp: request.createdAt,
            details: `${student?.name || 'Student'} (${student?.registrationNumber || ''})`
          };
        }),
      
      // Check for new complaints
      ...Array.from(this.complaintsData.values())
        .filter(complaint => {
          const issueDate = new Date(complaint.issueDate);
          const diffDays = Math.floor((now.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        })
        .map(complaint => {
          const student = this.studentsData.get(complaint.studentId);
          return {
            type: 'new_complaint',
            title: 'New complaint submitted',
            timestamp: complaint.issueDate,
            details: `${complaint.topic} by ${student?.name || 'Student'}`
          };
        })
    ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
    
    // Course wise distribution
    const courseWiseDistribution = Array.from(this.coursesData.values()).map(course => {
      const studentsInCourse = Array.from(this.studentsData.values()).filter(
        student => student.courseId === course.id
      ).length;
      
      return {
        name: course.name,
        students: studentsInCourse
      };
    });
    
    return {
      totalStudents,
      totalRooms,
      totalCourses,
      floorStats,
      recentActivity,
      courseWiseDistribution
    };
  }
}

export const storage = new MemStorage();
