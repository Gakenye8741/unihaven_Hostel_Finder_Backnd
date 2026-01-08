import { Router } from "express";
import { 
  addReview, 
  listHostelReviews, 
  updateReview, 
  replyToReview, 
  removeReview 
} from "./Reviews.controller";
import { 
  allAuth, 
  managementAuth, 
  authMiddleware 
} from "../../middleware/AuthBearer";

const ReviewRouter = Router();

// ========================== PUBLIC ROUTES ==========================

/**
 * Anyone can view reviews and stats for a hostel.
 */
ReviewRouter.get("/hostel/:hostelId", listHostelReviews);


// ========================== STUDENT ROUTES ==========================

/**
 * CREATE: Only logged-in users (usually students) can post reviews.
 */
ReviewRouter.post("/", allAuth, addReview);

/**
 * UPDATE: Students can edit their own reviews.
 */
ReviewRouter.patch("/:id", allAuth, updateReview);


// ========================== MANAGEMENT ROUTES ==========================

/**
 * REPLY: Owners and Caretakers can respond to student reviews.
 */
ReviewRouter.patch("/reply/:id", managementAuth, replyToReview);


// ========================== MODERATION ROUTES ==========================

/**
 * DELETE: 
 * - Students can delete their own review.
 * - Admins can delete any review (Moderation).
 */
ReviewRouter.delete("/:id", allAuth, removeReview);

export default ReviewRouter;