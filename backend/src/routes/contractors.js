import express from "express";
import {
  getAllContractors,
  getContractorWithVehicles,
  createContractor,
  updateContractor,
  addVehicleToContractor,
  updateVehicle,
  deleteVehicle
} from "../controllers/contractorsController.js";

const router = express.Router();

// Contractors routes
router.get("/", getAllContractors);
router.get("/:contractorId", getContractorWithVehicles);
router.post("/", createContractor);
router.put("/:contractorId", updateContractor);

// Vehicles routes
router.post("/:contractorId/vehicles", addVehicleToContractor);
router.put("/vehicles/:vehicleId", updateVehicle);
router.delete("/vehicles/:vehicleId", deleteVehicle);

export default router;
