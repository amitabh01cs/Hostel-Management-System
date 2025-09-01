import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  course: text("course").notNull(),
  passNumber: text("pass_number").notNull().unique(),
  passType: text("pass_type").notNull(), // "hourly" or "days"
  reason: text("reason").notNull(),
  destination: text("destination").notNull(),
  status: text("status").notNull().default("active"), // "active", "out", or "completed"
  photoUrl: text("photo_url"),
  checkOutTime: timestamp("check_out_time"),
  checkInTime: timestamp("check_in_time"),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  studentName: text("student_name").notNull(),
  action: text("action").notNull(), // "checkout" or "checkin"
  reason: text("reason"),
  destination: text("destination"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  checkOutTime: true,
  checkInTime: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
