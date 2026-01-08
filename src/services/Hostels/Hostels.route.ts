import { Router } from "express";
import { 
  addHostel, 
  listHostels, 
  getHostelDetails, 
  updateHostel, 
  deleteHostel, 
  verifyHostel 
} from "./Hostels.controller";
import { 
  authMiddleware, 
  ownerOrAdminAuth, 
  managementAuth, 
  allAuth 
} from "../../middleware/AuthBearer"

const HostelRouter = Router();

// ========================== PUBLIC ROUTES ==========================
// Students can search and view hostels without logging in
HostelRouter.get("/", listHostels);
HostelRouter.get("/:id", getHostelDetails);

// ========================== PROTECTED ROUTES ==========================

/**
 * CREATE: Only Owners and Admins can create a new hostel listing.
 */
HostelRouter.post("/", ownerOrAdminAuth, addHostel);

/**
 * UPDATE: Owners, Caretakers, and Admins can update hostel details.
 * We use 'managementAuth' which we defined as ["Admin", "Owner", "Caretaker"]
 */
HostelRouter.patch("/:id", managementAuth, updateHostel);

/**
 * DELETE: Only the Owner or an Admin can delete a hostel.
 * Caretakers are excluded from this to protect the Owner's business.
 */
HostelRouter.delete("/:id", ownerOrAdminAuth, deleteHostel);

/**
 * VERIFY: Only Admins can toggle the verification status.
 */
HostelRouter.patch("/verify/:id", authMiddleware(["Admin"]), verifyHostel);

export default HostelRouter;