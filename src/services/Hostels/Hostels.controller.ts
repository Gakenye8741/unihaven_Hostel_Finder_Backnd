import { RequestHandler } from "express";
import {
  createHostelService,
  getHostelsService,
  getHostelByIdService,
  updateHostelService,
  deleteHostelService,
  toggleHostelVerificationService,
} from "./Hostels.service";
import { createHostelSchema, updateHostelSchema } from "../../validators/Hostel.validator";
import { sendNotificationEmail } from "../../middleware/GoogleMailer";

// --------------------------- 1. CREATE HOSTEL ---------------------------
export const addHostel: RequestHandler = async (req, res) => {
  try {
    // Role Check: Ensure the person logged in is actually an Owner or Admin
    const userRole = req.user?.role; 
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const username = req.user?.username;

    if (userRole !== "Owner" && userRole !== "Admin") {
      res.status(403).json({ error: "Access Denied: Only Owners can list hostels. 🏠" });
      return;
    }

    const parseResult = createHostelSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return;
    }

    // Force the ownerId to be the logged-in user's ID (Security best practice)
    const hostelData = { ...parseResult.data, ownerId: userId };
    const hostel = await createHostelService(hostelData as any);

    // Send Confirmation Email
    if (userEmail) {
      const subject = `🏠 Listing Confirmed: ${hostel.name}`;
      const emailMessage = `
        Hello <strong>${username}</strong>,<br><br>
        Your hostel <strong>${hostel.name}</strong> is now live on Unihaven!<br><br>
        Our team will review your details shortly to issue your <strong>Verification Badge</strong>.
      `;
      await sendNotificationEmail(userEmail, subject, username ?? null,emailMessage, undefined, "welcome");
    }

    res.status(201).json({ message: "Hostel listed successfully! 🎉", hostel });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to add hostel" });
  }
};

// --------------------------- 2. LIST HOSTELS (Public) ---------------------------
export const listHostels: RequestHandler = async (req, res) => {
  try {
    const { campus, policy, search } = req.query;
    
    const allHostels = await getHostelsService({
      campus: campus as string,
      policy: policy as "Male Only" | "Female Only" | "Mixed",
      search: search as string,
    });

    res.status(200).json(allHostels);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 3. GET SINGLE HOSTEL ---------------------------
export const getHostelDetails: RequestHandler = async (req, res) => {
  try {
    const hostel = await getHostelByIdService(req.params.id);
    if (!hostel) {
      res.status(404).json({ error: "Hostel not found. 🔍" });
      return;
    }
    res.status(200).json(hostel);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 4. UPDATE HOSTEL ---------------------------
export const updateHostel: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
       res.status(401).json({ error: "Unauthorized" });
       return;
    }

    const parseResult = updateHostelSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return;
    }

    // Service logic handles checking if this userId owns the hostel
    const updated = await updateHostelService(id, userId, parseResult.data);
    res.status(200).json({ message: "Hostel updated successfully 🏠", updated });
  } catch (error: any) {
    const status = error.message.includes("Unauthorized") ? 403 : 500;
    res.status(status).json({ error: error.message });
  }
};

// --------------------------- 5. DELETE HOSTEL ---------------------------
export const deleteHostel: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id as string;
    const userRole = req.user?.role as string;

    // Admin can delete any, Owner can only delete their own
    const result = await deleteHostelService(id, userId, userRole);
    res.status(200).json(result);
  } catch (error: any) {
    const status = error.message.includes("Unauthorized") ? 403 : 500;
    res.status(status).json({ error: error.message });
  }
};

// --------------------------- 6. ADMIN: VERIFY HOSTEL ---------------------------
export const verifyHostel: RequestHandler = async (req, res) => {
  try {
    if (req.user?.role !== "Admin") {
      res.status(403).json({ error: "Only Admins can verify hostels. 🛡️" });
      return;
    }

    const { id } = req.params;
    const { status } = req.body; 

    const updated = await toggleHostelVerificationService(id, status);
    res.status(200).json({ message: `Hostel verification set to ${status}`, updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};