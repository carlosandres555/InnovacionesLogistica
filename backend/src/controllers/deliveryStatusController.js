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

// Get reasons for a specific status
export const getReasonsByStatus = async (req, res, next) => {
  try {
    const { statusId } = req.params;

    // Verificar que el status existe
    const status = await prisma.deliveryStatus.findUnique({
      where: { id: statusId },
    });

    if (!status) {
      return res.status(404).json({ error: "Estado no encontrado" });
    }

    const reasons = await prisma.deliveryStatusReason.findMany({
      where: { statusId },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
      },
      orderBy: { nombre: "asc" },
    });

    res.json(reasons);
  } catch (error) {
    next(error);
  }
};

// Create reason for a status (admin only)
export const createDeliveryStatusReason = async (req, res, next) => {
  try {
    const { statusId, nombre, descripcion } = req.body;

    if (!statusId || !nombre) {
      return res
        .status(400)
        .json({ error: "statusId y nombre son requeridos" });
    }

    // Verificar que el status existe
    const status = await prisma.deliveryStatus.findUnique({
      where: { id: statusId },
    });

    if (!status) {
      return res.status(404).json({ error: "Estado no encontrado" });
    }

    // Verificar que no exista un motivo con el mismo nombre en este status
    const existing = await prisma.deliveryStatusReason.findFirst({
      where: {
        statusId,
        nombre,
      },
    });

    if (existing) {
      return res
        .status(409)
        .json({ error: "Este motivo ya existe para este estado" });
    }

    const reason = await prisma.deliveryStatusReason.create({
      data: {
        statusId,
        nombre,
        descripcion,
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
      },
    });

    res.status(201).json({
      message: "Motivo de entrega creado exitosamente",
      reason,
    });
  } catch (error) {
    next(error);
  }
};

// Update delivery status of a single entrega
export const updateEntregaDeliveryStatus = async (req, res, next) => {
  try {
    const { entregaId } = req.params;
    const { statusId, reasonId, observaciones } = req.body;

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

    // Si se proporciona reasonId, verificar que existe y pertenece a ese status
    if (reasonId) {
      const reason = await prisma.deliveryStatusReason.findUnique({
        where: { id: reasonId },
      });

      if (!reason || reason.statusId !== statusId) {
        return res.status(400).json({ error: "Motivo inválido para este estado" });
      }
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
        reasonId: reasonId || null,
        observaciones,
        updatedById: req.user.id,
        updatedAt: new Date(),
      },
      create: {
        entregaId,
        statusId,
        reasonId: reasonId || null,
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
        reason: {
          select: {
            id: true,
            nombre: true,
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
        reason: {
          select: {
            id: true,
            nombre: true,
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

// Delete delivery status reason (admin only)
export const deleteDeliveryStatusReason = async (req, res, next) => {
  try {
    const { reasonId } = req.params;

    // Verificar que el motivo existe
    const reason = await prisma.deliveryStatusReason.findUnique({
      where: { id: reasonId },
    });

    if (!reason) {
      return res.status(404).json({ error: "Motivo no encontrado" });
    }

    // Eliminar el motivo
    await prisma.deliveryStatusReason.delete({
      where: { id: reasonId },
    });

    res.json({
      message: "Motivo eliminado exitosamente",
    });
  } catch (error) {
    next(error);
  }
};
