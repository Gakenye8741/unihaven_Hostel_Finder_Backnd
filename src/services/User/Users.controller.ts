import { RequestHandler } from "express";
import {
  getUserByIdService,
  submitVerificationDocsService,
  linkCaretakerToOwnerService,
  adminVerifyIdentityService,
  updateAccountStatusService,
  getAllUsersService,
  updateProfileService, 
  getMyCaretakersService,
  getPendingVerificationsService,
  getUserStatsService,
  deleteUserService // 🛰️ Service now active
} from "./Users.service";
import {
  updateProfileSchema,
  identityVerificationSchema,
  adminVerifySchema,
  accountStatusSchema,
} from "../../validators/User.validator";

// --------------------------- 1. GET USER BY ID ---------------------------
export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);
    if (!user) {
      res.status(404).json({ error: "User not found. 🔍" });
      return;
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 2. SUBMIT VERIFICATION DOCS ---------------------------
export const submitIDDocuments: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id; 
    if (!userId) {
      res.status(401).json({ error: "Unauthorized. Please log in. 🔑" });
      return;
    }

    const parseResult = identityVerificationSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return;
    }

    const updated = await submitVerificationDocsService(userId, parseResult.data);
    res.status(200).json({ message: "Documents submitted for review 📄", data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 3. OWNER: LINK CARETAKER ---------------------------
export const linkCaretaker: RequestHandler = async (req, res) => {
  try {
    const ownerId = (req as any).user?.id;
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Caretaker email is required 📧" });
      return;
    }

    const linked = await linkCaretakerToOwnerService(ownerId, email);
    if (!linked) {
      res.status(404).json({ error: "User with that email not found or link failed. 🔍" });
      return;
    }

    res.status(200).json({ message: "Caretaker claimed successfully 🤝", data: linked });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 4. ADMIN: VERIFY IDENTITY ---------------------------
export const verifyUserIdentity: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const parseResult = adminVerifySchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return;
    }

    const { status, targetRole, remarks } = parseResult.data;
    const updated = await adminVerifyIdentityService(id, status, targetRole, remarks);
    
    res.status(200).json({ message: `Verification ${status} successfully ✅`, data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 5. ADMIN: UPDATE ACCOUNT STATUS ---------------------------
export const setAccountStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const parseResult = accountStatusSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return;
    }

    const updated = await updateAccountStatusService(id, parseResult.data.status);
    res.status(200).json({ message: `Account status updated to ${parseResult.data.status} 🛡️`, data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 6. ADMIN: LIST ALL USERS ---------------------------
export const listAllUsers: RequestHandler = async (req, res) => {
  try {
    const allUsers = await getAllUsersService();
    res.status(200).json(allUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 7. UPDATE PROFILE (SELF) ---------------------------
export const updateMyProfile: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized. ❌" });
        return;
    }

    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return;
    }

    const updated = await updateProfileService(userId, parseResult.data);
    res.status(200).json({ message: "Profile updated successfully ✨", data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 8. ADMIN: UPDATE ANY USER ---------------------------
export const adminUpdateUser: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const parseResult = updateProfileSchema.safeParse(req.body); 
      
      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.issues });
        return;
      }
  
      // Explicitly calling service with validated data including role
      const updated = await updateProfileService(id, parseResult.data);
      res.status(200).json({ message: "User data synchronized by Admin 🛰️", data: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

// --------------------------- 9. ADMIN: DELETE USER ---------------------------
export const deleteUser: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      // 🗑️ Hard deletion protocol triggered
      const deleted = await deleteUserService(id); 
      
      if (!deleted) {
        res.status(404).json({ error: "User node not found for deletion. 🔍" });
        return;
      }

      res.status(200).json({ message: "User deleted successfully 🗑️", data: deleted });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

// --------------------------- 10. OWNER: GET MY CARETAKERS ---------------------------
export const listMyStaff: RequestHandler = async (req, res) => {
  try {
    const ownerId = (req as any).user?.id;
    const caretakers = await getMyCaretakersService(ownerId);
    res.status(200).json(caretakers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 11. ADMIN: PENDING QUEUE ---------------------------
export const listPendingVerifications: RequestHandler = async (req, res) => {
  try {
    const queue = await getPendingVerificationsService();
    res.status(200).json(queue);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------- 12. ADMIN: GET USER STATS ---------------------------
export const getSystemUserStats: RequestHandler = async (req, res) => {
  try {
    const stats = await getUserStatsService();
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

