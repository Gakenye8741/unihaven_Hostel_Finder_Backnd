import { RequestHandler } from "express";
import {
  addReviewService,
  getHostelReviewsService,
  getHostelRatingStatsService,
  updateReviewService,
  replyToReviewService,
  deleteReviewService,
} from "./Reveiws.service";
import {
  createReviewSchema,
  updateReviewSchema,
  replyReviewSchema,
} from "../../validators/Reviews.validator";

// --------------------------- 1. ADD REVIEW ---------------------------
export const addReview: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return; // Empty return returns 'void', satisfying TS
    }

    const parseResult = createReviewSchema.safeParse({ 
        body: { ...req.body, userId } 
    });

    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return; // Exit function without returning the response object
    }

    const review = await addReviewService(parseResult.data.body);
    res.status(201).json({ message: "Review posted successfully! ⭐", review });
    // No return needed here as it's the end of the function
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed" });
  }
};

// --------------------------- 2. GET HOSTEL REVIEWS ---------------------------
export const listHostelReviews: RequestHandler = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const [reviewsList, stats] = await Promise.all([
      getHostelReviewsService(hostelId),
      getHostelRatingStatsService(hostelId)
    ]);

    res.status(200).json({ stats, reviews: reviewsList });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 3. UPDATE REVIEW ---------------------------
export const updateReview: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const parseResult = updateReviewSchema.safeParse({ params: req.params, body: req.body });
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return;
    }

    const updated = await updateReviewService(id, userId!, parseResult.data.body);
    if (!updated) {
      res.status(404).json({ error: "Review not found or unauthorized" });
      return;
    }

    res.status(200).json({ message: "Review updated ✅", updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 4. OWNER REPLY ---------------------------
export const replyToReview: RequestHandler = async (req, res) => {
  try {
    // 1. Validate using Zod
    const parseResult = replyReviewSchema.safeParse({ 
      params: req.params, 
      body: req.body 
    });
    
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return;
    }

    // 2. Extract clean data from parseResult
    // This ensures we only use data that passed validation
    const { id } = parseResult.data.params;
    const { ownerReply } = parseResult.data.body;

    // 3. Pass to service
    // FIX: Passing 'ownerReply' as a string to match the service signature
    const updated = await replyToReviewService(id, ownerReply); 
    
    if (!updated) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    res.status(200).json({ message: "Reply posted successfully 💬", updated });
  } catch (error: any) {
    // Drizzle throws "No values to set" if the update object is empty
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 5. DELETE REVIEW ---------------------------
export const removeReview: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const isAdmin = userRole === "Admin";
    const success = await deleteReviewService(id, userId, isAdmin);

    if (!success) {
      res.status(404).json({ error: "Review not found or unauthorized" });
      return;
    }

    res.status(200).json({ message: "Review deleted successfully 🗑️" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};