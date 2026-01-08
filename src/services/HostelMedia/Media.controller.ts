import { RequestHandler } from "express";
import { 
  addHostelMediaService, 
  updateMediaService, 
  deleteMediaService, 
  getMediaByHostelService 
} from "./Media.service";
import { getHostelByIdService } from "../Hostels/Hostels.service";

// ==========================================
// 1. ADD MEDIA (Bulk Upload)
// ==========================================
export const addHostelMedia: RequestHandler = async (req, res) => {
  try {
    const { hostelId, mediaItems } = req.body; 
    // mediaItems: Array of { url: string, isThumbnail: boolean, type: "Image" | "Video" }

    // Security: Only Owner, Caretaker, or Admin can add photos
    const hostel = await getHostelByIdService(hostelId);
    if (!hostel) {
      res.status(404).json({ error: "Hostel not found" });
      return;
    }

    if (hostel.ownerId !== req.user?.id && req.user?.role !== "Admin" && req.user?.role !== "Caretaker") {
      res.status(403).json({ error: "Unauthorized: You don't manage this hostel" });
      return;
    }

    const formattedMedia = mediaItems.map((item: any) => ({
      ...item,
      hostelId
    }));

    const result = await addHostelMediaService(formattedMedia);
    res.status(201).json({ message: "Media added successfully 📸", result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 2. UPDATE MEDIA (Replace or Set Thumbnail)
// ==========================================
export const updateHostelMedia: RequestHandler = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { hostelId, url, isThumbnail, type } = req.body;

    // Security Check
    const hostel = await getHostelByIdService(hostelId);
    if (hostel?.ownerId !== req.user?.id && req.user?.role !== "Admin" && req.user?.role !== "Caretaker") {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    const updated = await updateMediaService(mediaId, hostelId, { url, isThumbnail, type });
    res.status(200).json({ message: "Media updated successfully", updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 3. GET ALL MEDIA FOR A HOSTEL
// ==========================================
export const getHostelGallery: RequestHandler = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const gallery = await getMediaByHostelService(hostelId);
    res.status(200).json(gallery);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 4. DELETE MEDIA
// ==========================================
export const removeHostelMedia: RequestHandler = async (req, res) => {
  try {
    const { mediaId, hostelId } = req.params;

    // Security Check
    const hostel = await getHostelByIdService(hostelId);
    if (hostel?.ownerId !== req.user?.id && req.user?.role !== "Admin") {
      res.status(403).json({ error: "Unauthorized: Only Owners or Admins can delete media." });
      return;
    }

    const result = await deleteMediaService(mediaId, hostelId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};