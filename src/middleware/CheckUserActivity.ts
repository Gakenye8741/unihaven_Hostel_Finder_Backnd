// import { Request, Response, NextFunction } from "express";
// import { getUserById, isUserActive } from "../services/Users/users.service";


// // Middleware to block suspended users
// export const checkUserActive = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userId = req.user?.id; // assuming user is added to req by auth middleware

//     if (!userId) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     const user = await getUserById(String(userId));


//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Ensure the user object matches the expected shape for isUserActive by providing a non-null username
//     const normalizedUser = { ...user, username: user.username ?? "" };

//     if (!isUserActive(normalizedUser as any)) {
//       return res.status(403).json({
//         error: "Your account is suspended. Please contact support or wait until your suspension period ends.",
//       });
//     }

//     next();
//   } catch (error) {
//     console.error("Error checking user suspension:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };
