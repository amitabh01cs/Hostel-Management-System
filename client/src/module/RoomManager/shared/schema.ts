import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Room Configuration Schema
export const roomTypes = ["1-Seater", "2-Seater", "3-Seater"] as const;
export type RoomType = typeof roomTypes[number];

export const bedStatus = ["available", "occupied"] as const;
export type BedStatus = typeof bedStatus[number];

// Institution types
export const institutions = ["IIST", "IIP", "IIMR"] as const;
export type Institution = typeof institutions[number];

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  regNo: text("reg_no").notNull().unique(),
  year: text("year").notNull(),
  course: text("course").notNull(),
  branch: text("branch").notNull(),
  gender: text("gender").notNull(),
  contactNo: text("contact_no").notNull(),
  email: text("email").notNull(),
  institution: text("institution").notNull(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  roomNo: text("room_no").notNull().unique(),
  floor: integer("floor").notNull(),
  type: text("type").notNull(),
  capacity: integer("capacity").notNull(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
});

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

export const beds = pgTable("beds", {
  id: serial("id").primaryKey(),
  bedNo: text("bed_no").notNull(),
  roomId: integer("room_id").notNull(),
  status: text("status").notNull(),
  studentId: integer("student_id"),
});

export const insertBedSchema = createInsertSchema(beds).omit({
  id: true,
});

export type InsertBed = z.infer<typeof insertBedSchema>;
export type Bed = typeof beds.$inferSelect;

export const allocations = pgTable("allocations", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  roomId: integer("room_id").notNull(),
  bedId: integer("bed_id").notNull(),
  allocatedOn: text("allocated_on").notNull(),
});

export const insertAllocationSchema = createInsertSchema(allocations).omit({
  id: true,
});

export type InsertAllocation = z.infer<typeof insertAllocationSchema>;
export type Allocation = typeof allocations.$inferSelect;

// Response type for room with beds
export type RoomWithBeds = Room & {
  beds: Bed[];
};

// Response type for bed with student
export type BedWithStudent = Bed & {
  student?: Student;
};

// Response type for room with beds and students
export type RoomWithBedsAndStudents = Room & {
  beds: BedWithStudent[];
};

// Form data for allocation
export const allocationFormSchema = z.object({
  studentId: z.number(),
  roomId: z.number(),
  bedId: z.number(),
});

export type AllocationFormData = z.infer<typeof allocationFormSchema>;

// Room update form
export const roomUpdateSchema = z.object({
  id: z.number(),
  type: z.enum(roomTypes),
  capacity: z.number().min(1).max(3),
});

export type RoomUpdateData = z.infer<typeof roomUpdateSchema>;

// Floor data
export const floors = [
  { id: 0, name: "Ground Floor" },
  { id: 1, name: "First Floor" },
  { id: 2, name: "Second Floor" },
  { id: 3, name: "Third Floor" },
];
