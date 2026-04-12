import db from "../../drizzle/db";
import { favorites, TSelectFavorites, TInsertFavorites, hostels, users } from "../../drizzle/schema";
import { eq, and, sql, desc } from "drizzle-orm";

// ==========================================
// 1. ADD TO WISHLIST (Save Hostel)
// ==========================================
export const addToWishlistService = async (data: TInsertFavorites): Promise<TSelectFavorites | undefined> => {
  const [newFavorite] = await db
    .insert(favorites)
    .values(data)
    .onConflictDoNothing()
    .returning();
  return newFavorite;
};

// ==========================================
// 2. GET STUDENT WISHLIST (Detailed Dashboard View)
// ==========================================
export const getStudentWishlistService = async (userId: string) => {
  return await db.query.favorites.findMany({
    where: eq(favorites.userId, userId),
    orderBy: [desc(favorites.createdAt)],
    with: {
      hostel: {
        with: {
          media: true,
          amenities: {
            with: {
              amenity: true,
            },
          },
          owner: {
            columns: {
              id: true,
            }
          }
        },
      },
    },
  });
};

// ==========================================
// 3. CHECK FAVORITE STATUS
// ==========================================
export const isHostelFavoritedService = async (userId: string, hostelId: string): Promise<boolean> => {
  const result = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.hostelId, hostelId)))
    .limit(1);
  
  return result.length > 0;
};

// ==========================================
// 4. REMOVE FROM WISHLIST (Unsave)
// ==========================================
export const removeFromWishlistService = async (userId: string, hostelId: string): Promise<TSelectFavorites | undefined> => {
  const [deleted] = await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.hostelId, hostelId)))
    .returning();
  return deleted;
};

// ==========================================
// 5. BULK WISHLIST REMOVAL
// ==========================================
export const clearUserWishlistService = async (userId: string): Promise<void> => {
  await db
    .delete(favorites)
    .where(eq(favorites.userId, userId));
};

// ==========================================
// 6. WISHLIST STATISTICS & ANALYTICS
// ==========================================
/**
 * Returns counts for the dashboard header.
 */
export const getWishlistStatsService = async (userId: string) => {
  const stats = await db
    .select({
      totalSaved: sql<number>`count(${favorites.hostelId})`,
      latestSave: sql<string>`max(${favorites.createdAt})`,
    })
    .from(favorites)
    .where(eq(favorites.userId, userId));

  return stats[0];
};

// ==========================================
// 7. PUBLIC WISHLIST COUNT (Social Proof)
// ==========================================
export const getHostelPopularityService = async (hostelId: string) => {
  const popularity = await db
    .select({
      savedCount: sql<number>`count(${favorites.userId})`,
    })
    .from(favorites)
    .where(eq(favorites.hostelId, hostelId));

  return popularity[0];
};