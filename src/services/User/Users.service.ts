import db from "../../drizzle/db";
import { users, TSelectUser } from "../../drizzle/schema";
import { eq, sql, desc } from "drizzle-orm";

// ==========================================
// 1. FETCH USER BY ID
// ==========================================
export const getUserByIdService = async (userId: string): Promise<TSelectUser | undefined> => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));
  return user;
};

// ==========================================
// 2. SUBMIT VERIFICATION DOCUMENTS
// ==========================================
export const submitVerificationDocsService = async (
  userId: string,
  payload: {
    idNumber: string;
    idFrontImageUrl: string;
    idBackImageUrl: string;
    passportImageUrl: string;
  }
): Promise<TSelectUser | undefined> => {
  const [updatedUser] = await db
    .update(users)
    .set({
      ...payload,
      identityVerificationStatus: "PENDING",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updatedUser;
};

// ==========================================
// 3. OWNER: LINK A CARETAKER
// ==========================================
export const linkCaretakerToOwnerService = async (
  ownerId: string,
  caretakerEmail: string
): Promise<TSelectUser | undefined> => {
  const [caretaker] = await db
    .update(users)
    .set({
      managedBy: ownerId,
      updatedAt: new Date(),
    })
    .where(eq(users.email, caretakerEmail))
    .returning();

  return caretaker;
};

// ==========================================
// 4. ADMIN: VERIFY IDENTITY & PROMOTE ROLE
// ==========================================
export const adminVerifyIdentityService = async (
  userId: string,
  status: "APPROVED" | "REJECTED",
  targetRole: TSelectUser['role'], 
  remarks?: string
): Promise<TSelectUser | undefined> => {
  
  const user = await getUserByIdService(userId);

  // Guard: Caretakers must have an owner assigned
  if (status === "APPROVED" && targetRole === "Caretaker" && !user?.managedBy) {
    throw new Error("Caretaker must be linked to an Owner/Manager first.");
  }

  const isApproved = status === "APPROVED";

  const [updated] = await db
    .update(users)
    .set({
      identityVerificationStatus: status,
      isIdentityVerified: isApproved,
      role: isApproved ? targetRole : "Student", 
      verificationRemarks: remarks || (isApproved ? "Verified via Admin" : "Rejected"),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updated;
};

// ==========================================
// 5. UPDATE ACCOUNT STATUS (Moderation)
// ==========================================
export const updateAccountStatusService = async (
  userId: string,
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "DEACTIVATED"
): Promise<TSelectUser | undefined> => {
  const [updated] = await db
    .update(users)
    .set({
      accountStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updated;
};

// ==========================================
// 6. GET ALL USERS (Admin Listing)
// ==========================================
export const getAllUsersService = async (): Promise<TSelectUser[]> => {
  return await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));
};

// ==========================================
// 7. FINAL FIXED: ADMIN UPDATE USER (Includes Role)
// ==========================================
/**
 * This service handles the direct PATCH from your UserManager.
 * It explicitly allows role changes.
 */
export const updateProfileService = async (
  userId: string,
  data: Partial<TSelectUser> 
): Promise<TSelectUser | undefined> => {
  const [updated] = await db
    .update(users)
    .set({
      // Explicitly spreading the incoming data (username, role, gender, bio, whatsappPhone)
      ...data, 
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  
  return updated;
};

// ==========================================
// 8. GET OWNER'S CARETAKERS
// ==========================================
export const getMyCaretakersService = async (ownerId: string): Promise<TSelectUser[]> => {
  return await db
    .select()
    .from(users)
    .where(eq(users.managedBy, ownerId));
};

// ==========================================
// 9. ADMIN PENDING QUEUE
// ==========================================
export const getPendingVerificationsService = async (): Promise<TSelectUser[]> => {
  return await db
    .select()
    .from(users)
    .where(eq(users.identityVerificationStatus, "PENDING"))
    .orderBy(desc(users.updatedAt));
};

// ==========================================
// 10. SYSTEM ANALYTICS
// ==========================================
export const getUserStatsService = async () => {
  return await db
    .select({
      role: users.role,
      count: sql<number>`count(${users.id})`,
    })
    .from(users)
    .groupBy(users.role);
};

// ==========================================
// 11. ADMIN: DELETE USER
// ==========================================
export const deleteUserService = async (userId: string): Promise<TSelectUser | undefined> => {
  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.id, userId))
    .returning();
    
  return deletedUser;
};