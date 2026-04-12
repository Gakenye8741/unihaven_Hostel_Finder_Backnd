import { Router } from "express";
import {
  addFavorite,
  listWishlist,
  checkStatus,
  removeFavorite,
  clearWishlist,
  getStats,
  getPopularity
} from "./Wishlist.controller";
import { 
  allAuth 
} from "../../middleware/AuthBearer";

const WishlistRouter = Router();

// ========================== STUDENT WISHLIST ROUTES ==========================

/**
 * ADD: Save a hostel to the student's personal wishlist.
 */
WishlistRouter.post("/", allAuth, addFavorite);

/**
 * LIST: Fetch all hostels saved by the logged-in student.
 * This powers the main Student Dashboard view.
 */
WishlistRouter.get("/", allAuth, listWishlist);

/**
 * STATS: Get an overview of the student's wishlist (total count, etc.).
 */
WishlistRouter.get("/stats", allAuth, getStats);

/**
 * CHECK STATUS: Verify if a specific hostel is already in the student's wishlist.
 * Useful for toggling UI heart icons on the search page.
 */
WishlistRouter.get("/status/:hostelId", allAuth, checkStatus);

/**
 * REMOVE: Remove a specific hostel from the student's wishlist.
 */
WishlistRouter.delete("/:hostelId", allAuth, removeFavorite);

/**
 * CLEAR: Remove all items from the student's wishlist at once.
 */
WishlistRouter.delete("/", allAuth, clearWishlist);

// ========================== PUBLIC / SOCIAL ROUTES ==========================

WishlistRouter.get("/popularity/:hostelId", allAuth, getPopularity);

export default WishlistRouter;