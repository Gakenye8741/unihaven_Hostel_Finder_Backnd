import { Router } from "express";
import { 
  addReview, 
  listHostelReviews, 
  updateReview, 
  replyToReview, 
  removeReview,
  markReviewHelpful, 
  reportReview,      
  getUserReviewStats // Integrated for the Student Dashboard
} from "./Reviews.controller";
import { 
  allAuth, 
  managementAuth, 
} from "../../middleware/AuthBearer";

const ReviewRouter = Router();

// ========================== 1. THE USER VAULT (STUDENT DASHBOARD) ==========================
// These routes power the personalized analytics and history views for students.

/**
 * ANALYTICS: Get aggregate stats (Like count, reports, peak activity) for the logged-in user.
 * Matches: GET /api/reviews/stats/me
 */
ReviewRouter.get("/stats/me", allAuth, getUserReviewStats);

/**
 * PERSONAL: Fetch reviews specifically belonging to the logged-in user.
 * Matches: GET /api/reviews/me
 */
ReviewRouter.get("/me", allAuth, listHostelReviews);


// ========================== 2. GLOBAL & HOSTEL DISCOVERY ==========================

/**
 * GLOBAL: Fetch all reviews (Admin/Moderator View).
 * Matches: GET /api/reviews/all
 */
ReviewRouter.get("/all", allAuth, listHostelReviews);

/**
 * SPECIFIC: Public access to hostel-specific reviews and analytics.
 * Matches: GET /api/reviews/hostel/:hostelId
 */
ReviewRouter.get("/hostel/:hostelId", listHostelReviews);


// ========================== 3. CORE CRUD OPERATIONS ==========================

/**
 * CREATE: Authenticated users only.
 */
ReviewRouter.post("/", allAuth, addReview);

/**
 * UPDATE: Users edit their own content.
 */
ReviewRouter.patch("/:id", allAuth, updateReview);

/**
 * DELETE: Authors delete their own; Admins delete for moderation.
 */
ReviewRouter.delete("/:id", allAuth, removeReview);


// ========================== 4. INTERACTION & MODERATION ==========================

/**
 * HELPFUL: Increment the helpful count (Like Count).
 */
ReviewRouter.patch("/:id/helpful", allAuth, markReviewHelpful);

/**
 * REPORT: Community flagging for moderation.
 */
ReviewRouter.post("/:id/report", allAuth, reportReview);


// ========================== 5. MANAGEMENT & CARETAKER ==========================

/**
 * REPLY: Specifically for Owners/Caretakers to respond to feedback.
 * Matches: PATCH /api/reviews/reply/:id
 */
ReviewRouter.patch("/reply/:id", managementAuth, replyToReview);

export default ReviewRouter;