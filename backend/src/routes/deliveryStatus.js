import express from "express";
import {
  getDeliveryStatuses,
  createDeliveryStatus,
  updateEntregaDeliveryStatus,
  getEntregaDeliveryStatus,
} from "../controllers/deliveryStatusController.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET - Obtener todos los estados disponibles (público para usuarios autenticados)
router.get("/", getDeliveryStatuses);

// GET - Obtener estado de una entrega específica
router.get("/entrega/:entregaId", getEntregaDeliveryStatus);

// POST - Crear nuevo estado (admin only)
router.post("/", requireRole("ADMIN"), createDeliveryStatus);

// PUT - Actualizar estado de una entrega
router.put("/entrega/:entregaId", updateEntregaDeliveryStatus);

export default router;
