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
        return; 
    }

    const parseResult = createReviewSchema.safeParse({ 
        body: { ...req.body, userId } 
    });

    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return; 
    }

    const review = await addReviewService(parseResult.data.body);
    res.status(201).json({ message: "Review posted successfully! ⭐", review });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed" });
  }
};

// --------------------------- 2. GET HOSTEL REVIEWS ---------------------------
export const listHostelReviews: RequestHandler = async (req, res) => {
  try {
    const { hostelId } = req.params;
    // Fix: cast hostelId to string for service compatibility
    const [reviewsList, stats] = await Promise.all([
      getHostelReviewsService(hostelId as string),
      getHostelRatingStatsService(hostelId as string)
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

    // Fix: cast id and userId to string
    const updated = await updateReviewService(id as string, userId as string, parseResult.data.body);
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
    const parseResult = replyReviewSchema.safeParse({ 
      params: req.params, 
      body: req.body 
    });
    
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return;
    }

    const { id } = parseResult.data.params;
    const { ownerReply } = parseResult.data.body;

    // Fix: cast id to string
    const updated = await replyToReviewService(id as string, ownerReply); 
    
    if (!updated) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    res.status(200).json({ message: "Reply posted successfully 💬", updated });
  } catch (error: any) {
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
    // Fix: cast id and userId to string
    const success = await deleteReviewService(id as string, userId as string, isAdmin);

    if (!success) {
      res.status(404).json({ error: "Review not found or unauthorized" });
      return;
    }

    res.status(200).json({ message: "Review deleted successfully 🗑️" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};