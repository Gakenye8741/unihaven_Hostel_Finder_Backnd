import { Router } from "express";
import {
  getUserProfile,
  submitIDDocuments,
  linkCaretaker,
  verifyUserIdentity,
  setAccountStatus,
  listAllUsers,
  updateMyProfile,
  listMyStaff,
  listPendingVerifications,
  getSystemUserStats,
  adminUpdateUser, // 🆕 Added from updated controller
  deleteUser,      // 🆕 Added from updated controller
} from "./Users.controller";
import { 
  managementAuth, 
  allAuth,
  adminAuth 
} from "../../middleware/AuthBearer";

const UserRouter = Router();

// ========================== SELF-SERVICE ROUTES (Authenticated Users) ==========================

/**
 * PROFILE: View own or public profile
 */
UserRouter.get("/profile/:id", allAuth, getUserProfile);

/**
 * UPDATE: Update own display name, bio, avatar
 */
UserRouter.patch("/update-me", allAuth, updateMyProfile);

/**
 * VERIFY: Submit ID documents for role promotion
 */
UserRouter.post("/submit-id", allAuth, submitIDDocuments);

// ========================== MANAGEMENT ROUTES (Owners/Caretakers) ==========================

/**
 * LINK: Owner claims a staff member via email
 */
UserRouter.post("/claim-staff", managementAuth, linkCaretaker);

/**
 * TEAM: List caretakers managed by current owner
 */
UserRouter.get("/my-staff", managementAuth, listMyStaff);

// ========================== ADMIN ROUTES (Super-Admins Only) ==========================

/**
 * 🆕 UPDATE USER: Admin manually corrects any user's profile details
 * This fixes the "Cannot PATCH /api/users/admin/update-user/..." error.
 */
UserRouter.patch("/admin/update-user/:id", adminAuth, adminUpdateUser);

/**
 * 🆕 DELETE: Permanent removal of a user account
 */
UserRouter.delete("/admin/delete/:id", adminAuth, deleteUser);

/**
 * QUEUE: View users awaiting identity approval
 */
UserRouter.get("/admin/pending", adminAuth, listPendingVerifications);

/**
 * APPROVE/REJECT: Review docs and promote user roles
 */
UserRouter.patch("/admin/verify-user/:id", adminAuth, verifyUserIdentity);

/**
 * MODERATE: Manual status override (BAN, SUSPEND, ACTIVE)
 */
UserRouter.patch("/admin/account-status/:id", adminAuth, setAccountStatus);

/**
 * LIST ALL: Complete user database overview
 */
UserRouter.get("/admin/all-users", adminAuth, listAllUsers);

/**
 * ANALYTICS: System-wide user statistics
 */
UserRouter.get("/admin/stats", adminAuth, getSystemUserStats);

export default UserRouter;