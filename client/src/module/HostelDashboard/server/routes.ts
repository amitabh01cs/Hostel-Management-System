import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCourseSchema, 
  insertRoomSchema, 
  insertStudentSchema,
  insertAttendanceSchema,
  insertLeaveRequestSchema,
  insertComplaintSchema,
  insertAccessLogSchema 
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Custom error handler for validation errors
const handleValidationError = (err: unknown, res: Response) => {
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);
    return res.status(400).json({ message: validationError.message });
  }
  return res.status(500).json({ message: "Internal server error" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Authentication endpoints
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create access log
      await storage.createAccessLog({
        userId: user.id,
        ipAddress: req.ip || "",
        status: "success",
        userAgent: req.headers["user-agent"] || "",
      });
      
      return res.status(200).json({ 
        message: "Login successful",
        user: { id: user.id, username: user.username, userType: user.userType }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Update access log with logout time
      await storage.updateAccessLogOnLogout(userId);
      
      return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/change-password", async (req: Request, res: Response) => {
    try {
      const { userId, currentPassword, newPassword } = req.body;
      
      if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "User ID, current password, and new password are required" });
      }
      
      const result = await storage.changePassword(userId, currentPassword, newPassword);
      
      if (!result) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Course management endpoints
  app.get("/api/courses", async (req: Request, res: Response) => {
    try {
      const courses = await storage.getAllCourses();
      return res.status(200).json(courses);
    } catch (error) {
      console.error("Get courses error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/courses", async (req: Request, res: Response) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      return res.status(201).json(course);
    } catch (error) {
      return handleValidationError(error, res);
    }
  });

  app.get("/api/courses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourse(id);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      return res.status(200).json(course);
    } catch (error) {
      console.error("Get course error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/courses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const courseData = insertCourseSchema.parse(req.body);
      
      const updated = await storage.updateCourse(id, courseData);
      
      if (!updated) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      return res.status(200).json(updated);
    } catch (error) {
      return handleValidationError(error, res);
    }
  });

  app.delete("/api/courses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCourse(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      return res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Delete course error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Room management endpoints
  app.get("/api/rooms", async (req: Request, res: Response) => {
    try {
      const floor = req.query.floor ? parseInt(req.query.floor as string) : undefined;
      const status = req.query.status as string | undefined;
      
      const rooms = await storage.getAllRooms(floor, status);
      return res.status(200).json(rooms);
    } catch (error) {
      console.error("Get rooms error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/rooms", async (req: Request, res: Response) => {
    try {
      const roomData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(roomData);
      return res.status(201).json(room);
    } catch (error) {
      return handleValidationError(error, res);
    }
  });

  app.get("/api/rooms/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const room = await storage.getRoom(id);
      
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      return res.status(200).json(room);
    } catch (error) {
      console.error("Get room error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/rooms/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const roomData = insertRoomSchema.parse(req.body);
      
      const updated = await storage.updateRoom(id, roomData);
      
      if (!updated) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      return res.status(200).json(updated);
    } catch (error) {
      return handleValidationError(error, res);
    }
  });

  // Student management endpoints
  app.get("/api/students", async (req: Request, res: Response) => {
    try {
      const courseId = req.query.courseId ? parseInt(req.query.courseId as string) : undefined;
      const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
      
      const students = await storage.getAllStudents(courseId, roomId);
      return res.status(200).json(students);
    } catch (error) {
      console.error("Get students error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/students", async (req: Request, res: Response) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      return res.status(201).json(student);
    } catch (error) {
      return handleValidationError(error, res);
    }
  });

  app.get("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.getStudent(id);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      return res.status(200).json(student);
    } catch (error) {
      console.error("Get student error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const studentData = insertStudentSchema.parse(req.body);
      
      const updated = await storage.updateStudent(id, studentData);
      
      if (!updated) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      return res.status(200).json(updated);
    } catch (error) {
      return handleValidationError(error, res);
    }
  });

  app.delete("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteStudent(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      return res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
      console.error("Delete student error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Attendance management endpoints
  app.get("/api/attendance", async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string;
      const courseId = req.query.courseId ? parseInt(req.query.courseId as string) : undefined;
      
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      const attendance = await storage.getAttendanceByDate(date, courseId);
      return res.status(200).json(attendance);
    } catch (error) {
      console.error("Get attendance error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/attendance", async (req: Request, res: Response) => {
    try {
      // Handle bulk attendance submission
      const { date, attendanceRecords } = req.body;
      
      if (!date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
        return res.status(400).json({ message: "Date and attendance records array are required" });
      }
      
      const schema = z.array(z.object({
        studentId: z.number(),
        status: z.enum(["present", "absent"]),
        notes: z.string().optional()
      }));
      
      const validatedRecords = schema.parse(attendanceRecords);
      
      // Process each attendance record
      const results = await storage.createBulkAttendance(date, validatedRecords);
      
      return res.status(201).json({ message: "Attendance recorded successfully", results });
    } catch (error) {
      return handleValidationError(error, res);
    }
  });

  // Leave request endpoints
  app.get("/api/leave-requests", async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const leaveRequests = await storage.getAllLeaveRequests(status);
      return res.status(200).json(leaveRequests);
    } catch (error) {
      console.error("Get leave requests error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/leave-requests", async (req: Request, res: Response) => {
    try {
      const leaveRequestData = insertLeaveRequestSchema.parse(req.body);
      const leaveRequest = await storage.createLeaveRequest(leaveRequestData);
      return res.status(201).json(leaveRequest);
    } catch (error) {
      return handleValidationError(error, res);
    }
  });

  app.put("/api/leave-requests/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status, approvedBy } = req.body;
      
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Valid status is required" });
      }
      
      if (!approvedBy) {
        return res.status(400).json({ message: "Approved by user ID is required" });
      }
      
      const updated = await storage.updateLeaveRequestStatus(id, status, approvedBy);
      
      if (!updated) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      
      return res.status(200).json(updated);
    } catch (error) {
      console.error("Update leave request error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Complaints endpoints
  app.get("/api/complaints", async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const complaints = await storage.getAllComplaints(status);
      return res.status(200).json(complaints);
    } catch (error) {
      console.error("Get complaints error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/complaints", async (req: Request, res: Response) => {
    try {
      const complaintData = insertComplaintSchema.parse(req.body);
      const complaint = await storage.createComplaint(complaintData);
      return res.status(201).json(complaint);
    } catch (error) {
      return handleValidationError(error, res);
    }
  });

  app.put("/api/complaints/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status, assignedTo, notes, resolvedDate } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updated = await storage.updateComplaintStatus(id, status, assignedTo, notes, resolvedDate);
      
      if (!updated) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      
      return res.status(200).json(updated);
    } catch (error) {
      console.error("Update complaint error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Access logs endpoints
  app.get("/api/access-logs", async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string | undefined;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      const logs = await storage.getAccessLogs(date, userId);
      return res.status(200).json(logs);
    } catch (error) {
      console.error("Get access logs error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/access-logs", async (req: Request, res: Response) => {
    try {
      await storage.clearAccessLogs();
      return res.status(200).json({ message: "Access logs cleared successfully" });
    } catch (error) {
      console.error("Clear access logs error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard statistics endpoint
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
