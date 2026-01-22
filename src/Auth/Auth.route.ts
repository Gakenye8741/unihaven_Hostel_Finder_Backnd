import { Router } from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
  changePassword, // <--- New controller imported
} from "./Auth.controller";
import { allAuth } from "../middleware/AuthBearer";


const AuthRouter = Router();

// --------------------------- AUTH ROUTES ---------------------------

/**
 * @route   POST /auth/register
 * @desc    Register a new user and send verification OTP
 */
AuthRouter.post("/register", registerUser);

/**
 * @route   POST /auth/login
 * @desc    Authenticate user & return JWT token
 */
AuthRouter.post("/login", loginUser);

/**
 * @route   POST /auth/verify-email
 * @desc    Verify email using 6-digit OTP
 */
AuthRouter.post("/verify-email", verifyEmail);

/**
 * @route   POST /auth/resend-verification
 * @desc    Generate and send a fresh OTP
 */
AuthRouter.post("/resend-verification", resendVerificationCode);

/**
 * @route   POST /auth/forgot-password
 * @desc    Send password reset link via email
 */
AuthRouter.post("/forgot-password", forgotPassword);

/**
 * @route   POST /auth/reset-password
 * @desc    Update password using secret token from email
 */
AuthRouter.post("/reset-password", resetPassword);

/**
 * @route   PATCH /auth/change-password
 * @desc    Change password for authenticated user (requires current password)
 * @access  Private (Authenticated)
 */
AuthRouter.patch("/change-password", allAuth, changePassword);

export default AuthRouter;