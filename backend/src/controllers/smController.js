import { PrismaClient } from "@prisma/client";
import XLSX from 'xlsx';
import { z } from "zod";
import { isFechaToday, isFechaPast, parseFechaString } from '../utils/dateUtils.js';

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

// Convertir número de serie de Excel a fecha en formato "DD-MM-YYYY"
const convertExcelDateToString = (value) => {
  // Si ya es un string de fecha válido, devolverlo
  if (typeof value === 'string' && value.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
    return value;
  }

  // Si es un número (serial de Excel)
  const num = Number(value);
  if (isNaN(num) || num < 0) {
    return value?.toString() || '';
  }

  // Excel serial date: 1 = 1900-01-01
  // Pero Excel tiene un bug y considera 1900 como bisiesto
  // Por lo que hay que ajustar si el serial > 59
  const excelEpoch = new Date(1900, 0, 1);
  const daysToAdd = num - 1; // Restar 1 porque Excel cuenta desde 1
  const date = new Date(excelEpoch.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  // Verificar si es una fecha válida
  if (isNaN(date.getTime())) {
    return value?.toString() || '';
  }

  // Convertir a formato "DD-MM-YYYY"
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() retorna 0-11
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
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
        FECHA: convertExcelDateToString(worksheet[`A${i}`]?.v),
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

// Get all SM details for pending traffic (entregas without status from past dates)
export const getPendienteData = async (req, res, next) => {
  try {
    const { ruta, ciudad, codCliente, nombreCliente, allowedPlates, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const filters = {};

    if (ruta) filters.ruta = { contains: ruta, mode: "insensitive" };
    if (ciudad) filters.ciudad = { contains: ciudad, mode: "insensitive" };
    if (codCliente) filters.codCliente = { contains: codCliente, mode: "insensitive" };
    if (nombreCliente) filters.nombreCliente = { contains: nombreCliente, mode: "insensitive" };

    // Filtro de placas para IN_HOUSE
    if (allowedPlates) {
      const platesArray = allowedPlates.split(',').map(p => p.trim());
      filters.cargas = { in: platesArray };
    }

    // Obtener todos los registros que NO tienen estado asignado
    const allDetails = await prisma.sMDetail.findMany({
      where: {
        ...filters,
        deliveryStatus: null // Sin estado asignado
      },
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
      orderBy: { fecha: "desc" },
    });

    // Filtrar solo registros PASADOS (no de hoy)
    const pendienteDetails = allDetails.filter(d => isFechaPast(d.fecha));

    // Agrupar por numCarga para calcular fechas representadas
    const groupedByNumCarga = {};
    for (const detail of pendienteDetails) {
      if (!groupedByNumCarga[detail.numCarga]) {
        groupedByNumCarga[detail.numCarga] = {
          fechas: new Set(),
          entregas: []
        };
      }
      groupedByNumCarga[detail.numCarga].fechas.add(detail.fecha);
      groupedByNumCarga[detail.numCarga].entregas.push(detail);
    }

    // Convertir Set de fechas a array ordenado descendente
    const detallesProcesados = pendienteDetails.map(d => ({
      ...d,
      fechasRepresentadas: Array.from(groupedByNumCarga[d.numCarga].fechas).sort().reverse()
    }));

    // Aplicar paginación después de filtrar
    const paginatedDetails = detallesProcesados.slice(skip, skip + parseInt(limit));

    res.json({
      details: paginatedDetails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: pendienteDetails.length,
        pages: Math.ceil(pendienteDetails.length / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all SM details for tráfico (only today's records - editable)
export const getTraficoData = async (req, res, next) => {
  try {
    const { ruta, ciudad, codCliente, nombreCliente, allowedPlates, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros (sin fecha, solo otros filtros)
    const filters = {};

    if (ruta) filters.ruta = { contains: ruta, mode: "insensitive" };
    if (ciudad) filters.ciudad = { contains: ciudad, mode: "insensitive" };
    if (codCliente) filters.codCliente = { contains: codCliente, mode: "insensitive" };
    if (nombreCliente) filters.nombreCliente = { contains: nombreCliente, mode: "insensitive" };

    // Filtro de placas para IN_HOUSE (formato: "placa1,placa2,placa3")
    if (allowedPlates) {
      const platesArray = allowedPlates.split(',').map(p => p.trim());
      filters.cargas = { in: platesArray };
    }

    // Obtener todos los registros (sin paginación en BD) y filtrar por fecha en JS
    const allDetails = await prisma.sMDetail.findMany({
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
      orderBy: { fecha: "desc" },
    });

    // Filtrar solo registros de HOY
    const todayDetails = allDetails.filter(d => isFechaToday(d.fecha));

    // Aplicar paginación después de filtrar
    const paginatedDetails = todayDetails.slice(skip, skip + parseInt(limit));

    // Calcular progreso por numCarga (solo para registros de hoy)
    const progressByRoute = {};
    const uniqueCarga = new Set(todayDetails.map(d => d.numCarga));

    for (const numCarga of uniqueCarga) {
      const cargaDetails = todayDetails.filter(d => d.numCarga === numCarga);
      const withStatus = cargaDetails.filter(d => d.deliveryStatus).length;
      const total = cargaDetails.length;

      progressByRoute[numCarga] = {
        total,
        asignadas: withStatus,
        porcentaje: total > 0 ? Math.round((withStatus / total) * 100) : 0,
      };
    }

    res.json({
      details: paginatedDetails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: todayDetails.length,
        pages: Math.ceil(todayDetails.length / parseInt(limit)),
      },
      progressByRoute,
    });
  } catch (error) {
    next(error);
  }
};

// Get historical SM details (only past records - read-only)
export const getHistoricoData = async (req, res, next) => {
  try {
    const { fechaDesde, fechaHasta, numCarga, codCliente, nombreCliente, allowedPlates, page = 1, limit = 100 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const filters = {};

    if (numCarga) filters.numCarga = { contains: numCarga, mode: "insensitive" };
    if (codCliente) filters.codCliente = { contains: codCliente, mode: "insensitive" };
    if (nombreCliente) filters.nombreCliente = { contains: nombreCliente, mode: "insensitive" };

    // Filtro de placas para IN_HOUSE
    if (allowedPlates) {
      const platesArray = allowedPlates.split(',').map(p => p.trim());
      filters.cargas = { in: platesArray };
    }

    // Obtener todos los registros para filtrar por fecha en JS
    const allDetails = await prisma.sMDetail.findMany({
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
          include: {
            status: {
              select: {
                id: true,
                nombre: true,
                color: true,
              },
            },
            reason: {
              select: {
                id: true,
                nombre: true,
              },
            },
            updatedBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { fecha: "desc" },
    });

    // Filtrar solo registros PASADOS o en el rango especificado
    let historicalDetails = allDetails;

    // Si hay filtro de rango de fechas, usar solo ese filtro
    // Si no hay filtro de rango, filtrar solo registros pasados
    if (fechaDesde || fechaHasta) {
      // Parsear fechaDesde y fechaHasta como YYYY-MM-DD (format del HTML input date)
      let desde = null, hasta = null;

      if (fechaDesde) {
        const [year, month, day] = fechaDesde.split('-').map(Number);
        desde = new Date(year, month - 1, day); // month es 1-indexed en YYYY-MM-DD, 0-indexed en Date
        desde.setHours(0, 0, 0, 0);
      }

      if (fechaHasta) {
        const [year, month, day] = fechaHasta.split('-').map(Number);
        hasta = new Date(year, month - 1, day);
        hasta.setHours(23, 59, 59, 999);
      }

      historicalDetails = allDetails.filter(d => {
        const detalleFecha = parseFechaString(d.fecha);
        if (!detalleFecha) return false;

        // Normalizar detalleFecha a medianoche para comparación correcta
        detalleFecha.setHours(0, 0, 0, 0);

        const isAfterDesde = !desde || detalleFecha >= desde;
        const isBeforeHasta = !hasta || detalleFecha <= hasta;

        return isAfterDesde && isBeforeHasta;
      });
    } else {
      // Si no hay rango especificado, filtrar solo registros PASADOS
      historicalDetails = allDetails.filter(d => isFechaPast(d.fecha));
    }

    // Aplicar paginación
    const paginatedDetails = historicalDetails.slice(skip, skip + parseInt(limit));

    res.json({
      details: paginatedDetails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: historicalDetails.length,
        pages: Math.ceil(historicalDetails.length / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Export historical data to Excel
export const exportHistoricoExcel = async (req, res, next) => {
  try {
    const { fechaDesde, fechaHasta, numCarga, codCliente, nombreCliente } = req.query;

    // Construir filtros
    const filters = {};

    if (numCarga) filters.numCarga = { contains: numCarga, mode: "insensitive" };
    if (codCliente) filters.codCliente = { contains: codCliente, mode: "insensitive" };
    if (nombreCliente) filters.nombreCliente = { contains: nombreCliente, mode: "insensitive" };

    // Obtener todos los registros
    const allDetails = await prisma.sMDetail.findMany({
      where: filters,
      include: {
        deliveryStatus: {
          include: {
            status: {
              select: {
                nombre: true,
              },
            },
            reason: {
              select: {
                nombre: true,
              },
            },
            updatedBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { fecha: "desc" },
    });

    // Filtrar solo registros PASADOS o en el rango especificado
    let historicalDetails = allDetails;

    // Si hay filtro de rango de fechas, usar solo ese filtro
    // Si no hay filtro de rango, filtrar solo registros pasados
    if (fechaDesde || fechaHasta) {
      // Parsear fechaDesde y fechaHasta como YYYY-MM-DD (format del HTML input date)
      let desde = null, hasta = null;

      if (fechaDesde) {
        const [year, month, day] = fechaDesde.split('-').map(Number);
        desde = new Date(year, month - 1, day); // month es 1-indexed en YYYY-MM-DD, 0-indexed en Date
        desde.setHours(0, 0, 0, 0);
      }

      if (fechaHasta) {
        const [year, month, day] = fechaHasta.split('-').map(Number);
        hasta = new Date(year, month - 1, day);
        hasta.setHours(23, 59, 59, 999);
      }

      historicalDetails = allDetails.filter(d => {
        const detalleFecha = parseFechaString(d.fecha);
        if (!detalleFecha) return false;

        // Normalizar detalleFecha a medianoche para comparación correcta
        detalleFecha.setHours(0, 0, 0, 0);

        const isAfterDesde = !desde || detalleFecha >= desde;
        const isBeforeHasta = !hasta || detalleFecha <= hasta;

        return isAfterDesde && isBeforeHasta;
      });
    } else {
      // Si no hay rango especificado, filtrar solo registros PASADOS
      historicalDetails = allDetails.filter(d => isFechaPast(d.fecha));
    }

    // Preparar datos para Excel
    const excelData = historicalDetails.map(d => ({
      Fecha: d.fecha,
      Ruta: d.ruta,
      Ciudad: d.ciudad,
      Placa: d.cargas,
      Secuencia: d.secuencia,
      Cliente: d.nombreCliente,
      "Código Cliente": d.codCliente,
      Alquería: d.alqueria,
      Yogurt: d.yogurt,
      Quesos: d.quesos,
      "Total General": d.totalGeneral,
      "Número Carga": d.numCarga,
      "Orden de Compra": d.ordenCompra || "N/A",
      Estado: d.deliveryStatus?.status?.nombre || "Sin asignar",
      Motivo: d.deliveryStatus?.reason?.nombre || "N/A",
      Observaciones: d.deliveryStatus?.observaciones || "N/A",
      "Fecha Entrega": d.deliveryStatus?.fechaEntrega
        ? new Date(d.deliveryStatus.fechaEntrega).toLocaleDateString("es-CO")
        : "N/A",
      "Recogió Devolución": d.deliveryStatus?.recogioDevoluccion ? "Sí" : "No",
      "Actualizado Por": d.deliveryStatus?.updatedBy
        ? `${d.deliveryStatus.updatedBy.firstName} ${d.deliveryStatus.updatedBy.lastName}`
        : "N/A",
      "Fecha Actualización": d.deliveryStatus?.updatedAt
        ? new Date(d.deliveryStatus.updatedAt).toLocaleString("es-CO")
        : "N/A",
    }));

    // Crear workbook de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 12 }, // Fecha
      { wch: 15 }, // Ruta
      { wch: 12 }, // Ciudad
      { wch: 10 }, // Placa
      { wch: 10 }, // Secuencia
      { wch: 20 }, // Cliente
      { wch: 12 }, // Código Cliente
      { wch: 10 }, // Alquería
      { wch: 10 }, // Yogurt
      { wch: 10 }, // Quesos
      { wch: 12 }, // Total General
      { wch: 12 }, // Número Carga
      { wch: 15 }, // Orden de Compra
      { wch: 15 }, // Estado
      { wch: 20 }, // Motivo
      { wch: 20 }, // Observaciones
      { wch: 15 }, // Fecha Entrega
      { wch: 15 }, // Recogió Devolución
      { wch: 20 }, // Actualizado Por
      { wch: 22 }, // Fecha Actualización
    ];
    ws["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Histórico Rutero");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const timestamp = new Date().toISOString().split("T")[0];

    res.setHeader("Content-Disposition", `attachment; filename="historico_rutero_${timestamp}.xlsx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    next(error);
  }
};

// Get dashboard statistics for SM module
export const getDashboardStats = async (req, res, next) => {
  try {
    // Obtener todos los SMDetail con deliveryStatus incluido
    const allDetails = await prisma.sMDetail.findMany({
      include: {
        deliveryStatus: {
          include: {
            status: {
              select: {
                id: true,
                nombre: true,
                color: true,
              },
            },
          },
        },
      },
    });

    // HOY
    const todayDetails = allDetails.filter(d => isFechaToday(d.fecha));
    const todayTotal = todayDetails.length;
    const todayConEstado = todayDetails.filter(d => d.deliveryStatus).length;
    const todaySinEstado = todayTotal - todayConEstado;
    const todayPorcentaje = todayTotal > 0 ? Math.round((todayConEstado / todayTotal) * 100) : 0;

    // PENDIENTES (pasadas sin estado)
    const pendientesTotal = allDetails.filter(d => isFechaPast(d.fecha) && !d.deliveryStatus).length;

    // ESTADOS DEL DÍA (solo entregas de hoy con estado)
    // Agrupar por status.nombre
    const estadosMap = {};
    todayDetails.filter(d => d.deliveryStatus?.status).forEach(d => {
      const nombre = d.deliveryStatus.status.nombre;
      const color = d.deliveryStatus.status.color;
      estadosMap[nombre] = { nombre, color, count: (estadosMap[nombre]?.count || 0) + 1 };
    });
    const estadosHoy = Object.values(estadosMap);

    // CIUDADES DEL DÍA
    const ciudadesMap = {};
    todayDetails.forEach(d => {
      if (!ciudadesMap[d.ciudad]) {
        ciudadesMap[d.ciudad] = { ciudad: d.ciudad, total: 0, exitosas: 0, parciales: 0, noExitosas: 0, sinEstado: 0 };
      }
      ciudadesMap[d.ciudad].total++;
      const nombre = d.deliveryStatus?.status?.nombre?.toUpperCase();
      if (nombre === 'EXITOSA') ciudadesMap[d.ciudad].exitosas++;
      else if (nombre === 'PARCIAL') ciudadesMap[d.ciudad].parciales++;
      else if (nombre === 'NO EXITOSA') ciudadesMap[d.ciudad].noExitosas++;
      else ciudadesMap[d.ciudad].sinEstado++;
    });
    const ciudadesHoy = Object.values(ciudadesMap).sort((a, b) => b.total - a.total);

    // TOTALES GENERALES (todo el histórico)
    const totalHistorico = allDetails.length;
    const totalConEstado = allDetails.filter(d => d.deliveryStatus).length;

    res.json({
      hoy: { total: todayTotal, conEstado: todayConEstado, sinEstado: todaySinEstado, porcentaje: todayPorcentaje },
      pendientes: { total: pendientesTotal },
      estadosHoy,
      ciudadesHoy,
      totales: { total: totalHistorico, conEstado: totalConEstado },
    });
  } catch (error) {
    next(error);
  }
};
