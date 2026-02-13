import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Get all users with pagin1ation and search
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search filter
    const searchFilter = search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: searchFilter,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          permissions: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          lastLogin: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: searchFilter }),
    ]);

    res.json({
      users,
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

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        permissions: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Create user
export const createUser = async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role = "CUSTOMER",
      permissions,
      companyId,
      contractorId,
    } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        role,
        permissions: permissions || { modules: ["dashboard"] },
        companyId: companyId || null,
        contractorId: contractorId || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        permissions: true,
        companyId: true,
        contractorId: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        contractor: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    res.status(201).json({
      message: "Usuario creado exitosamente",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update user
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      email,
      firstName,
      lastName,
      phone,
      role,
      permissions,
      isActive,
      companyId,
      contractorId,
    } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Check if new email is already in use by another user
    if (email && email !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(409).json({ error: "El email ya está registrado" });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(role && { role }),
        ...(permissions && { permissions }),
        ...(isActive !== undefined && { isActive }),
        ...(companyId !== undefined && { companyId }),
        ...(contractorId !== undefined && { contractorId }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        permissions: true,
        companyId: true,
        contractorId: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        contractor: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        lastLogin: true,
      },
    });

    res.json({
      message: "Usuario actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (soft delete)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res
        .status(400)
        .json({ error: "No puedes eliminar tu propia cuenta" });
    }

    // Soft delete by deactivating
    const deletedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      message: "Usuario desactivado exitosamente",
      user: {
        id: deletedUser.id,
        email: deletedUser.email,
        isActive: deletedUser.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    res.json({
      message: "Contraseña reiniciada exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
