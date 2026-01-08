import { z } from "zod";

// --- Enums matching your DB Schema ---
const RoomTypeEnum = z.enum(["Single", "Bedsitter", "One Bedroom", "Two Bedroom"]);
const BillingCycleEnum = z.enum(["Per Month", "Per Semester"]);
const RoomStatusEnum = z.enum(["Available", "Full", "Maintenance"]);

// --- Base Room Schema ---
export const roomSchema = z.object({
  id: z.string().uuid().optional(),
  hostelId: z.string().uuid({ message: "A valid Hostel ID is required" }),
  label: z.string().min(1, "Room label is required (e.g., Room 101)").max(50),
  floor: z.string().max(20).optional().nullable(),
  block: z.string().max(50).optional().nullable(),
  type: RoomTypeEnum,
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Price must be a valid positive number",
  }),
  billingCycle: BillingCycleEnum.default("Per Semester"),
  totalSlots: z.number().int().min(1, "At least 1 slot is required"),
  occupiedSlots: z.number().int().min(0).default(0),
  status: RoomStatusEnum.default("Available"),
});

// ==========================================
// Specialized Schemas for Routes
// ==========================================

// 1. Create Room (Omits ID and OccupiedSlots)
export const createRoomSchema = z.object({
  body: roomSchema.omit({ 
    id: true, 
    occupiedSlots: true 
  }),
});

// 2. Update Room (Makes all fields optional)
export const updateRoomSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    hostelId: z.string().uuid(),
  }),
  body: roomSchema.partial().omit({ 
    id: true, 
    hostelId: true 
  }),
});

// 3. Status Toggle (For manual Occupied/Maintenance updates)
export const updateRoomStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: RoomStatusEnum,
  }),
});

// 4. Room Params (For simple GET/DELETE)
export const roomParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    hostelId: z.string().uuid().optional(),
  }),
});