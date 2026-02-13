import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all contractors
export const getAllContractors = async (req, res, next) => {
  try {
    const contractors = await prisma.company.findMany({
      include: {
        _count: {
          select: { vehicles: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(contractors);
  } catch (error) {
    next(error);
  }
};

// Get contractor with vehicles
export const getContractorWithVehicles = async (req, res, next) => {
  try {
    const { contractorId } = req.params;

    const contractor = await prisma.company.findUnique({
      where: { id: contractorId },
      include: {
        vehicles: {
          orderBy: { plate: 'asc' }
        }
      }
    });

    if (!contractor) {
      return res.status(404).json({ error: 'Contratista no encontrado' });
    }

    res.json(contractor);
  } catch (error) {
    next(error);
  }
};

// Create contractor
export const createContractor = async (req, res, next) => {
  try {
    const { name, description, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }

    const contractor = await prisma.company.create({
      data: {
        name,
        description,
        email,
        phone
      }
    });

    res.status(201).json({
      message: 'Contratista creado exitosamente',
      contractor
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'El email ya existe' });
    }
    next(error);
  }
};

// Update contractor
export const updateContractor = async (req, res, next) => {
  try {
    const { contractorId } = req.params;
    const { name, description, phone } = req.body;

    const contractor = await prisma.company.update({
      where: { id: contractorId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(phone && { phone })
      }
    });

    res.json({
      message: 'Contratista actualizado exitosamente',
      contractor
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Contratista no encontrado' });
    }
    next(error);
  }
};

// Add vehicle to contractor
export const addVehicleToContractor = async (req, res, next) => {
  try {
    const { contractorId } = req.params;
    const { plate, model, capacity } = req.body;

    if (!plate) {
      return res.status(400).json({ error: 'Placa es requerida' });
    }

    // Verificar si contratista existe
    const contractor = await prisma.company.findUnique({
      where: { id: contractorId }
    });

    if (!contractor) {
      return res.status(404).json({ error: 'Contratista no encontrado' });
    }

    // Verificar si placa ya existe
    const existing = await prisma.vehicle.findUnique({
      where: { plate }
    });

    if (existing) {
      return res.status(409).json({ error: 'La placa ya existe' });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plate,
        model: model || 'Not specified',
        capacity: capacity || 0,
        companyId: contractorId,
        status: 'ACTIVE'
      }
    });

    res.status(201).json({
      message: 'Vehículo agregado exitosamente',
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

// Update vehicle
export const updateVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { plate, model, capacity, status } = req.body;

    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        ...(plate && { plate }),
        ...(model && { model }),
        ...(capacity && { capacity }),
        ...(status && { status })
      }
    });

    res.json({
      message: 'Vehículo actualizado exitosamente',
      vehicle
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'La placa ya existe' });
    }
    next(error);
  }
};

// Delete vehicle
export const deleteVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;

    await prisma.vehicle.delete({
      where: { id: vehicleId }
    });

    res.json({ message: 'Vehículo eliminado exitosamente' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    next(error);
  }
};
