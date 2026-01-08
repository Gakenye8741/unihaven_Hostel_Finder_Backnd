import db from "../drizzle/db";
import { eq, and, gt } from "drizzle-orm";
import { TSelectUsers, TInsertUsers, users } from "../drizzle/schema";
import crypto from "crypto";

// --------------------------- USER RETRIEVAL ---------------------------

export const getUserByEmailService = async (email: string): Promise<TSelectUsers | undefined> => {
  return await db.query.users.findFirst({
    where: eq(users.email, email),
  });
};

export const getUserByIdService = async (id: string): Promise<TSelectUsers | undefined> => {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
  });
};

// --------------------------- REGISTRATION & VERIFICATION ---------------------------

export const registerUserService = async (user: TInsertUsers): Promise<TSelectUsers> => {
  const [newUser] = await db.insert(users).values(user).returning();
  if (!newUser) throw new Error("Failed to create user");
  return newUser;
};

/**
 * Generates a 6-digit OTP for email verification
 */
export const generateAndSetNewConfirmationCode = async (email: string): Promise<string> => {
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();

  const result = await db
    .update(users)
    .set({ 
      confirmationCode: newCode,
      confirmationCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      updatedAt: new Date(),
    })
    .where(eq(users.email, email))
    .returning();

  if (result.length === 0) throw new Error("User not found");
  return newCode;
};

/**
 * Atomic verification: checks code, expiry, and activates user in one query.
 * This prevents replay attacks.
 */
export const verifyAndActivateEmailService = async (email: string, code: string): Promise<boolean> => {
  const result = await db
    .update(users)
    .set({
      emailVerified: true,
      confirmationCode: null, // Clear after use
      confirmationCodeExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(users.email, email),
        eq(users.confirmationCode, code),
        gt(users.confirmationCodeExpiresAt, new Date()) // Must not be expired
      )
    )
    .returning();

  return result.length > 0;
};

// --------------------------- FORGOT PASSWORD FLOW ---------------------------

/**
 * Creates a long-form secure token for unauthenticated password resets.
 */
export const initiatePasswordResetService = async (email: string): Promise<string | null> => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  const result = await db
    .update(users)
    .set({
      resetPasswordToken: resetToken,
      resetPasswordExpiresAt: expiry,
      updatedAt: new Date(),
    })
    .where(eq(users.email, email))
    .returning();

  // We return null if user doesn't exist so the controller can 
  // handle "silent failures" (security best practice)
  return result.length > 0 ? resetToken : null;
};

/**
 * Resets password using the secret token.
 */
export const resetPasswordWithTokenService = async (token: string, newPasswordHash: string): Promise<void> => {
  const result = await db
    .update(users)
    .set({
      passwordHash: newPasswordHash,
      resetPasswordToken: null, // Wipe token
      resetPasswordExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(users.resetPasswordToken, token),
        gt(users.resetPasswordExpiresAt, new Date())
      )
    )
    .returning();

  if (result.length === 0) throw new Error("Invalid or expired reset link.");
};

// --------------------------- ACCOUNT MANAGEMENT ---------------------------

export const updateUserPasswordService = async (email: string, newPasswordHash: string): Promise<void> => {
  const result = await db
    .update(users)
    .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
    .where(eq(users.email, email))
    .returning();

  if (result.length === 0) throw new Error("User not found");
};