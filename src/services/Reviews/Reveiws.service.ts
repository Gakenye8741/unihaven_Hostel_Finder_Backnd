import db from "../../drizzle/db";
import { reviews, TSelectReview, TInsertReview } from "../../drizzle/schema";
import { eq, and, sql, desc } from "drizzle-orm";

// ==========================================
// 1. ADD A REVIEW (Student)
// ==========================================
/**
 * Logic: Inserts a new review. 
 * Note: If you added the unique constraint in the schema, 
 * this will automatically throw an error if the user tries to review twice.
 */
export const addReviewService = async (data: TInsertReview): Promise<TSelectReview> => {
  const [newReview] = await db.insert(reviews).values(data).returning();
  return newReview;
};

// ==========================================
// 2. GET REVIEWS BY HOSTEL (Public)
// ==========================================
/**
 * Fetches all reviews for a specific hostel.
 * Includes a "helpful" sort order or chronological order.
 */
export const getHostelReviewsService = async (hostelId: string): Promise<TSelectReview[]> => {
  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.hostelId, hostelId))
    .orderBy(desc(reviews.createdAt));
};

// ==========================================
// 3. GET HOSTEL RATING SUMMARY
// ==========================================
/**
 * Calculated the Average Rating and Review Count.
 * This is used for the hostel "Star" badges on the search page.
 */
export const getHostelRatingStatsService = async (hostelId: string) => {
  const stats = await db
    .select({
      averageRating: sql<number>`round(avg(${reviews.rating})::numeric, 1)`,
      totalReviews: sql<number>`count(${reviews.id})`,
    })
    .from(reviews)
    .where(eq(reviews.hostelId, hostelId));

  return stats[0] || { averageRating: 0, totalReviews: 0 };
};

// ==========================================
// 4. UPDATE REVIEW (User)
// ==========================================
export const updateReviewService = async (
  reviewId: string, 
  userId: string, 
  data: Partial<TInsertReview>
): Promise<TSelectReview | undefined> => {
  const [updated] = await db
    .update(reviews)
    .set(data) // Pass the partial object directly
    .where(and(eq(reviews.id, reviewId), eq(reviews.userId, userId)))
    .returning();
  
  return updated;
};

// ==========================================
// 5. OWNER REPLY SERVICE
// ==========================================
/**
 * FIXED: Receives the string directly from the controller 
 * and applies it to the 'ownerReply' column.
 */
export const replyToReviewService = async (
  reviewId: string, 
  ownerReply: string
): Promise<TSelectReview | undefined> => {
  const [updated] = await db
    .update(reviews)
    .set({ 
        ownerReply: ownerReply, // Ensure this column name matches your drizzle schema exactly
    })
    .where(eq(reviews.id, reviewId))
    .returning();
  
  return updated;
};

// ==========================================
// 6. DELETE REVIEW
// ==========================================
/**
 * User can delete their own review, or Admin can moderate.
 */
export const deleteReviewService = async (reviewId: string, userId?: string, isAdmin: boolean = false): Promise<boolean> => {
  const query = isAdmin 
    ? eq(reviews.id, reviewId) 
    : and(eq(reviews.id, reviewId), eq(reviews.userId, userId!));

  const [deleted] = await db
    .delete(reviews)
    .where(query)
    .returning();
  
  return !!deleted;
};