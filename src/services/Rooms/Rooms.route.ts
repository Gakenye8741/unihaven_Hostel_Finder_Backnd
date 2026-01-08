import { Router } from "express";
import { 
  addRoom, 
  listHostelRooms, 
  updateRoom, 
  removeRoom, 
  setRoomStatus, 
  getRoomStats 
} from "./Rooms.controller";
import { 
  managementAuth, 
  allAuth 
} from "../../middleware/AuthBearer";

const RoomRouter = Router();

// ========================== PUBLIC / AUTHENTICATED ROUTES ==========================

/**
 * LIST: Students and all users can view the rooms within a specific hostel.
 * Using 'allAuth' ensures they are logged in to browse.
 */
RoomRouter.get("/list/:hostelId", allAuth, listHostelRooms);

// ========================== MANAGEMENT ROUTES ==========================

/**
 * CREATE: Owners, Caretakers, and Admins can add new rooms.
 */
RoomRouter.post("/", managementAuth, addRoom);

/**
 * STATUS TOGGLE: Allows manual override to 'Occupied', 'Available', or 'Maintenance'.
 * Crucial for Caretakers managing daily check-ins/check-outs.
 */
RoomRouter.patch("/status/:id", managementAuth, setRoomStatus);

/**
 * STATS: Provides an overview of total vs. occupied slots for a hostel.
 */
RoomRouter.get("/stats/:hostelId", managementAuth, getRoomStats);

/**
 * UPDATE: Modify room details (labels, types, pricing).
 * Note: Includes :hostelId for extra security validation in the service.
 */
RoomRouter.patch("/update/:hostelId/:id", managementAuth, updateRoom);

/**
 * DELETE: Permanently remove a room from a hostel's inventory.
 */
RoomRouter.delete("/delete/:hostelId/:id", managementAuth, removeRoom);

export default RoomRouter;