import db from "../../drizzle/db";
import { rooms, TSelectRoom, TInsertRoom } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

// ==========================================
// 1. CREATE ROOM
// ==========================================
export const createRoomService = async (data: TInsertRoom): Promise<TSelectRoom> => {
  // Ensure occupiedSlots starts at 0 if not provided
  const roomData = {
    ...data,
    occupiedSlots: data.occupiedSlots || 0,
  };
  const [newRoom] = await db.insert(rooms).values(roomData).returning();
  return newRoom;
};

// ==========================================
// 2. GET HOSTEL INVENTORY (Detailed)
// ==========================================
/**
 * Fetches all rooms for a hostel, grouped logically by Block and Floor.
 */
export const getRoomsByHostelService = async (hostelId: string): Promise<TSelectRoom[]> => {
  return await db
    .select()
    .from(rooms)
    .where(eq(rooms.hostelId, hostelId))
    .orderBy(rooms.block, rooms.floor, rooms.label);
};

// ==========================================
// 3. GET AVAILABLE ROOMS ONLY
// ==========================================
/**
 * Filters for rooms that are marked 'Available' AND have at least one slot left.
 */
export const getAvailableRoomsService = async (hostelId: string): Promise<TSelectRoom[]> => {
  return await db
    .select()
    .from(rooms)
    .where(
      and(
        eq(rooms.hostelId, hostelId),
        eq(rooms.status, "Available"),
        sql`${rooms.occupiedSlots} < ${rooms.totalSlots}`
      )
    );
};

// ==========================================
// 4. UPDATE ROOM DETAILS
// ==========================================
export const updateRoomService = async (id: string, hostelId: string, data: Partial<TInsertRoom>): Promise<TSelectRoom | undefined> => {
  const [updated] = await db
    .update(rooms)
    .set(data)
    .where(and(eq(rooms.id, id), eq(rooms.hostelId, hostelId)))
    .returning();
  return updated;
};

// ==========================================
// 5. UPDATE ROOM OCCUPANCY (Booking Logic)
// ==========================================
/**
 * Automatically updates slots and adjusts status (Available/Full).
 */
export const updateRoomSlotsService = async (roomId: string, action: "increment" | "decrement"): Promise<TSelectRoom> => {
  const adjustment = action === "increment" ? 1 : -1;

  const [updated] = await db
    .update(rooms)
    .set({
      occupiedSlots: sql`${rooms.occupiedSlots} + ${adjustment}`,
    })
    .where(eq(rooms.id, roomId))
    .returning();

  if (!updated) throw new Error("Room not found");

  // Null check for TS safety
  const currentOccupied = updated.occupiedSlots ?? 0;
  
  let newStatus: "Available" | "Full" | "Maintenance" = "Available";
  if (currentOccupied >= updated.totalSlots) {
    newStatus = "Full";
  }

  const [finalRoom] = await db.update(rooms)
    .set({ status: newStatus })
    .where(eq(rooms.id, roomId))
    .returning();

  return finalRoom;
};

// ==========================================
// 6. ROOM STATISTICS (Dashboard View)
// ==========================================
export const getHostelRoomStatsService = async (hostelId: string) => {
  const stats = await db
    .select({
      totalCapacity: sql<number>`sum(${rooms.totalSlots})`,
      totalOccupied: sql<number>`sum(${rooms.occupiedSlots})`,
      roomCount: sql<number>`count(${rooms.id})`,
    })
    .from(rooms)
    .where(eq(rooms.hostelId, hostelId));

  return stats[0];
};

// ==========================================
// 7. DELETE ROOM
// ==========================================
export const deleteRoomService = async (id: string, hostelId: string): Promise<TSelectRoom | undefined> => {
  const [deleted] = await db
    .delete(rooms)
    .where(and(eq(rooms.id, id), eq(rooms.hostelId, hostelId)))
    .returning();
  return deleted;
};

// ==========================================
// 8. STATUS OVERRIDES (Manual Toggles)
// ==========================================

// Mark as Occupied (Full)
export const markRoomAsOccupiedService = async (roomId: string): Promise<TSelectRoom | undefined> => {
  const [updated] = await db
    .update(rooms)
    .set({ status: "Full" })
    .where(eq(rooms.id, roomId))
    .returning();
  return updated;
};

// Mark as Not Occupied (Available)
export const markRoomAsAvailableService = async (roomId: string): Promise<TSelectRoom | undefined> => {
  const [updated] = await db
    .update(rooms)
    .set({ status: "Available" })
    .where(eq(rooms.id, roomId))
    .returning();
  return updated;
};

// Mark as Under Maintenance
export const markRoomAsMaintenanceService = async (roomId: string): Promise<TSelectRoom | undefined> => {
  const [updated] = await db
    .update(rooms)
    .set({ status: "Maintenance" })
    .where(eq(rooms.id, roomId))
    .returning();
  return updated;
};