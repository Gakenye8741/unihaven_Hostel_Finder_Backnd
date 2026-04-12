import { z } from "zod";

// --------------------------- 1. CREATE WISHLIST SCHEMA ---------------------------
/**
 * Validates the body for adding a hostel to the wishlist.
 * Note: userId is usually handled by auth middleware, so we only validate hostelId here.
 */
export const createWishlistSchema = z.object({
  body: z.object({
    hostelId: z.string({
      required_error: "Hostel ID is required to save to wishlist",
    }).uuid({ message: "Invalid Hostel ID format (Must be a UUID)" }),
  }),
});

// --------------------------- 2. WISHLIST PARAMS SCHEMA ---------------------------
/**
 * Validates the parameters when removing or checking a specific hostel in the wishlist.
 */
export const wishlistParamsSchema = z.object({
  params: z.object({
    hostelId: z.string().uuid({ message: "Invalid Hostel ID in parameters" }),
  }),
});

// --------------------------- 3. TYPES ---------------------------
export type TCreateWishlist = z.infer<typeof createWishlistSchema>["body"];