import  db  from "../../drizzle/db";
import { hostels, TInsertHostel, TSelectHostel } from "../../drizzle/schema";
import { eq, ilike, and, or, sql } from "drizzle-orm";

// ==========================================
// 1. CREATE: Add a new hostel
// ==========================================
export const createHostelService = async (data: TInsertHostel): Promise<TSelectHostel> => {
  // Check if a hostel with the same name already exists at this address (prevent duplicates)
  const existing = await db.select().from(hostels).where(
    and(
      eq(hostels.name, data.name),
      eq(hostels.address, data.address)
    )
  ).limit(1);

  if (existing.length > 0) {
    throw new Error("A hostel with this name already exists at this location.");
  }

  const [newHostel] = await db.insert(hostels).values(data).returning();
  return newHostel;
};

// ==========================================
// 2. READ: Fetch with Advanced Filters
// ==========================================
export const getHostelsService = async (filters: { 
  campus?: string, 
  policy?: "Mixed" | "Male Only" | "Female Only", 
  search?: string,
  isVerified?: boolean 
}) => {
  const conditions = [];

  if (filters.campus) conditions.push(eq(hostels.campus, filters.campus));
  if (filters.policy) conditions.push(eq(hostels.policy, filters.policy));
  if (filters.isVerified !== undefined) conditions.push(eq(hostels.isVerified, filters.isVerified));
  
  if (filters.search) {
    conditions.push(
      or(
        ilike(hostels.name, `%${filters.search}%`),
        ilike(hostels.campus, `%${filters.search}%`),
        ilike(hostels.address, `%${filters.search}%`)
      )
    );
  }

  return await db.select().from(hostels).where(and(...conditions)).orderBy(hostels.createdAt);
};

// Get single hostel by ID
export const getHostelByIdService = async (id: string): Promise<TSelectHostel | undefined> => {
  const result = await db.select().from(hostels).where(eq(hostels.id, id)).limit(1);
  return result[0];
};

// ==========================================
// 3. UPDATE: Modify existing hostel
// ==========================================
export const updateHostelService = async (id: string, userId: string, data: Partial<TInsertHostel>) => {
  // Security check: Verify the user requesting the update owns this hostel
  const hostel = await getHostelByIdService(id);
  if (!hostel) throw new Error("Hostel not found.");
  if (hostel.ownerId !== userId) throw new Error("Unauthorized: You do not own this hostel.");

  const [updatedHostel] = await db
    .update(hostels)
    .set({ ...data }) // Partial update allows updating just one field (e.g., description)
    .where(eq(hostels.id, id))
    .returning();

  return updatedHostel;
};

// ==========================================
// 4. DELETE: Remove a hostel
// ==========================================
export const deleteHostelService = async (id: string, userId: string, userRole: string) => {
  const hostel = await getHostelByIdService(id);
  if (!hostel) throw new Error("Hostel not found.");

  // Security check: Only the Owner or an Admin can delete
  if (hostel.ownerId !== userId && userRole !== "Admin") {
    throw new Error("Unauthorized: You cannot delete this listing.");
  }

  await db.delete(hostels).where(eq(hostels.id, id));
  return { message: "Hostel and all associated records deleted successfully. 🗑️" };
};

// ==========================================
// 5. UTILITY: Verification Toggle (For Admin)
// ==========================================
export const toggleHostelVerificationService = async (id: string, status: boolean) => {
  const [updated] = await db
    .update(hostels)
    .set({ isVerified: status })
    .where(eq(hostels.id, id))
    .returning();
  return updated;
};