import { RequestHandler } from "express";
import {
  addToWishlistService,
  getStudentWishlistService,
  isHostelFavoritedService,
  removeFromWishlistService,
  clearUserWishlistService,
  getWishlistStatsService,
  getHostelPopularityService,
} from "./Wishlist.service";
import { createWishlistSchema, wishlistParamsSchema } from "../../validators/Wishlist.validator";

// --------------------------- 1. ADD TO WISHLIST ---------------------------
export const addFavorite: RequestHandler = async (req, res) => {
  try {
    const parseResult = createWishlistSchema.safeParse({ body: req.body });
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return;
    }

    const userId = req.user?.id; // Assuming auth middleware
    const newFavorite = await addToWishlistService({
      ...parseResult.data.body,
      userId: userId as string,
    });

    res.status(201).json({ message: "Hostel saved to wishlist ❤️", data: newFavorite });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to add to wishlist" });
  }
};

// --------------------------- 2. LIST STUDENT WISHLIST ---------------------------
export const listWishlist: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const wishlist = await getStudentWishlistService(userId as string);
    res.status(200).json(wishlist);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 3. CHECK FAVORITE STATUS ---------------------------
export const checkStatus: RequestHandler = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const userId = req.user?.id;
    const isFavorited = await isHostelFavoritedService(userId as string, hostelId as string);
    res.status(200).json({ isFavorited });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 4. REMOVE FROM WISHLIST ---------------------------
export const removeFavorite: RequestHandler = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const userId = req.user?.id;
    const deleted = await removeFromWishlistService(userId as string, hostelId as string);

    if (!deleted) {
      res.status(404).json({ error: "Item not found in wishlist. 🔍" });
      return;
    }

    res.status(200).json({ message: "Removed from wishlist successfully 🗑️" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 5. CLEAR ALL WISHLIST ---------------------------
export const clearWishlist: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    await clearUserWishlistService(userId as string);
    res.status(200).json({ message: "Wishlist cleared successfully 🧹" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 6. GET WISHLIST STATS ---------------------------
export const getStats: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const stats = await getWishlistStatsService(userId as string);
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 7. GET HOSTEL POPULARITY ---------------------------
export const getPopularity: RequestHandler = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const popularity = await getHostelPopularityService(hostelId as string);
    res.status(200).json(popularity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};