import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertStudentSchema, 
  allocationFormSchema, 
  roomUpdateSchema,
  floors
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiRouter = express.Router();
  
  // Get students
  apiRouter.get("/students", async (req: Request, res: Response) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });
  
  // Get student by ID
  apiRouter.get("/students/:id", async (req: Request, res: Response) => {
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
  
  // Create student
  apiRouter.post("/students", async (req: Request, res: Response) => {
    try {
      const parseResult = insertStudentSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid student data", 
          errors: parseResult.error.errors 
        });
      }
      
      const student = await storage.createStudent(parseResult.data);
      res.status(201).json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to create student" });
    }
  });
  
  // Get rooms by floor
  apiRouter.get("/rooms/floor/:floor", async (req: Request, res: Response) => {
    try {
      const floor = parseInt(req.params.floor);
      
      // Validate floor number
      if (isNaN(floor) || floor < 0 || floor > 3) {
        return res.status(400).json({ message: "Invalid floor number" });
      }
      
      const rooms = await storage.getRoomsByFloor(floor);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });
  
  // Get all rooms
  apiRouter.get("/rooms", async (req: Request, res: Response) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });
  
  // Get bed details
  apiRouter.get("/beds/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const bed = await storage.getBed(id);
      
      if (!bed) {
        return res.status(404).json({ message: "Bed not found" });
      }
      
      res.json(bed);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bed" });
    }
  });
  
  // Get all beds for a room
  apiRouter.get("/rooms/:roomId/beds", async (req: Request, res: Response) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const beds = await storage.getBedsByRoom(roomId);
      res.json(beds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch beds" });
    }
  });
  
  // Allocate a bed to a student
  apiRouter.post("/allocations", async (req: Request, res: Response) => {
    try {
      const parseResult = allocationFormSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid allocation data", 
          errors: parseResult.error.errors 
        });
      }
      
      const { studentId, roomId, bedId } = parseResult.data;
      
      // Verify the student exists
      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // Verify the room exists
      const room = await storage.getRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      // Verify the bed exists and is available
      const bed = await storage.getBed(bedId);
      if (!bed) {
        return res.status(404).json({ message: "Bed not found" });
      }
      
      if (bed.status === "occupied") {
        return res.status(400).json({ message: "Bed is already occupied" });
      }
      
      // Create the allocation
      const allocation = await storage.createAllocation({
        studentId,
        roomId,
        bedId,
        allocatedOn: new Date().toISOString(),
      });
      
      res.status(201).json(allocation);
    } catch (error) {
      res.status(500).json({ message: "Failed to allocate bed" });
    }
  });
  
  // Update room type and capacity
  apiRouter.patch("/rooms/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify the room exists
      const room = await storage.getRoom(id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      const updateData = { ...req.body, id };
      const parseResult = roomUpdateSchema.safeParse(updateData);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid room update data", 
          errors: parseResult.error.errors 
        });
      }
      
      const updatedRoom = await storage.updateRoomType(parseResult.data);
      res.json(updatedRoom);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update room" });
    }
  });
  
  // Get room statistics by type
  apiRouter.get("/stats/rooms", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getRoomStatisticsByType();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room statistics" });
    }
  });
  
  // Get floors
  apiRouter.get("/floors", async (_req: Request, res: Response) => {
    try {
      res.json(floors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch floors" });
    }
  });
  
  // Mount API routes
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
