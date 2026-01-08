import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  getUserByEmailService,
  registerUserService,
  generateAndSetNewConfirmationCode,
  initiatePasswordResetService,
  resetPasswordWithTokenService,
  verifyAndActivateEmailService,
} from "./Auth.service";
import { sendNotificationEmail } from "../middleware/GoogleMailer";
import { 
  registerUserSchema, 
  loginUserSchema, 
  verifyEmailSchema, 
  generateConfirmationCodeSchema 
} from "../validators/auth.validator";

// --------------------------- HELPERS ---------------------------

const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined in environment variables!");
  return secret;
};

/**
 * Reusable HTML component for buttons in emails
 */
const emailButton = (label: string, url: string) => `
  <div style="text-align: center; margin: 30px 0;">
    <a href="${url}" style="background-color: #4F46E5; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
      ${label}
    </a>
  </div>`;

/**
 * Reusable HTML component for OTP code display
 */
const otpDisplay = (code: string) => `
  <div style="background: #F3F4F6; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center; border: 1px dashed #D1D5DB;">
    <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #4F46E5;">
      ${code}
    </span>
  </div>`;

// --------------------------- CONTROLLERS ---------------------------

export const registerUser: RequestHandler = async (req, res) => {
  try {
    const validatedData = registerUserSchema.parse(req.body);

    const existingUser = await getUserByEmailService(validatedData.email);
    if (existingUser) {
      res.status(400).json({ message: "An account with this email already exists." });
      return;
    }

    // Hash password and prepare OTP
    const hashedPassword = await bcrypt.hash(validatedData.passwordHash!, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await registerUserService({
      ...validatedData,
      passwordHash: hashedPassword,
      confirmationCode: code,
      confirmationCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      emailVerified: false,
    });

    // Send Verification Email
    await sendNotificationEmail(
      newUser.email,
      "Verify Your Unihaven Account",
      newUser.fullName,
      "Welcome to Unihaven! We're excited to have you. Please use the verification code below to activate your account. This code expires in 10 minutes.",
      otpDisplay(code),
      "verification"
    );

    res.status(201).json({ message: "Registration successful. Please check your email for the verification code." });
  } catch (error: any) {
    res.status(error.name === "ZodError" ? 400 : 500).json({ error: error.message || "Registration failed" });
  }
};

export const loginUser: RequestHandler = async (req, res) => {
  try {
    const { email, passwordHash } = loginUserSchema.parse(req.body);

    const user = await getUserByEmailService(email);
    if (!user || !user.passwordHash || !(await bcrypt.compare(passwordHash, user.passwordHash))) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    if (!user.emailVerified) {
      res.status(403).json({ message: "Please verify your email address before logging in." });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      getJWTSecret(),
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role }
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const verifyEmail: RequestHandler = async (req, res) => {
  try {
    const { email, confirmationCode } = verifyEmailSchema.parse(req.body);

    const isVerified = await verifyAndActivateEmailService(email, confirmationCode);
    if (!isVerified) {
      res.status(400).json({ message: "Invalid or expired verification code." });
      return;
    }

    // Send Welcome Email
    await sendNotificationEmail(
      email,
      "Account Verified",
      null,
      "Your account has been successfully verified! You can now explore, book, and manage hostel listings on Unihaven.",
      emailButton("Go to Dashboard", `${process.env.FRONTEND_URL}/dashboard`),
      "welcome"
    );

    res.status(200).json({ message: "Email verified successfully." });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const resendVerificationCode: RequestHandler = async (req, res) => {
  try {
    const { email } = generateConfirmationCodeSchema.parse(req.body);
    const user = await getUserByEmailService(email);

    if (!user || user.emailVerified) {
      res.status(400).json({ message: "Request invalid or account already verified." });
      return;
    }

    const newCode = await generateAndSetNewConfirmationCode(email);
    
    await sendNotificationEmail(
      email,
      "New Verification Code",
      user.fullName,
      "Here is your new verification code. Please use it within the next 10 minutes.",
      otpDisplay(newCode),
      "verification"
    );

    res.status(200).json({ message: "New verification code sent." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- FORGOT PASSWORD ---------------------------
export const forgotPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = generateConfirmationCodeSchema.parse(req.body);
    const resetToken = await initiatePasswordResetService(email);

    if (resetToken) {
      // Logic: Use the ENV variable, but fallback to localhost:5173 if it's missing
      const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

      const buttonHtml = emailButton("Reset Password", resetUrl);

      await sendNotificationEmail(
        email,
        "Reset Your Password",
        null, // name
        "We received a request to reset your password. Click the button below to set a new one. This link expires in 1 hour.",
        buttonHtml,
        "password-reset"
      );
    }

    res.status(200).json({ 
      message: "If an account exists, a reset link has been sent." 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const resetPassword: RequestHandler = async (req, res) => {
  try {
    const { token, newPassword } = req.body; // Add a Zod schema for this if needed
    if (!token || !newPassword) {
      res.status(400).json({ message: "Token and new password are required." });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await resetPasswordWithTokenService(token, hashedPassword);

    res.status(200).json({ message: "Password updated successfully. You can now log in." });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};