import { RequestHandler } from "express";
import {
  createAmenityService,
  getAllAmenitiesService,
  updateGlobalAmenityService,
  deleteGlobalAmenityService,
  getHostelAmenitiesService,
  syncHostelAmenitiesService,
  addSingleAmenityToHostelService,
  removeSingleAmenityFromHostelService,
} from "./Amenities.service";
import { 
  createAmenitySchema, 
  updateAmenitySchema, 
  syncHostelAmenitiesSchema, 
  singleAmenitySchema 
} from "../../validators/Amenity.validator";

// ==========================================
// 1. GLOBAL AMENITIES (Catalog)
// ==========================================

export const addAmenity: RequestHandler = async (req, res) => {
  try {
    const parseResult = createAmenitySchema.shape.body.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
      return;
    }

    const amenity = await createAmenityService(parseResult.data);
    res.status(201).json({ message: "Amenity added successfully! ✨", amenity });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to add amenity" });
  }
};

export const listAmenities: RequestHandler = async (req, res) => {
  try {
    const allAmenities = await getAllAmenitiesService();
    res.status(200).json(allAmenities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAmenity: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const parseResult = updateAmenitySchema.shape.body.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
      return;
    }

    const updated = await updateGlobalAmenityService(id as string, parseResult.data);
    if (!updated) {
      res.status(404).json({ error: "Amenity not found" });
      return;
    }

    res.status(200).json({ message: "Amenity updated successfully", updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAmenity: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteGlobalAmenityService(id as string);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getHostelAmenities: RequestHandler = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const data = await getHostelAmenitiesService(hostelId as string);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const syncAmenities: RequestHandler = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const parseResult = syncHostelAmenitiesSchema.shape.body.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
      return;
    }

    const result = await syncHostelAmenitiesService(hostelId as string, parseResult.data.amenityIds);
    res.status(200).json({ message: "Hostel amenities updated successfully! 🔄", count: result.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addHostelAmenity: RequestHandler = async (req, res) => {
  try {
    const { hostelId, amenityId } = req.params;
    const result = await addSingleAmenityToHostelService(hostelId as string, amenityId as string);
    res.status(201).json({ message: "Amenity linked! ✅", result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const removeHostelAmenity: RequestHandler = async (req, res) => {
  try {
    const { hostelId, amenityId } = req.params;
    const result = await removeSingleAmenityFromHostelService(hostelId as string, amenityId as string);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};