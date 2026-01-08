import { Router } from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationCode, // Renamed to match the new controller
  forgotPassword,
  resetPassword,
} from "./Auth.controller"; // Use './' if they are in the same folder

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

export default AuthRouter;