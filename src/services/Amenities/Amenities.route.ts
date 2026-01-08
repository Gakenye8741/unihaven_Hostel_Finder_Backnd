import { Router } from "express";
import {
    addAmenity,
    listAmenities,
    updateAmenity,
    deleteAmenity,
    getHostelAmenities,
    syncAmenities,
    addHostelAmenity,
    removeHostelAmenity
} from "./Amenities.controller";
import { adminAuth, managementAuth } from "../../middleware/AuthBearer";

const AmenityRouter = Router();

// Global Catalog (Admin Only)
AmenityRouter.get('/AllAmenities', listAmenities);
AmenityRouter.post('/CreateAmenity', adminAuth, addAmenity);
AmenityRouter.put('/UpdateAmenity/:id', adminAuth, updateAmenity);
AmenityRouter.delete('/DeleteAmenity/:id', adminAuth, deleteAmenity);

// Hostel Mapping (Owners & Admins)
AmenityRouter.get('/HostelAmenities/:hostelId', getHostelAmenities);
AmenityRouter.put('/SyncHostelAmenities/:hostelId', managementAuth, syncAmenities);
AmenityRouter.post('/AddHostelAmenity/:hostelId/:amenityId', managementAuth, addHostelAmenity);
AmenityRouter.delete('/RemoveHostelAmenity/:hostelId/:amenityId', managementAuth, removeHostelAmenity);

export default AmenityRouter;