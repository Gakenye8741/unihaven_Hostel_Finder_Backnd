import db from "../../drizzle/db";
import { 
  amenities, 
  hostelAmenities, 
  TInsertAmenity, 
  TSelectAmenity 
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * ============================================================
 * 1. AMENITIES TABLE SERVICES (Global Catalog)
 * ============================================================
 */

export const createAmenityService = async (data: TInsertAmenity): Promise<TSelectAmenity> => {
  const [newAmenity] = await db.insert(amenities).values(data).returning();
  return newAmenity;
};

export const getAllAmenitiesService = async (): Promise<TSelectAmenity[]> => {
  return await db.select().from(amenities).orderBy(amenities.name);
};

export const updateGlobalAmenityService = async (id: string, data: Partial<TInsertAmenity>) => {
  const [updated] = await db.update(amenities)
    .set(data)
    .where(eq(amenities.id, id))
    .returning();
  return updated;
};

export const deleteGlobalAmenityService = async (id: string) => {
  await db.delete(amenities).where(eq(amenities.id, id));
  return { message: "Global amenity deleted successfully 🗑️" };
};


/**
 * ============================================================
 * 2. HOSTEL_AMENITIES TABLE SERVICES (Junction / Connections)
 * ============================================================
 */

// Uses Drizzle Relational Query for cleaner data nesting
export const getHostelAmenitiesService = async (hostelId: string) => {
  const result = await db.query.hostelAmenities.findMany({
    where: eq(hostelAmenities.hostelId, hostelId),
    with: {
      amenity: true // This leverages your 'relations' setup to get name/icon automatically
    }
  });
  
  // Flatten the result so the frontend gets a clean array of amenities
  return result.map(ra => ra.amenity);
};

/**
 * SYNC HOSTEL AMENITIES
 * Replaces old selection with new list. Uses a transaction for safety.
 */
export const syncHostelAmenitiesService = async (hostelId: string, amenityIds: string[]) => {
  return await db.transaction(async (tx) => {
    // 1. Remove existing associations
    await tx.delete(hostelAmenities).where(eq(hostelAmenities.hostelId, hostelId));

    if (!amenityIds || amenityIds.length === 0) return [];

    // 2. Insert new associations
    const values = amenityIds.map((id) => ({
      hostelId,
      amenityId: id,
    }));

    return await tx.insert(hostelAmenities).values(values).returning();
  });
};

export const addSingleAmenityToHostelService = async (hostelId: string, amenityId: string) => {
  const [added] = await db.insert(hostelAmenities)
    .values({ hostelId, amenityId })
    .onConflictDoNothing() // Prevents crash if relationship already exists
    .returning();
  return added;
};

export const removeSingleAmenityFromHostelService = async (hostelId: string, amenityId: string) => {
  const deleted = await db.delete(hostelAmenities)
    .where(and(
      eq(hostelAmenities.hostelId, hostelId),
      eq(hostelAmenities.amenityId, amenityId)
    ))
    .returning();
    
  return deleted.length > 0 
    ? { message: "Amenity removed from hostel" } 
    : { message: "Relationship not found" };
};