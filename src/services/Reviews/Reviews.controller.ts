import { RequestHandler } from "express";
import {
  addReviewService,
  getAllReviewsService,
  getUserReviewsService, // Integrated new service
  getHostelReviewsService,
  getHostelRatingStatsService,
  updateReviewService,
  replyToReviewService,
  deleteReviewService,
  toggleHelpfulService,
  reportReviewService,
  checkUserReviewStatusService,
  getRatingDistributionService,
  getUserReviewStatsService
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
    const { hostelId } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: User ID missing" });
      return;
    }

    // Check if user already reviewed this specific hostel
    const alreadyReviewed = await checkUserReviewStatusService(userId, hostelId);
    if (alreadyReviewed) {
      res.status(400).json({ error: "You have already reviewed this hostel" });
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
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// --------------------------- 2. LIST REVIEWS & ANALYTICS ---------------------------
export const listHostelReviews: RequestHandler = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const userId = req.user?.id;

    // Check if the request is for the logged-in user's own reviews
    const isPersonalFetch = hostelId === "me" || hostelId === "my-reviews";
    // Standardize check for global vs specific hostel fetch
    const isGlobalFetch = !hostelId || hostelId === "all" || hostelId === "undefined" || hostelId === "";

    // OPTION A: Personal "My Reviews" Fetch
    if (isPersonalFetch && userId) {
      const reviewsList = await getUserReviewsService(userId);
      res.status(200).json({
        stats: { totalReviews: reviewsList.length },
        reviews: reviewsList
      });
      return;
    }

    // OPTION B: Global System-Wide Fetch (Admin/Moderator)
    if (isGlobalFetch) {
      const reviewsList = await getAllReviewsService();
      res.status(200).json({
        stats: { totalReviews: reviewsList.length },
        reviews: reviewsList
      });
      return;
    }

    // OPTION C: Specific Hostel Fetch (Public View with Stats)
    const [reviewsList, stats, distribution] = await Promise.all([
      getHostelReviewsService(hostelId as string),
      getHostelRatingStatsService(hostelId as string),
      getRatingDistributionService(hostelId as string)
    ]);

    res.status(200).json({ stats, distribution, reviews: reviewsList });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 3. UPDATE REVIEW ---------------------------
export const updateReview: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Login required" });
      return;
    }

    const parseResult = updateReviewSchema.safeParse({ params: req.params, body: req.body });
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return;
    }

    // SERVICE CALL: Verifies ownership internally via userId
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

// --------------------------- 4. OWNER/MANAGEMENT REPLY ---------------------------
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

// --------------------------- 5. TOGGLE HELPFUL ---------------------------
export const markReviewHelpful: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await toggleHelpfulService(id as string);
    
    if (!updated) {
        res.status(404).json({ error: "Review not found" });
        return;
    }

    res.status(200).json({ message: "Marked as helpful 👍", updated: Array.isArray(updated) ? updated[0] : updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 6. REPORT REVIEW ---------------------------
export const reportReview: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({ error: "Reason for reporting is required" });
      return;
    }

    const reported = await reportReviewService(id as string, reason);
    
    if (!reported) {
        res.status(404).json({ error: "Review not found" });
        return;
    }

    res.status(200).json({ message: "Review reported for moderation 🚩", reported: Array.isArray(reported) ? reported[0] : reported });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 7. DELETE REVIEW ---------------------------
export const removeReview: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Login required" });
      return;
    }

    const isAdmin = userRole === "Admin";
    
    // Logic: Admin can delete any ID, User can only delete if userId matches
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
// --------------------------- 8. GET USER ANALYTICS ---------------------------
export const getUserReviewStats: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

    // 1. Guard against unauthenticated requests
    if (!userId) {
       res.status(401).json({ error: "Unauthorized: User session not found" });
       return;
    }

    // 2. Fetch the aggregated metrics from the service
    const stats = await getUserReviewStatsService(userId);

    // 3. Return a synchronized response with all telemetry
    res.status(200).json({
      message: "Analytics synchronized 📊",
      stats: {
        totalReviews: Number(stats.totalReviews),
        totalHelpful: Number(stats.totalHelpful || 0),
        reportedCount: Number(stats.reportedCount),
        // Adding the new peak activity metric
        peakHour: stats.peakHour !== null ? Number(stats.peakHour) : null,
      }
    });
  } catch (error: any) {
    // 4. Log error for debugging (optional) and return 500
    console.error(`[Analytics Error]: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error: Failed to compile telemetry" });
  }
};