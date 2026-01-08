import { z } from "zod";

/**
 * Logic: Matches your DB enum for account statuses.
 */
export const accountStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "BANNED" ,"DEACTIVATED"]),
});

// ==========================================
// 1. PROFILE & ADMIN UPDATE VALIDATOR
// ==========================================
/**
 * UPDATED: Added 'role' and 'Admin' to allow the UserManager 
 * to successfully sync identity records including permissions.
 */
export const updateProfileSchema = z.object({
  username: z.string().min(3).optional(),
  fullName: z.string().min(3).optional(),
  avatarUrl: z.string().url("Invalid image URL").optional(),
  bio: z.string().max(500, "Bio is too long").optional(),
  phone: z.string().optional(),
  whatsappPhone: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(), 
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  // 🛰️ ADDED ROLE ENUM: This allows the Admin Sync to work
  role: z.enum(["Student", "Owner", "Admin", "Caretaker"]).optional(),
});

// ==========================================
// 2. IDENTITY VERIFICATION VALIDATOR
// ==========================================
export const identityVerificationSchema = z.object({
  idNumber: z.string().min(5, "ID Number is required"),
  idFrontImageUrl: z.string().url("Front ID image is required"),
  idBackImageUrl: z.string().url("Back ID image is required"),
  passportImageUrl: z.string().url("Passport photo is required"),
});

// ==========================================
// 3. ADMIN VERIFICATION VALIDATOR
// ==========================================
/**
 * Logic: Used specifically for the ID review queue.
 */
export const adminVerifySchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  targetRole: z.enum(["Admin", "Owner", "Caretaker", "Student"]), 
  remarks: z.string().optional(),
});

// --- Exported Types ---
export type TUpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type TIdentityInput = z.infer<typeof identityVerificationSchema>;
export type TAdminVerifyInput = z.infer<typeof adminVerifySchema>;
export type TAccountStatusInput = z.infer<typeof accountStatusSchema>;