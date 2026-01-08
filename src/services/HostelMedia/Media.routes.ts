import { Router } from "express";
import { 
  addHostelMedia, 
  updateHostelMedia, 
  getHostelGallery, 
  removeHostelMedia 
} from "./Media.controller";
import { 
  managementAuth, 
  ownerOrAdminAuth, 
  allAuth 
} from "../../middleware/AuthBearer";

const MediaRouter = Router();

/**
 * ==========================================
 * PUBLIC ROUTES
 * ==========================================
 * Anyone (even guests) should be able to see the 
 * gallery of a hostel before booking.
 */
MediaRouter.get("/:hostelId", getHostelGallery);

/**
 * ==========================================
 * PROTECTED ROUTES (Management)
 * ==========================================
 */

/**
 * UPLOAD: Owners, Caretakers, and Admins can add photos.
 * Expects { hostelId, mediaItems: [] } in body.
 */
MediaRouter.post("/", managementAuth, addHostelMedia);

/**
 * UPDATE: Change a specific photo (e.g., set as thumbnail or replace URL).
 */
MediaRouter.patch("/:mediaId", managementAuth, updateHostelMedia);

/**
 * DELETE: Only the Owner or Admin can permanently remove media.
 * We use /:hostelId/:mediaId to ensure the security check in the controller works.
 */
MediaRouter.delete("/:hostelId/:mediaId", ownerOrAdminAuth, removeHostelMedia);

export default MediaRouter;