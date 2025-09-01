import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  studentId: text("student_id").notNull().unique(),
  course: text("course").notNull(),
  room: text("room").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
});

export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  requestId: text("request_id").notNull().unique(),
  fromDate: text("from_date").notNull(),
  toDate: text("to_date").notNull(),
  days: integer("days").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull(), // pending, approved, rejected, cancelled
  appliedOn: text("applied_on").notNull(),
});

export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  complaintId: text("complaint_id").notNull().unique(),
  name: text("name").notNull(),
  course: text("course").notNull(),
  contact: text("contact").notNull(),
  email: text("email").notNull(),
  issueDate: text("issue_date").notNull(),
  topic: text("topic").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
});

export const antiRaggingReports = pgTable("anti_ragging_reports", {
  id: serial("id").primaryKey(),
  reportId: text("report_id").notNull().unique(),
  reporterName: text("reporter_name"),
  contact: text("contact"),
  description: text("description").notNull(),
  photoFiles: text("photo_files").array(),
  videoFiles: text("video_files").array(),
  textFiles: text("text_files").array(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  requestId: true,
  appliedOn: true,
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  complaintId: true,
  status: true,
  createdAt: true,
});

export const insertAntiRaggingReportSchema = createInsertSchema(antiRaggingReports).omit({
  id: true,
  reportId: true,
  status: true,
  createdAt: true,
}); 

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type AntiRaggingReport = typeof antiRaggingReports.$inferSelect;
export type InsertAntiRaggingReport = z.infer<typeof insertAntiRaggingReportSchema>;
