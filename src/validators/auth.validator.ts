import { z } from "zod";

/* ======================= REGISTER VALIDATION ======================= */
export const registerUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(255),

  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(255),

  email: z.string().email("Invalid email address"),

  phone: z
    .string()
    .max(20, "Phone number is too long")
    .optional(),

  /**
   * Updated to match Unihaven pgEnum exactly:
   * ["Student", "Owner", "Admin", "Caretaker"]
   */
  role: z
    .enum(["Student", "Owner", "Admin", "Caretaker"])
    .default("Student")
    .optional(),

  passwordHash: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  avatarUrl: z
    .string()
    .url("Avatar must be a valid URL")
    .optional()
    .or(z.literal("")), // Allows empty string if frontend sends it

  bio: z
    .string()
    .max(500, "Bio must not exceed 500 characters")
    .optional(),
});

/* ======================= LOGIN VALIDATION ======================= */
export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  passwordHash: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

/* ======================= UPDATE PASSWORD VALIDATION ======================= */
export const updatePasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  newPasswordHash: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

/* ======================= EMAIL VERIFICATION ======================= */
export const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  confirmationCode: z
    .string()
    .length(6, "Confirmation code must be exactly 6 digits"),
});

/* ======================= GENERATE NEW CONFIRMATION CODE ======================= */
export const generateConfirmationCodeSchema = z.object({
  email: z.string().email("Invalid email address"),
});