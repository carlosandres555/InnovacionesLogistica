import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all roles with permissions
export const getAllRoles = async (req, res, next) => {
  try {
    const roles = await prisma.rolePermission.findMany({
      orderBy: { createdAt: 'asc' }
    });

    res.json(roles);
  } catch (error) {
    next(error);
  }
};

// Get a specific role
export const getRoleByName = async (req, res, next) => {
  try {
    const { roleName } = req.params;

    const role = await prisma.rolePermission.findUnique({
      where: { role: roleName }
    });

    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    res.json(role);
  } catch (error) {
    next(error);
  }
};

// Update role modules
export const updateRoleModules = async (req, res, next) => {
  try {
    const { roleName } = req.params;
    const { modules, description } = req.body;

    // Validar que modules es un array
    if (!Array.isArray(modules)) {
      return res.status(400).json({ error: 'Los módulos deben ser un array' });
    }

    // Módulos válidos
    const validModules = ['dashboard', 'trafico', 'historicoRutero', 'cargaInformacion'];
    const invalidModules = modules.filter(m => !validModules.includes(m));

    if (invalidModules.length > 0) {
      return res.status(400).json({
        error: `Módulos inválidos: ${invalidModules.join(', ')}`,
        validModules
      });
    }

    const role = await prisma.rolePermission.update({
      where: { role: roleName },
      data: {
        modules,
        ...(description && { description })
      }
    });

    res.json({
      message: `Rol ${roleName} actualizado exitosamente`,
      role
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    next(error);
  }
};
