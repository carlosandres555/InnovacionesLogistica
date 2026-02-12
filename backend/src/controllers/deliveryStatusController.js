import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all delivery statuses
export const getDeliveryStatuses = async (req, res, next) => {
  try {
    const statuses = await prisma.deliveryStatus.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        color: true,
      },
    });

    res.json(statuses);
  } catch (error) {
    next(error);
  }
};

// Create delivery status (admin only)
export const createDeliveryStatus = async (req, res, next) => {
  try {
    const { nombre, descripcion, color } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "nombre es requerido" });
    }

    // Verificar que no exista un estado con el mismo nombre
    const existing = await prisma.deliveryStatus.findUnique({
      where: { nombre },
    });

    if (existing) {
      return res.status(409).json({ error: "Este estado ya existe" });
    }

    const status = await prisma.deliveryStatus.create({
      data: {
        nombre,
        descripcion,
        color,
      },
    });

    res.status(201).json({
      message: "Estado de entrega creado exitosamente",
      status,
    });
  } catch (error) {
    next(error);
  }
};

// Update delivery status of a single entrega
export const updateEntregaDeliveryStatus = async (req, res, next) => {
  try {
    const { entregaId } = req.params;
    const { statusId, observaciones } = req.body;

    if (!statusId) {
      return res.status(400).json({ error: "statusId es requerido" });
    }

    // Verificar que el statusId existe
    const status = await prisma.deliveryStatus.findUnique({
      where: { id: statusId },
    });

    if (!status) {
      return res.status(404).json({ error: "Estado no encontrado" });
    }

    // Verificar que la entrega existe
    const entrega = await prisma.sMDetail.findUnique({
      where: { id: entregaId },
    });

    if (!entrega) {
      return res.status(404).json({ error: "Entrega no encontrada" });
    }

    // Crear o actualizar el estado de entrega
    const entregaStatus = await prisma.entregaDeliveryStatus.upsert({
      where: { entregaId },
      update: {
        statusId,
        observaciones,
        updatedById: req.user.id,
        updatedAt: new Date(),
      },
      create: {
        entregaId,
        statusId,
        observaciones,
        updatedById: req.user.id,
      },
      select: {
        id: true,
        entregaId: true,
        status: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
        observaciones: true,
        updatedAt: true,
      },
    });

    res.json({
      message: "Estado de entrega actualizado exitosamente",
      entregaStatus,
    });
  } catch (error) {
    next(error);
  }
};

// Get delivery status of a single entrega
export const getEntregaDeliveryStatus = async (req, res, next) => {
  try {
    const { entregaId } = req.params;

    const entregaStatus = await prisma.entregaDeliveryStatus.findUnique({
      where: { entregaId },
      select: {
        id: true,
        status: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
        observaciones: true,
        updatedAt: true,
        updatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!entregaStatus) {
      return res.status(404).json({ error: "Estado de entrega no asignado" });
    }

    res.json(entregaStatus);
  } catch (error) {
    next(error);
  }
};
