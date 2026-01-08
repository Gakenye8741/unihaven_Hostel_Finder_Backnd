import  db  from "../../drizzle/db";
import { hostelMedia, TInsertHostelMedia, TSelectHostelMedia } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

// ==========================================
// 1. ADD / UPLOAD MEDIA (Batch)
// ==========================================
export const addHostelMediaService = async (data: TInsertHostelMedia[]) => {
  return await db.transaction(async (tx) => {
    const hostelId = data[0].hostelId;

    // Check if any incoming image is intended to be the thumbnail
    const hasNewThumbnail = data.find((m) => m.isThumbnail === true);

    if (hasNewThumbnail) {
      // Reset existing thumbnails for this hostel
      await tx
        .update(hostelMedia)
        .set({ isThumbnail: false })
        .where(eq(hostelMedia.hostelId, hostelId));
    }

    const inserted = await tx.insert(hostelMedia).values(data).returning();
    return inserted;
  });
};

// ==========================================
// 2. UPDATE / REPLACE MEDIA
// ==========================================
/**
 * Use this to change an image URL, change media type, 
 * or promote an existing image to be the thumbnail.
 */
export const updateMediaService = async (
  mediaId: string,
  hostelId: string,
  data: Partial<Pick<TInsertHostelMedia, "url" | "isThumbnail" | "type">>
) => {
  return await db.transaction(async (tx) => {
    // If setting as thumbnail, demote others first
    if (data.isThumbnail === true) {
      await tx
        .update(hostelMedia)
        .set({ isThumbnail: false })
        .where(eq(hostelMedia.hostelId, hostelId));
    }

    const [updated] = await tx
      .update(hostelMedia)
      .set(data)
      .where(and(eq(hostelMedia.id, mediaId), eq(hostelMedia.hostelId, hostelId)))
      .returning();

    if (!updated) throw new Error("Media item not found for this hostel.");
    return updated;
  });
};

// ==========================================
// 3. READ MEDIA
// ==========================================
export const getMediaByHostelService = async (hostelId: string): Promise<TSelectHostelMedia[]> => {
  return await db
    .select()
    .from(hostelMedia)
    .where(eq(hostelMedia.hostelId, hostelId))
    .orderBy(sql`${hostelMedia.isThumbnail} DESC`, hostelMedia.createdAt); 
    // ^ Ensures thumbnail always appears first in the array
};

// ==========================================
// 4. DELETE MEDIA
// ==========================================
export const deleteMediaService = async (mediaId: string, hostelId: string) => {
  return await db.transaction(async (tx) => {
    // Check if we are deleting the thumbnail
    const [mediaToDelete] = await tx
      .select()
      .from(hostelMedia)
      .where(eq(hostelMedia.id, mediaId))
      .limit(1);

    await tx.delete(hostelMedia).where(eq(hostelMedia.id, mediaId));

    // If we just deleted the thumbnail, pick the oldest remaining image and make it the thumbnail
    if (mediaToDelete?.isThumbnail) {
      const [nextInLine] = await tx
        .select()
        .from(hostelMedia)
        .where(eq(hostelMedia.hostelId, hostelId))
        .orderBy(hostelMedia.createdAt)
        .limit(1);

      if (nextInLine) {
        await tx
          .update(hostelMedia)
          .set({ isThumbnail: true })
          .where(eq(hostelMedia.id, nextInLine.id));
      }
    }

    return { success: true, message: "Media deleted successfully" };
  });
};