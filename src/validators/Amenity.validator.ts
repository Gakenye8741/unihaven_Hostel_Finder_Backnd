import { z } from "zod";

// ==========================================
// 1. GLOBAL AMENITY VALIDATION
// ==========================================

export const createAmenitySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Amenity name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),
    icon: z
      .string()
      .max(50, "Icon name is too long")
      .optional()
      .nullable(),
  }),
});

export const updateAmenitySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Amenity ID format"),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    icon: z.string().max(50).optional().nullable(),
  }),
});

// ==========================================
// 2. HOSTEL AMENITY ASSOCIATION VALIDATION
// ==========================================

export const syncHostelAmenitiesSchema = z.object({
  params: z.object({
    hostelId: z.string().uuid("Invalid Hostel ID format"),
  }),
  body: z.object({
    amenityIds: z
      .array(z.string().uuid("Each amenity ID must be a valid UUID"), {
        required_error: "An array of amenity IDs is required",
      })
      .nonempty("Please provide at least one amenity ID or an empty array logic if allowed"),
  }),
});

export const singleAmenitySchema = z.object({
  params: z.object({
    hostelId: z.string().uuid("Invalid Hostel ID format"),
    amenityId: z.string().uuid("Invalid Amenity ID format"),
  }),
});