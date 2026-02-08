import { z } from 'zod'

export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  firstName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'ANALISTA', 'IN_HOUSE', 'CUSTOMER']).optional(),
  permissions: z.object({
    modules: z.array(z.string())
  }).optional(),
  companyId: z.string().optional()
})

export const UpdateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(['ADMIN', 'ANALISTA', 'IN_HOUSE', 'CUSTOMER']).optional(),
  permissions: z.object({
    modules: z.array(z.string())
  }).optional(),
  isActive: z.boolean().optional(),
  companyId: z.string().optional().nullable()
})

export const ResetPasswordSchema = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
})
