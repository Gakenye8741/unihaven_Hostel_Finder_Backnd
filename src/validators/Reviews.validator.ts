import { z } from "zod";

// --- Base Review Schema ---
// validators/Reviews.validator.ts

export const reviewSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid({ message: "A valid User ID is required" }),
  hostelId: z.string().uuid({ message: "A valid Hostel ID is required" }),
  // ADD THIS FIELD
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .optional(), 
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(500).optional().nullable(),
  ownerReply: z.string().max(500).optional().nullable(),
});

// ==========================================
// Specialized Schemas for Routes
// ==========================================

// 1. Create Review (Student)
// Typically, userId comes from the Auth token, but we validate it in the body for safety
export const createReviewSchema = z.object({
  body: reviewSchema.omit({ 
    id: true,
    ownerReply: true 
  }),
});

// 2. Update Review (Student)
export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid review ID"),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().min(3).max(500).optional(),
  }),
});

// 3. Owner Reply Schema
export const replyReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid review ID"),
  }),
  body: z.object({
    ownerReply: z.string().min(1, "Reply cannot be empty").max(500),
  }),
});

// 4. Review Params (For Delete/Single Get)
export const reviewParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});