import db from "../../drizzle/db";
import { reviews, TSelectReview, TInsertReview } from "../../drizzle/schema";
import { eq, and, sql, desc } from "drizzle-orm";

// ==========================================
// 1. ADD A REVIEW (Student)
// ==========================================
export const addReviewService = async (data: TInsertReview): Promise<TSelectReview> => {
  const [newReview] = await db.insert(reviews).values(data).returning();
  return newReview;
};

// ==========================================
// 2. GET ALL REVIEWS (Global / System-Wide)
// ==========================================
export const getAllReviewsService = async (): Promise<TSelectReview[]> => {
  return await db
    .select()
    .from(reviews)
    .orderBy(desc(reviews.createdAt));
};

// ==========================================
// 2.1 GET REVIEWS BY USER (Personal Vault/Archive)
// ==========================================
export const getUserReviewsService = async (userId: string): Promise<TSelectReview[]> => {
  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.userId, userId))
    .orderBy(desc(reviews.createdAt));
};

// ==========================================
// 3. GET REVIEWS BY HOSTEL (Filtered)
// ==========================================
export const getHostelReviewsService = async (hostelId: string): Promise<TSelectReview[]> => {
  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.hostelId, hostelId))
    .orderBy(desc(reviews.createdAt));
};

// ==========================================
// 4. GET HOSTEL RATING SUMMARY
// ==========================================
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
// 5. UPDATE REVIEW (User Owned)
// ==========================================
export const updateReviewService = async (
  reviewId: string, 
  userId: string, 
  data: Partial<TInsertReview>
): Promise<TSelectReview | undefined> => {
  const [updated] = await db
    .update(reviews)
    .set(data)
    .where(and(eq(reviews.id, reviewId), eq(reviews.userId, userId)))
    .returning();
  
  return updated;
};

// ==========================================
// 6. OWNER REPLY SERVICE
// ==========================================
export const replyToReviewService = async (
  reviewId: string, 
  ownerReply: string
): Promise<TSelectReview | undefined> => {
  const [updated] = await db
    .update(reviews)
    .set({ 
        ownerReply: ownerReply,
    })
    .where(eq(reviews.id, reviewId))
    .returning();
  
  return updated;
};

// ==========================================
// 7. DELETE REVIEW
// ==========================================
export const deleteReviewService = async (
    reviewId: string, 
    userId?: string, 
    isAdmin: boolean = false
): Promise<boolean> => {
  const query = isAdmin 
    ? eq(reviews.id, reviewId) 
    : and(eq(reviews.id, reviewId), eq(reviews.userId, userId!));

  const [deleted] = await db
    .delete(reviews)
    .where(query)
    .returning();
  
  return !!deleted;
};

// ==========================================
// 8. NEW: TOGGLE HELPFUL (Social Proof)
// ==========================================
export const toggleHelpfulService = async (reviewId: string) => {
    return await db
      .update(reviews)
      .set({ helpfulCount: sql`${reviews.helpfulCount} + 1` })
      .where(eq(reviews.id, reviewId))
      .returning();
};

// ==========================================
// 9. NEW: REPORT/FLAG REVIEW (Moderation)
// ==========================================
export const reportReviewService = async (reviewId: string, reason: string) => {
    return await db
      .update(reviews)
      .set({ isFlagged: true, reportReason: reason })
      .where(eq(reviews.id, reviewId))
      .returning();
};

// ==========================================
// 10. NEW: PREVENT DUPLICATE REVIEWS
// ==========================================
export const checkUserReviewStatusService = async (userId: string, hostelId: string) => {
    const existing = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.hostelId, hostelId)))
      .limit(1);
    return existing.length > 0;
};

// ==========================================
// 11. NEW: RATING DISTRIBUTION (For Progress Bars)
// ==========================================
export const getRatingDistributionService = async (hostelId: string) => {
    return await db
      .select({
        rating: reviews.rating,
        count: sql<number>`count(${reviews.id})`,
      })
      .from(reviews)
      .where(eq(reviews.hostelId, hostelId))
      .groupBy(reviews.rating)
      .orderBy(desc(reviews.rating));
};
// ==========================================
// 12. ADVANCED STUDENT ANALYTICS SERVICE
// ==========================================
export const getUserReviewStatsService = async (userId: string) => {
  const result = await db
    .select({
      // ::int ensures we return numbers, not strings
      totalReviews: sql<number>`count(${reviews.id})::int`,
      
      // coalesce handles null values if a user has 0 helpful votes
      totalHelpful: sql<number>`coalesce(sum(${reviews.helpfulCount}), 0)::int`,
      
      // Filtered count for reported/flagged entries
      reportedCount: sql<number>`count(${reviews.id}) filter (where ${reviews.isFlagged} = true)::int`,
      
      // Sub-query to find the hour of day with the most submissions
      peakHour: sql<number>`(
        SELECT EXTRACT(HOUR FROM r2.${reviews.createdAt})
        FROM ${reviews} r2
        WHERE r2.${reviews.userId} = ${userId}
        GROUP BY EXTRACT(HOUR FROM r2.${reviews.createdAt})
        ORDER BY count(*) DESC
        LIMIT 1
      )::int`
    })
    .from(reviews)
    .where(eq(reviews.userId, userId));

  // Fallback to safe defaults if no data exists
  return result[0] || { 
    totalReviews: 0, 
    totalHelpful: 0, 
    reportedCount: 0, 
    peakHour: null 
  };
};