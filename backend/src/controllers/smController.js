import { PrismaClient } from "@prisma/client";
import { readFile } from 'xlsx';
import { z } from "zod";

const prisma = new PrismaClient();

// Validador Zod para estructura del Excel
const SMDetailSchema = z.object({
  FECHA: z.string().min(1, "FECHA es requerido"),
  RUTA: z.string().min(1, "RUTA es requerido"),
  CIUDAD: z.string().min(1, "CIUDAD es requerido"),
  CARGAS: z.string().min(1, "CARGAS es requerido"),
  NOMBRE_CLIENTE: z.string().min(1, "NOMBRE_CLIENTE es requerido"),
  COD_CLIENTE: z.string().min(1, "COD_CLIENTE es requerido"),
  SECUENCIA: z.string().min(1, "SECUENCIA es requerido"),
  Alquería: z.number().optional().default(0),
  Yogurt: z.number().optional().default(0),
  Quesos: z.number().optional().default(0),
  "Total general": z.number().optional().default(0),
  "# CARGA": z.string().min(1, "# CARGA es requerido"),
  "ORDEN DE COMBRA": z.string().optional().nullable(),
});

// Convertir tipo de dato automáticamente
const coerceValue = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Get all SM uploads with details
export const getSMUploads = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [uploads, total] = await Promise.all([
      prisma.sMUpload.findMany({
        where: { companyId: req.user.companyId },
        select: {
          id: true,
          fileName: true,
          status: true,
          totalRecords: true,
          errorMessage: true,
          uploadedBy: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.sMUpload.count({ where: { companyId: req.user.companyId } }),
    ]);

    res.json({
      uploads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get SM details by upload ID
export const getSMDetails = async (req, res, next) => {
  try {
    const { uploadId } = req.params;
    const { page = 1, limit = 20, fecha, ruta, ciudad } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verificar que el upload pertenece a la compañía del usuario
    const upload = await prisma.sMUpload.findFirst({
      where: {
        id: uploadId,
        companyId: req.user.companyId,
      },
    });

    if (!upload) {
      return res.status(404).json({ error: "Upload no encontrado" });
    }

    // Construir filtros
    const filters = { smUploadId: uploadId };
    if (fecha) filters.fecha = fecha;
    if (ruta) filters.ruta = { contains: ruta, mode: "insensitive" };
    if (ciudad) filters.ciudad = { contains: ciudad, mode: "insensitive" };

    const [details, total] = await Promise.all([
      prisma.sMDetail.findMany({
        where: filters,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.sMDetail.count({ where: filters }),
    ]);

    res.json({
      details,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Process and upload SM Excel file
export const uploadSMFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const fileName = req.file.originalname;
    const buffer = req.file.buffer;

    // Leer el archivo Excel
    let workbook;
    try {
      workbook = readFile(buffer, { type: "buffer" });
    } catch (error) {
      return res.status(400).json({ error: "Formato de archivo inválido. Debe ser un Excel válido." });
    }

    // Obtener la primera hoja
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convertir a JSON (con encabezados)
    const data = [];
    let row = 2; // Comenzar desde la fila 2 (después de encabezados)
    const headers = worksheet["A1"]?.v ? Object.keys(worksheet).filter(cell => cell.match(/^[A-Z]+1$/)).map(cell => worksheet[cell]?.v) : [];

    // Leer todas las filas
    for (let i = 2; i <= 10000; i++) {
      const cellA = worksheet[`A${i}`];
      if (!cellA || !cellA.v) break;

      const rowData = {
        FECHA: worksheet[`A${i}`]?.v?.toString() || "",
        RUTA: worksheet[`B${i}`]?.v?.toString() || "",
        CIUDAD: worksheet[`C${i}`]?.v?.toString() || "",
        CARGAS: worksheet[`D${i}`]?.v?.toString() || "",
        NOMBRE_CLIENTE: worksheet[`E${i}`]?.v?.toString() || "",
        COD_CLIENTE: worksheet[`F${i}`]?.v?.toString() || "",
        SECUENCIA: worksheet[`G${i}`]?.v?.toString() || "",
        Alquería: coerceValue(worksheet[`H${i}`]?.v),
        Yogurt: coerceValue(worksheet[`I${i}`]?.v),
        Quesos: coerceValue(worksheet[`J${i}`]?.v),
        "Total general": coerceValue(worksheet[`K${i}`]?.v),
        "# CARGA": worksheet[`L${i}`]?.v?.toString() || "",
        "ORDEN DE COMBRA": worksheet[`M${i}`]?.v?.toString() || "",
      };

      data.push(rowData);
    }

    if (data.length === 0) {
      return res.status(400).json({ error: "El archivo no contiene datos." });
    }

    // Validar estructura
    const validationErrors = [];
    const processedData = [];

    for (let i = 0; i < data.length; i++) {
      try {
        const validated = SMDetailSchema.parse(data[i]);
        processedData.push(validated);
      } catch (error) {
        validationErrors.push({
          row: i + 2,
          errors: error.errors.map(e => `${e.path.join(".")}: ${e.message}`),
        });
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "El archivo no cumple con la estructura requerida",
        details: validationErrors.slice(0, 5), // Mostrar primeros 5 errores
        totalErrors: validationErrors.length,
      });
    }

    // Verificar duplicados de # CARGA
    const cargaNumbers = processedData.map(d => d["# CARGA"]);
    const duplicateCarga = new Set();

    for (const carga of cargaNumbers) {
      const existingCarga = await prisma.sMDetail.findFirst({
        where: { numCarga: carga },
      });
      if (existingCarga) {
        duplicateCarga.add(carga);
      }
    }

    if (duplicateCarga.size > 0) {
      return res.status(409).json({
        error: `El(los) siguiente(s) número(s) de carga ya existe(n) en el sistema: ${Array.from(duplicateCarga).join(", ")}`,
      });
    }

    // Crear el registro de upload
    const smUpload = await prisma.sMUpload.create({
      data: {
        fileName,
        companyId: req.user.companyId,
        uploadedById: req.user.id,
        status: "completed",
        totalRecords: processedData.length,
        details: {
          createMany: {
            data: processedData.map(detail => ({
              fecha: detail.FECHA,
              ruta: detail.RUTA,
              ciudad: detail.CIUDAD,
              cargas: detail.CARGAS,
              nombreCliente: detail.NOMBRE_CLIENTE,
              codCliente: detail.COD_CLIENTE,
              secuencia: detail.SECUENCIA,
              alqueria: detail.Alquería,
              yogurt: detail.Yogurt,
              quesos: detail.Quesos,
              totalGeneral: detail["Total general"],
              numCarga: detail["# CARGA"],
              ordenCompra: detail["ORDEN DE COMBRA"] || null,
            })),
          },
        },
      },
      select: {
        id: true,
        fileName: true,
        status: true,
        totalRecords: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: "Archivo procesado exitosamente",
      upload: smUpload,
    });
  } catch (error) {
    // Si es error de duplicado
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "El número de carga ya existe en el sistema",
      });
    }
    next(error);
  }
};

// Get all SM details for tráfico (with filters)
export const getTraficoData = async (req, res, next) => {
  try {
    const { fecha, ruta, ciudad, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const filters = {
      smUpload: {
        companyId: req.user.companyId,
      },
    };

    if (fecha) filters.fecha = fecha;
    if (ruta) filters.ruta = { contains: ruta, mode: "insensitive" };
    if (ciudad) filters.ciudad = { contains: ciudad, mode: "insensitive" };

    const [details, total] = await Promise.all([
      prisma.sMDetail.findMany({
        where: filters,
        include: {
          smUpload: {
            select: {
              id: true,
              fileName: true,
              createdAt: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { fecha: "desc" },
      }),
      prisma.sMDetail.count({ where: filters }),
    ]);

    res.json({
      details,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};
