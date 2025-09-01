import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertComplaintSchema, insertAntiRaggingReportSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, you'd use sessions/JWT here
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user (mock session)
  app.get("/api/auth/me", async (req, res) => {
    try {
      // For demo purposes, always return the default user
      const user = await storage.getUser(1);
      if (user) {
        res.json({ ...user, password: undefined });
      } else {
        res.status(401).json({ message: "Not authenticated" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get leave requests for current user
  app.get("/api/leave-requests", async (req, res) => {
    try {
      // For demo purposes, use user ID 1
      const requests = await storage.getLeaveRequestsByUserId(1);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submit complaint
  app.post("/api/complaints", async (req, res) => {
    try {
      const validatedData = insertComplaintSchema.parse(req.body);
      const complaint = await storage.createComplaint(validatedData);
      res.json(complaint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Submit anti-ragging report
  app.post("/api/anti-ragging", async (req, res) => {
    try {
      const validatedData = insertAntiRaggingReportSchema.parse(req.body);
      const report = await storage.createAntiRaggingReport(validatedData);
      res.json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Change password
  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // For demo purposes, use user ID 1
      const user = await storage.getUser(1);
      if (!user || user.password !== currentPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      const success = await storage.updateUserPassword(1, newPassword);
      if (success) {
        res.json({ message: "Password updated successfully" });
      } else {
        res.status(500).json({ message: "Failed to update password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
