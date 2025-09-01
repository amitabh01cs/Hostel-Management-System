import { users, type User, type InsertUser, gatePass, type GatePass, type InsertGatePass } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createGatePass(gatePass: InsertGatePass): Promise<GatePass>;
  getGatePass(id: number): Promise<GatePass | undefined>;
  getAllGatePasses(): Promise<GatePass[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gatePasses: Map<number, GatePass>;
  currentUserId: number;
  currentGatePassId: number;

  constructor() {
    this.users = new Map();
    this.gatePasses = new Map();
    this.currentUserId = 1;
    this.currentGatePassId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createGatePass(insertGatePass: InsertGatePass): Promise<GatePass> {
    const id = this.currentGatePassId++;
    const createdAt = new Date();
    const gatePass: GatePass = { ...insertGatePass, id, createdAt };
    this.gatePasses.set(id, gatePass);
    return gatePass;
  }

  async getGatePass(id: number): Promise<GatePass | undefined> {
    return this.gatePasses.get(id);
  }

  async getAllGatePasses(): Promise<GatePass[]> {
    return Array.from(this.gatePasses.values());
  }
}

export const storage = new MemStorage();
