import { z } from "zod";

// ==========================================
// 1. BASE HOSTEL SCHEMA
// ==========================================
export const hostelSchema = z.object({
  // ownerId is usually handled by the controller (extracted from JWT)
  // but included here if you want to validate it in the payload
  ownerId: z.string().uuid("Invalid Owner ID").optional(),

  name: z
    .string()
    .min(3, "Hostel name must be at least 3 characters")
    .max(255),

  campus: z
    .string()
    .min(2, "Campus name is required")
    .max(255),

  address: z
    .string()
    .min(5, "Please provide a detailed address or location"),

  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  /**
   * Must match your genderPolicy enum:
   * ["Male Only", "Female Only", "Mixed"]
   */
  policy: z.enum(["Male Only", "Female Only", "Mixed"], {
    errorMap: () => ({ message: "Policy must be 'Male Only', 'Female Only', or 'Mixed'" }),
  }),

  // isVerified is usually managed by Admins, not by the owner during creation
  isVerified: z.boolean().optional().default(false),
});

// ==========================================
// 2. CREATE HOSTEL VALIDATOR
// ==========================================
// Used when an owner first lists a hostel
export const createHostelSchema = hostelSchema;

// ==========================================
// 3. UPDATE HOSTEL VALIDATOR
// ==========================================
// .partial() makes all fields optional so you can update just the 'description' or 'policy'
export const updateHostelSchema = hostelSchema.partial();

// ==========================================
// 4. FILTER/SEARCH VALIDATOR (Optional)
// ==========================================
// Useful for validating query parameters in the list/search endpoint
export const hostelFilterSchema = z.object({
  campus: z.string().optional(),
  policy: z.enum(["Male Only", "Female Only", "Mixed"]).optional(),
  search: z.string().optional(),
});