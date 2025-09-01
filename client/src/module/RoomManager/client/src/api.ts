// api.ts
const BASE_URL = "http://localhost:8085/api";

// HOSTEL ROOMS
export async function fetchRooms() {
  const res = await fetch(`${BASE_URL}/hostel/rooms`);
  if (!res.ok) throw new Error("Failed to fetch rooms");
  return await res.json();
}

export async function fetchBedsInRoom(roomId: number) {
  const res = await fetch(`${BASE_URL}/hostel/beds/${roomId}`);
  if (!res.ok) throw new Error("Failed to fetch beds");
  return await res.json();
}

export async function fetchAllocations() {
  const res = await fetch(`${BASE_URL}/hostel/allocations`);
  if (!res.ok) throw new Error("Failed to fetch allocations");
  return await res.json();
}

export async function allocateBed(studentId: number, roomId: number, bedId: number) {
  const params = new URLSearchParams({ studentId: studentId + "", roomId: roomId + "", bedId: bedId + "" });
  const res = await fetch(`${BASE_URL}/hostel/allocate?${params.toString()}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to allocate bed");
  return await res.json();
}

export async function removeAllocation(allocationId: number) {
  const res = await fetch(`${BASE_URL}/hostel/remove/${allocationId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove allocation");
}

export async function relocateAllocation(allocationId: number, newRoomId: number, newBedId: number) {
  const params = new URLSearchParams({ newRoomId: newRoomId + "", newBedId: newBedId + "" });
  const res = await fetch(`${BASE_URL}/hostel/relocate/${allocationId}?${params.toString()}`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Failed to relocate allocation");
  return await res.json();
}

// STUDENT APIs
export async function addStudent(student: any) {
  const res = await fetch(`${BASE_URL}/student/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });
  if (!res.ok) throw new Error("Failed to add student");
  return await res.text();
}

export async function fetchAllStudents() {
  const res = await fetch(`${BASE_URL}/student/all`);
  if (!res.ok) throw new Error("Failed to fetch students");
  return await res.json();
}

export async function updateStudent(id: number, updatedStudent: any) {
  const res = await fetch(`${BASE_URL}/student/update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedStudent),
  });
  if (!res.ok) throw new Error("Failed to update student");
  return await res.text();
}

export async function deleteStudent(id: number) {
  const res = await fetch(`${BASE_URL}/student/delete/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete student");
  return await res.text();
}