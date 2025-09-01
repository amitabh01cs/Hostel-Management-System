import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  userType: text("user_type").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  userType: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Courses Table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  duration: integer("duration").notNull(), // in years
  description: text("description"),
  status: text("status").default("active"),
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  name: true,
  code: true,
  duration: true,
  description: true,
  status: true,
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Rooms Table
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  roomNumber: text("room_number").notNull().unique(),
  floor: integer("floor").notNull(),
  type: text("type").notNull(), // e.g., "3-seater"
  capacity: integer("capacity").notNull(),
  occupied: integer("occupied").default(0),
  status: text("status").default("available"),
  description: text("description"),
  wifi: boolean("wifi").default(false),
  ac: boolean("ac").default(false),
  attachedToilet: boolean("attached_toilet").default(false),
  balcony: boolean("balcony").default(false),
});

export const insertRoomSchema = createInsertSchema(rooms).pick({
  roomNumber: true,
  floor: true,
  type: true,
  capacity: true,
  occupied: true,
  status: true,
  description: true,
  wifi: true,
  ac: true,
  attachedToilet: true,
  balcony: true,
});

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

// Students Table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  registrationNumber: text("registration_number").notNull().unique(),
  courseId: integer("course_id").notNull(),
  roomId: integer("room_id").notNull(),
  email: text("email"),
  contactNumber: text("contact_number"),
  year: integer("year"), // Current year of study
  joiningDate: date("joining_date"),
  address: text("address"),
  guardianName: text("guardian_name"),
  guardianContact: text("guardian_contact"),
  status: text("status").default("active"),
});

export const insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  registrationNumber: true,
  courseId: true,
  roomId: true,
  email: true,
  contactNumber: true,
  year: true,
  joiningDate: true,
  address: true,
  guardianName: true,
  guardianContact: true,
  status: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Attendance Table
export const attendances = pgTable("attendances", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  date: date("date").notNull(),
  status: text("status").notNull(), // "present" or "absent"
  notes: text("notes"),
});

export const insertAttendanceSchema = createInsertSchema(attendances).pick({
  studentId: true,
  date: true,
  status: true,
  notes: true,
});

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendances.$inferSelect;

// Leave Requests Table
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  permissionType: text("permission_type").notNull(),
  reason: text("reason").notNull(),
  leaveDate: timestamp("leave_date").notNull(),
  returnDate: timestamp("return_date").notNull(),
  placeOfVisit: text("place_of_visit"),
  contactNumber: text("contact_number"),
  status: text("status").default("pending"), // "pending", "approved", "rejected"
  approvedBy: integer("approved_by"), // User ID who approved/rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).pick({
  studentId: true,
  permissionType: true,
  reason: true,
  leaveDate: true,
  returnDate: true,
  placeOfVisit: true,
  contactNumber: true,
  status: true,
});

export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;

// Complaints Table
export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  topic: text("topic").notNull(),
  description: text("description").notNull(),
  issueDate: date("issue_date").defaultNow(),
  status: text("status").default("new"), // "new", "in progress", "resolved", "closed"
  assignedTo: integer("assigned_to"), // User ID of staff assigned to handle
  resolvedDate: date("resolved_date"),
  notes: text("notes"),
});

export const insertComplaintSchema = createInsertSchema(complaints).pick({
  studentId: true,
  topic: true,
  description: true,
  issueDate: true,
  status: true,
  assignedTo: true,
  resolvedDate: true,
  notes: true,
});

export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaints.$inferSelect;

// User Access Logs Table
export const accessLogs = pgTable("access_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  ipAddress: text("ip_address"),
  loginTime: timestamp("login_time").defaultNow(),
  logoutTime: timestamp("logout_time"),
  status: text("status").notNull(), // "success", "failed", "active"
  userAgent: text("user_agent"),
});

export const insertAccessLogSchema = createInsertSchema(accessLogs).pick({
  userId: true,
  ipAddress: true,
  loginTime: true,
  logoutTime: true,
  status: true,
  userAgent: true,
});

export type InsertAccessLog = z.infer<typeof insertAccessLogSchema>;
export type AccessLog = typeof accessLogs.$inferSelect;
