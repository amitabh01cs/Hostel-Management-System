import { pgTable, text, serial, integer, boolean, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
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

// Gate Pass schema
export const gatePass = pgTable("gate_pass", {
  id: serial("id").primaryKey(),
  serialNumber: varchar("serial_number", { length: 20 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  roomNo: varchar("room_no", { length: 10 }).notNull(),
  branch: varchar("branch", { length: 50 }).notNull(),
  year: varchar("year", { length: 20 }).notNull(),
  passType: varchar("pass_type", { length: 10 }).notNull(),
  from: varchar("from_time_date", { length: 20 }).notNull(),
  to: varchar("to_time_date", { length: 20 }).notNull(),
  address: varchar("address", { length: 200 }).notNull(),
  contactNumber: varchar("contact_number", { length: 20 }).notNull(),
  purpose: varchar("purpose", { length: 200 }).notNull(),
  localGuardian: varchar("local_guardian", { length: 100 }),
  localGuardianAddress: varchar("local_guardian_address", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Gate Pass validation schema
export const gatePassSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  roomNo: z.string().regex(/^\d{3}$/, { message: "Room number must be 3 digits (e.g., 001)" }),
  branch: z.string().min(2, { message: "Branch is required" }),
  year: z.string().min(1, { message: "Year is required" }),
  from: z.string().min(1, { message: "From time/date is required" }),
  to: z.string().min(1, { message: "To time/date is required" }),
  address: z.string().min(2, { message: "Address is required" }),
  contactNumber: z.string().regex(/^\d{10}$/, { message: "Contact number must be 10 digits" }),
  purpose: z.string().min(2, { message: "Purpose is required" }),
  localGuardian: z.string().optional(),
  localGuardianAddress: z.string().optional(),
}); 

export const insertGatePassSchema = createInsertSchema(gatePass);
export type InsertGatePass = z.infer<typeof insertGatePassSchema>;
export type GatePass = typeof gatePass.$inferSelect;
