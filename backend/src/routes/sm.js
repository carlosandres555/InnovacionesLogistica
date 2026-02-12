import express from "express";
import multer from "multer";
import {
  getSMUploads,
  getSMDetails,
  uploadSMFile,
  getTraficoData,
} from "../controllers/smController.js";

const router = express.Router();

// Configurar multer para manejo de archivos
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Solo aceptar archivos Excel
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos Excel (.xlsx, .xls)"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// GET - Obtener todos los uploads de SM
router.get("/uploads", getSMUploads);

// GET - Obtener detalles de un upload específico
router.get("/uploads/:uploadId/details", getSMDetails);

// POST - Subir archivo SM
router.post("/upload", upload.single("file"), uploadSMFile);

// GET - Obtener datos para módulo de Tráfico
router.get("/trafico", getTraficoData);

export default router;
