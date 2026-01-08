import { RequestHandler } from "express";
import {
  createRoomService,
  getRoomsByHostelService,
  updateRoomService,
  deleteRoomService,
  markRoomAsOccupiedService,
  markRoomAsAvailableService,
  markRoomAsMaintenanceService,
  getHostelRoomStatsService,
} from "./Rooms.service";
import { createRoomSchema, updateRoomSchema, updateRoomStatusSchema } from "../../validators/Room.validator";

// --------------------------- 1. ADD ROOM ---------------------------
export const addRoom: RequestHandler = async (req, res) => {
  try {
    const parseResult = createRoomSchema.safeParse({ body: req.body });
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return;
    }

    const newRoom = await createRoomService(parseResult.data.body);
    res.status(201).json({ message: "Room created successfully 🏢", data: newRoom });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to add room" });
  }
};

// --------------------------- 2. LIST HOSTEL ROOMS ---------------------------
export const listHostelRooms: RequestHandler = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const rooms = await getRoomsByHostelService(hostelId);
    res.status(200).json(rooms);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 3. UPDATE ROOM ---------------------------
export const updateRoom: RequestHandler = async (req, res) => {
  try {
    const { id, hostelId } = req.params;

    const parseResult = updateRoomSchema.safeParse({ params: req.params, body: req.body });
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return;
    }

    const updatedRoom = await updateRoomService(id, hostelId, parseResult.data.body);
    if (!updatedRoom) {
      res.status(404).json({ error: "Room not found or unauthorized to update. ❌" });
      return;
    }

    res.status(200).json({ message: "Room updated successfully ✅", data: updatedRoom });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 4. SET ROOM STATUS ---------------------------
/**
 * Handles manual toggles for Occupied, Available, or Maintenance
 */
export const setRoomStatus: RequestHandler = async (req, res) => {
  try {
    const parseResult = updateRoomStatusSchema.safeParse({ params: req.params, body: req.body });
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    let updated;
    if (status === "Full") updated = await markRoomAsOccupiedService(id);
    else if (status === "Available") updated = await markRoomAsAvailableService(id);
    else if (status === "Maintenance") updated = await markRoomAsMaintenanceService(id);

    if (!updated) {
      res.status(404).json({ error: "Room not found. 🔍" });
      return;
    }

    res.status(200).json({ message: `Room marked as ${status} 🔄`, data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 5. GET ROOM STATS ---------------------------
export const getRoomStats: RequestHandler = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const stats = await getHostelRoomStatsService(hostelId);
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 6. DELETE ROOM ---------------------------
export const removeRoom: RequestHandler = async (req, res) => {
  try {
    const { id, hostelId } = req.params;
    const deleted = await deleteRoomService(id, hostelId);

    if (!deleted) {
      res.status(404).json({ error: "Room not found. 🔍" });
      return;
    }

    res.status(200).json({ message: "Room deleted successfully 🗑️" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};