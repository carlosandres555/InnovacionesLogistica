import { PrismaClient } from "@prisma/client";
import XLSX from 'xlsx';
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
        where: {},
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

    // Verificar que el upload existe
    const upload = await prisma.sMUpload.findFirst({
      where: {
        id: uploadId,
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
    console.log("📁 Iniciando upload de archivo SM...");

    if (!req.file) {
      console.error("❌ No file provided");
      return res.status(400).json({ error: "No file provided" });
    }

    const fileName = req.file.originalname;
    const buffer = req.file.buffer;

    console.log(`📄 Archivo: ${fileName}, Tamaño: ${buffer.length} bytes`);

    // Leer el archivo Excel
    let workbook;
    try {
      console.log("📖 Leyendo Excel...");
      workbook = XLSX.read(buffer, { type: "buffer" });
      console.log(`✅ Excel leído, hojas encontradas: ${workbook.SheetNames.length}`);
    } catch (error) {
      console.error("❌ Error al leer Excel:", error.message);
      return res.status(400).json({ error: "Formato de archivo inválido. Debe ser un Excel válido." });
    }

    // Obtener la primera hoja
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    console.log(`📋 Hoja seleccionada: ${sheetName}`);

    // Convertir a JSON (con encabezados)
    const data = [];
    let row = 2; // Comenzar desde la fila 2 (después de encabezados)
    const headers = worksheet["A1"]?.v ? Object.keys(worksheet).filter(cell => cell.match(/^[A-Z]+1$/)).map(cell => worksheet[cell]?.v) : [];

    // Leer todas las filas
    for (let i = 2; i <= 10000; i++) {
      const cellA = worksheet[`A${i}`];
      if (!cellA || !cellA.v) break;

      const ruta = worksheet[`B${i}`]?.v?.toString() || "";
      const ciudad = worksheet[`C${i}`]?.v?.toString() || "";

      // Saltar filas de totales (que contienen "Total" en RUTA o CIUDAD vacío)
      if (ruta.toLowerCase().includes("total") || !ciudad) {
        continue;
      }

      const rowData = {
        FECHA: worksheet[`A${i}`]?.v?.toString() || "",
        RUTA: ruta,
        CIUDAD: ciudad,
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

    // Verificar que los numCarga del archivo NUEVO no existan en uploads anteriores
    console.log(`🔍 Verificando que numCarga no existan en BD...`);
    const cargaNumbers = [...new Set(processedData.map(d => d["# CARGA"]))]; // Números únicos en el archivo
    const existingCargas = [];

    for (const carga of cargaNumbers) {
      const existingRecord = await prisma.sMDetail.findFirst({
        where: { numCarga: carga },
      });
      if (existingRecord) {
        existingCargas.push(carga);
      }
    }

    if (existingCargas.length > 0) {
      console.error(`❌ Cargas duplicadas encontradas: ${existingCargas.join(", ")}`);
      return res.status(409).json({
        error: `Los siguientes números de carga ya existen en el sistema (fueron subidos anteriormente): ${existingCargas.join(", ")}. No se puede subir el mismo archivo dos veces.`,
      });
    }

    console.log(`✅ Validación completada, listo para guardar ${processedData.length} registros`);

    // Crear el registro de upload
    try {
      console.log(`📊 Guardando ${processedData.length} registros en BD...`);

      const smUpload = await prisma.sMUpload.create({
        data: {
          fileName,
          companyId: req.user.companyId || null,
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

      console.log(`✅ Archivo procesado exitosamente: ${smUpload.id}`);

      res.status(201).json({
        message: "Archivo procesado exitosamente",
        upload: smUpload,
      });
    } catch (dbError) {
      console.error("❌ Error en BD:", dbError);

      // Si es error de duplicado
      if (dbError.code === "P2002") {
        return res.status(409).json({
          error: "El número de carga ya existe en el sistema",
        });
      }

      throw dbError;
    }
  } catch (error) {
    console.error("❌ Error general:", error);
    next(error);
  }
};

// Get all SM details for tráfico (with filters)
export const getTraficoData = async (req, res, next) => {
  try {
    const { fecha, ruta, ciudad, codCliente, nombreCliente, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const filters = {};

    if (fecha) filters.fecha = fecha;
    if (ruta) filters.ruta = { contains: ruta, mode: "insensitive" };
    if (ciudad) filters.ciudad = { contains: ciudad, mode: "insensitive" };
    if (codCliente) filters.codCliente = { contains: codCliente, mode: "insensitive" };
    if (nombreCliente) filters.nombreCliente = { contains: nombreCliente, mode: "insensitive" };

    const [details, total, progressByRoute] = await Promise.all([
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
          deliveryStatus: {
            select: {
              id: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { fecha: "desc" },
      }),
      prisma.sMDetail.count({ where: filters }),
      // Calcular progreso por numCarga
      prisma.sMDetail.groupBy({
        by: ["numCarga"],
        where: filters,
        _count: {
          id: true,
        },
      }).then(async (groups) => {
        const progressMap = {};

        for (const group of groups) {
          const withStatus = await prisma.sMDetail.count({
            where: {
              numCarga: group.numCarga,
              ...filters,
              deliveryStatus: {
                isNot: null,
              },
            },
          });

          const total = group._count.id;
          progressMap[group.numCarga] = {
            total,
            asignadas: withStatus,
            porcentaje: total > 0 ? Math.round((withStatus / total) * 100) : 0,
          };
        }

        return progressMap;
      }),
    ]);

    res.json({
      details,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      progressByRoute,
    });
  } catch (error) {
    next(error);
  }
};
