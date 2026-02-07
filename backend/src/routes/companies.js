import express from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { requireRole } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

const CreateCompanySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  description: z.string().optional()
})

// Get company by ID
router.get('/:id', async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        _count: {
          select: { employees: true, vehicles: true, shipments: true }
        }
      }
    })

    if (!company) {
      return res.status(404).json({ error: 'Company not found' })
    }

    res.json(company)
  } catch (error) {
    next(error)
  }
})

// Create company
router.post('/', async (req, res, next) => {
  try {
    const data = CreateCompanySchema.parse(req.body)

    const company = await prisma.company.create({
      data: {
        ...data,
        ownerId: req.user.id
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    })

    // Update user to be company owner
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        role: 'COMPANY_OWNER',
        companyId: company.id
      }
    })

    res.status(201).json(company)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      })
    }
    next(error)
  }
})

// Update company
router.put('/:id', requireRole('ADMIN', 'COMPANY_OWNER'), async (req, res, next) => {
  try {
    const data = CreateCompanySchema.parse(req.body)

    const company = await prisma.company.update({
      where: { id: req.params.id },
      data,
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    })

    res.json(company)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      })
    }
    next(error)
  }
})

export default router
