import { 
  users, type User, type InsertUser,
  students, type Student, type InsertStudent,
  rooms, type Room, type InsertRoom,
  beds, type Bed, type InsertBed,
  allocations, type Allocation, type InsertAllocation,
  type RoomWithBeds, type BedWithStudent, type RoomWithBedsAndStudents,
  type RoomUpdateData, floors
} from "@shared/schema";

// Interface for storage CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Student operations
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByRegNo(regNo: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  
  // Room operations
  getRooms(): Promise<Room[]>;
  getRoomsByFloor(floor: number): Promise<RoomWithBedsAndStudents[]>;
  getRoom(id: number): Promise<Room | undefined>;
  getRoomByNumber(roomNo: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoomType(roomUpdateData: RoomUpdateData): Promise<Room>;
  
  // Bed operations
  getBeds(): Promise<Bed[]>;
  getBed(id: number): Promise<BedWithStudent | undefined>;
  getBedsByRoom(roomId: number): Promise<BedWithStudent[]>;
  createBed(bed: InsertBed): Promise<Bed>;
  updateBedStatus(bedId: number, status: string, studentId?: number): Promise<Bed>;
  
  // Allocation operations
  getAllocations(): Promise<Allocation[]>;
  getAllocation(id: number): Promise<Allocation | undefined>;
  createAllocation(allocation: InsertAllocation): Promise<Allocation>;
  
  // Summary operations
  getRoomStatisticsByType(): Promise<{type: string, available: number, occupied: number, total: number}[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private rooms: Map<number, Room>;
  private beds: Map<number, Bed>;
  private allocations: Map<number, Allocation>;
  
  private userCurrentId: number;
  private studentCurrentId: number;
  private roomCurrentId: number;
  private bedCurrentId: number;
  private allocationCurrentId: number;
  
  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.rooms = new Map();
    this.beds = new Map();
    this.allocations = new Map();
    
    this.userCurrentId = 1;
    this.studentCurrentId = 1;
    this.roomCurrentId = 1;
    this.bedCurrentId = 1;
    this.allocationCurrentId = 1;
    
    // Initialize with some demo data
    this.initializeDemoData();
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
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }
  
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }
  
  async getStudentByRegNo(regNo: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.regNo === regNo,
    );
  }
  
  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.studentCurrentId++;
    const student: Student = { ...insertStudent, id };
    this.students.set(id, student);
    return student;
  }
  
  async getRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }
  
  async getRoomsByFloor(floor: number): Promise<RoomWithBedsAndStudents[]> {
    const roomsOnFloor = Array.from(this.rooms.values()).filter(
      (room) => room.floor === floor,
    );
    
    return Promise.all(
      roomsOnFloor.map(async (room) => {
        const bedsInRoom = await this.getBedsByRoom(room.id);
        return {
          ...room,
          beds: bedsInRoom,
        };
      })
    );
  }
  
  async getRoom(id: number): Promise<Room | undefined> {
    return this.rooms.get(id);
  }
  
  async getRoomByNumber(roomNo: string): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find(
      (room) => room.roomNo === roomNo,
    );
  }
  
  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = this.roomCurrentId++;
    const room: Room = { ...insertRoom, id };
    this.rooms.set(id, room);
    
    // Create beds for this room
    for (let i = 1; i <= room.capacity; i++) {
      await this.createBed({
        bedNo: i.toString(),
        roomId: room.id,
        status: "available",
        studentId: null,
      });
    }
    
    return room;
  }
  
  async updateRoomType(roomUpdateData: RoomUpdateData): Promise<Room> {
    const room = await this.getRoom(roomUpdateData.id);
    if (!room) {
      throw new Error(`Room with ID ${roomUpdateData.id} not found`);
    }
    
    // Update room type and capacity
    const updatedRoom: Room = {
      ...room,
      type: roomUpdateData.type,
      capacity: roomUpdateData.capacity,
    };
    this.rooms.set(room.id, updatedRoom);
    
    // Get existing beds
    const existingBeds = Array.from(this.beds.values()).filter(
      (bed) => bed.roomId === room.id,
    );
    
    // If capacity increased, add more beds
    if (roomUpdateData.capacity > existingBeds.length) {
      for (let i = existingBeds.length + 1; i <= roomUpdateData.capacity; i++) {
        await this.createBed({
          bedNo: i.toString(),
          roomId: room.id,
          status: "available",
          studentId: null,
        });
      }
    }
    // If capacity decreased, remove beds (only if they're available)
    else if (roomUpdateData.capacity < existingBeds.length) {
      // Sort beds by bed number
      const sortedBeds = existingBeds.sort((a, b) => 
        parseInt(a.bedNo) - parseInt(b.bedNo)
      );
      
      // Remove excess beds (starting from the highest bed number)
      for (let i = sortedBeds.length - 1; i >= roomUpdateData.capacity; i--) {
        const bed = sortedBeds[i];
        if (bed.status === "occupied") {
          throw new Error("Cannot reduce room capacity when beds are occupied");
        }
        // Remove the bed
        this.beds.delete(bed.id);
      }
    }
    
    return updatedRoom;
  }
  
  async getBeds(): Promise<Bed[]> {
    return Array.from(this.beds.values());
  }
  
  async getBed(id: number): Promise<BedWithStudent | undefined> {
    const bed = this.beds.get(id);
    if (!bed) return undefined;
    
    const student = bed.studentId ? await this.getStudent(bed.studentId) : undefined;
    return {
      ...bed,
      student,
    };
  }
  
  async getBedsByRoom(roomId: number): Promise<BedWithStudent[]> {
    const bedsInRoom = Array.from(this.beds.values()).filter(
      (bed) => bed.roomId === roomId,
    );
    
    // Sort beds by bed number
    bedsInRoom.sort((a, b) => parseInt(a.bedNo) - parseInt(b.bedNo));
    
    const bedsWithStudents = await Promise.all(
      bedsInRoom.map(async (bed) => {
        const student = bed.studentId ? await this.getStudent(bed.studentId) : undefined;
        return {
          ...bed,
          student,
        };
      })
    );
    
    return bedsWithStudents;
  }
  
  async createBed(insertBed: InsertBed): Promise<Bed> {
    const id = this.bedCurrentId++;
    const bed: Bed = { ...insertBed, id };
    this.beds.set(id, bed);
    return bed;
  }
  
  async updateBedStatus(bedId: number, status: string, studentId?: number): Promise<Bed> {
    const bed = this.beds.get(bedId);
    if (!bed) {
      throw new Error(`Bed with ID ${bedId} not found`);
    }
    
    const updatedBed: Bed = {
      ...bed,
      status,
      studentId: studentId || null,
    };
    this.beds.set(bedId, updatedBed);
    return updatedBed;
  }
  
  async getAllocations(): Promise<Allocation[]> {
    return Array.from(this.allocations.values());
  }
  
  async getAllocation(id: number): Promise<Allocation | undefined> {
    return this.allocations.get(id);
  }
  
  async createAllocation(insertAllocation: InsertAllocation): Promise<Allocation> {
    const id = this.allocationCurrentId++;
    const allocation: Allocation = { ...insertAllocation, id };
    this.allocations.set(id, allocation);
    
    // Update bed status to occupied
    await this.updateBedStatus(allocation.bedId, "occupied", allocation.studentId);
    
    return allocation;
  }
  
  async getRoomStatisticsByType(): Promise<{ type: string, available: number, occupied: number, total: number }[]> {
    const roomTypes = ["1-Seater", "2-Seater", "3-Seater"];
    const result = [];
    
    for (const type of roomTypes) {
      const roomsOfType = Array.from(this.rooms.values()).filter(room => room.type === type);
      let availableBeds = 0;
      let occupiedBeds = 0;
      
      for (const room of roomsOfType) {
        const bedsInRoom = Array.from(this.beds.values()).filter(bed => bed.roomId === room.id);
        for (const bed of bedsInRoom) {
          if (bed.status === "available") {
            availableBeds++;
          } else {
            occupiedBeds++;
          }
        }
      }
      
      result.push({
        type,
        available: availableBeds,
        occupied: occupiedBeds,
        total: availableBeds + occupiedBeds,
      });
    }
    
    return result;
  }
  
  // Initialize demo data
  private async initializeDemoData() {
    // Create admin user
    await this.createUser({
      username: "admin",
      password: "password",
    });
    
    // Create sample students
    const students = [
      {
        name: "Vishal Kamdar",
        regNo: "S02023045",
        year: "3rd Year",
        course: "B.Tech Computer Science",
        gender: "Male",
        contactNo: "+91 9476543210",
        email: "rahul.s@example.com",
      },
      {
        name: "Rahul Sharma",
        regNo: "ST2023045",
        year: "1st Year",
        course: "B.Tech Computer Science",
        gender: "Male",
        contactNo: "+91 9876543210",
        email: "rahul.s@example.com",
      },
      {
        name: "Amit Kumar",
        regNo: "ST2023038",
        year: "1st Year",
        course: "B.Tech CS",
        gender: "Male",
        contactNo: "+91 9876543211",
        email: "amit.k@example.com",
      },
      {
        name: "Vijay Singh",
        regNo: "ST2023042",
        year: "1st Year",
        course: "B.Tech CS",
        gender: "Male",
        contactNo: "+91 9876543212",
        email: "vijay.s@example.com",
      },
      {
        name: "Priya Patel",
        regNo: "ST2023050",
        year: "2nd Year",
        course: "B.Tech Electronics",
        gender: "Female",
        contactNo: "+91 9876543213",
        email: "priya.p@example.com",
      },
      {
        name: "Sunita Gupta",
        regNo: "ST2023055",
        year: "3rd Year",
        course: "B.Tech Mechanical",
        gender: "Female",
        contactNo: "+91 9876543214",
        email: "sunita.g@example.com",
      },
    ];
    
    for (const student of students) {
      await this.createStudent(student);
    }
    
    // Create rooms for each floor
    for (let floor = 0; floor < 4; floor++) {
      // Generate room numbers (001-012 for floor 0, 101-112 for floor 1, etc.)
      for (let roomIdx = 1; roomIdx <= 12; roomIdx++) {
        const roomNo = `${floor}${roomIdx.toString().padStart(2, "0")}`;
        
        // Determine room type
        let type = "3-Seater";
        let capacity = 3;
        
        // Make some rooms 1-seater and 2-seater for variety
        if (roomIdx >= 11) {
          type = "1-Seater";
          capacity = 1;
        } else if (roomIdx >= 9) {
          type = "2-Seater";
          capacity = 2;
        }
        
        await this.createRoom({
          roomNo,
          floor,
          type,
          capacity,
        });
      }
    }
    
    // Allocate some students to rooms (ground floor)
    const roomIds = [...this.rooms.values()]
      .filter(room => room.floor === 0)
      .map(room => room.id);
    
    if (roomIds.length > 0) {
      const student1 = await this.getStudentByRegNo("ST2023038");
      const student2 = await this.getStudentByRegNo("ST2023042");
      
      if (student1 && student2 && roomIds[0]) {
        const room = await this.getRoom(roomIds[0]);
        if (room) {
          const beds = await this.getBedsByRoom(room.id);
          
          if (beds.length >= 2) {
            // Allocate student1 to first bed
            await this.createAllocation({
              studentId: student1.id,
              roomId: room.id,
              bedId: beds[0].id,
              allocatedOn: new Date().toISOString(),
            });
            
            // Allocate student2 to second bed
            await this.createAllocation({
              studentId: student2.id,
              roomId: room.id,
              bedId: beds[1].id,
              allocatedOn: new Date().toISOString(),
            });
          }
        }
      }
    }
  }
}

export const storage = new MemStorage();
