import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// ========================== TYPES & INTERFACES ==========================

/**
 * Syncing with Unihaven Drizzle Enum roles
 */
export type UserRole = "Admin" | "Owner" | "Student" | "Caretaker";

export interface DecodedToken {
  id: string; // UUID from your users table
  email: string;
  role: UserRole;
  username?: string;
  exp: number;
  iat?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

// ========================== VERIFY TOKEN ==========================
export const verifyToken = (token: string, secret: string): DecodedToken | null => {
  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;
    return decoded;
  } catch {
    return null;
  }
};

// ========================== AUTH MIDDLEWARE ==========================
export const authMiddleware =
  (allowedRoles: UserRole[] = []) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (process.env.NODE_ENV === "test") return next();

      const authHeader = req.header("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Authorization header is missing or invalid" });
        return;
      }

      const token = authHeader.split(" ")[1];
      const decodedToken = verifyToken(token, process.env.JWT_SECRET as string);
      
      if (!decodedToken) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
      }

      // Check if user has one of the required roles
      if (allowedRoles.length && !allowedRoles.includes(decodedToken.role)) {
        res.status(403).json({ error: "Forbidden: insufficient permissions" });
        return;
      }

      req.user = decodedToken;
      next();
    } catch (error) {
      res.status(500).json({ error: "Internal Authentication error" });
    }
  };

// ========================== ROLE-BASED EXPORTS ==========================

// Single Roles
export const adminAuth = authMiddleware(["Admin"]);
export const ownerAuth = authMiddleware(["Owner"]);
export const studentAuth = authMiddleware(["Student"]);
export const caretakerAuth = authMiddleware(["Caretaker"]);

// Logical Groups
export const ownerOrAdminAuth = authMiddleware(["Admin", "Owner"]);
export const managementAuth = authMiddleware(["Admin", "Owner", "Caretaker"]);
export const allAuth = authMiddleware(["Admin", "Owner", "Student", "Caretaker"]);

// ========================== OPTIONAL AUTH ==========================
export const optionalAuth =
  (allowedRoles: UserRole[] = []) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.header("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
      }

      const token = authHeader.split(" ")[1];
      const decodedToken = verifyToken(token, process.env.JWT_SECRET as string);

      if (decodedToken) {
        if (allowedRoles.length && !allowedRoles.includes(decodedToken.role)) {
          return next();
        }
        req.user = decodedToken;
      }
      
      next();
    } catch {
      next();
    }
  };