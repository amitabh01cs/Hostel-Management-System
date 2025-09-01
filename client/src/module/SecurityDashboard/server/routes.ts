import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema, insertActivityLogSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all active students (excluding completed ones)
  app.get("/api/students", async (req, res) => {
    try {
      const allStudents = await storage.getAllStudents();
      const activeStudents = allStudents.filter(s => s.status !== "completed");
      res.json(activeStudents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  // Get completed students for logs
  app.get("/api/students/completed", async (req, res) => {
    try {
      const allStudents = await storage.getAllStudents();
      const completedStudents = allStudents.filter(s => s.status === "completed");
      res.json(completedStudents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch completed students" });
    }
  });

  // Get student by ID
  app.get("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.getStudent(id);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  // Create new student
  app.post("/api/students", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid student data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  // Check out student
  app.post("/api/students/:id/checkout", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.getStudent(id);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      if (student.status === "out") {
        return res.status(400).json({ message: "Student is already checked out" });
      }

      const updatedStudent = await storage.updateStudent(id, {
        status: "out",
        checkOutTime: new Date(),
      });

      // Create activity log
      await storage.createActivityLog({
        studentId: id,
        studentName: student.name,
        action: "checkout",
        reason: student.reason,
        destination: student.destination,
      });

      res.json(updatedStudent);
    } catch (error) {
      res.status(500).json({ message: "Failed to check out student" });
    }
  });

  // Check in student
  app.post("/api/students/:id/checkin", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.getStudent(id);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      if (student.status === "active") {
        return res.status(400).json({ message: "Student is already checked in" });
      }

      const updatedStudent = await storage.updateStudent(id, {
        status: "completed",
        checkInTime: new Date(),
      });

      // Create activity log
      await storage.createActivityLog({
        studentId: id,
        studentName: student.name,
        action: "checkin",
        reason: student.reason,
        destination: student.destination,
      });

      res.json(updatedStudent);
    } catch (error) {
      res.status(500).json({ message: "Failed to check in student" });
    }
  });

  // Get activity logs
  app.get("/api/activity-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const logs = await storage.getRecentActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Get statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      const stats = {
        total: students.filter(s => s.status !== "completed").length,
        checkedOut: students.filter(s => s.status === "out").length,
        onCampus: students.filter(s => s.status === "active").length,
        hourlyPasses: students.filter(s => s.passType === "hourly" && s.status !== "completed").length,
        daysPasses: students.filter(s => s.passType === "days" && s.status !== "completed").length,
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
