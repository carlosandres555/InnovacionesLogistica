import express from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const CreateShipmentSchema = z.object({
  companyId: z.string(),
  originAddress: z.string(),
  destAddress: z.string(),
  description: z.string(),
  weight: z.number().positive(),
  dimensions: z.string().optional(),
  value: z.number().optional(),
  scheduledDate: z.string().datetime().optional()
})

const UpdateShipmentSchema = z.object({
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED']).optional(),
  driverId: z.string().optional(),
  vehicleId: z.string().optional(),
  notes: z.string().optional()
})

// Get all shipments for user's company
router.get('/', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query

    const where = {
      company: {
        OR: [
          { ownerId: req.user.id },
          { employees: { some: { id: req.user.id } } }
        ]
      }
    }

    if (status) {
      where.status = status
    }

    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true }
        },
        assignedDriver: {
          select: { id: true, firstName: true, lastName: true }
        },
        vehicle: {
          select: { id: true, plate: true }
        }
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    })

    const total = await prisma.shipment.count({ where })

    res.json({
      data: shipments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    })
  } catch (error) {
    next(error)
  }
})

// Get shipment by ID
router.get('/:id', async (req, res, next) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        assignedDriver: true,
        vehicle: true,
        locations: {
          orderBy: { timestamp: 'desc' },
          take: 100
        }
      }
    })

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' })
    }

    res.json(shipment)
  } catch (error) {
    next(error)
  }
})

// Create shipment
router.post('/', async (req, res, next) => {
  try {
    const data = CreateShipmentSchema.parse(req.body)

    // Generate tracking number
    const trackingNumber = `INL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const shipment = await prisma.shipment.create({
      data: {
        ...data,
        trackingNumber,
        status: 'PENDING'
      },
      include: {
        company: true
      }
    })

    res.status(201).json(shipment)
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

// Update shipment
router.put('/:id', async (req, res, next) => {
  try {
    const data = UpdateShipmentSchema.parse(req.body)

    const shipment = await prisma.shipment.update({
      where: { id: req.params.id },
      data,
      include: {
        company: true,
        assignedDriver: true,
        vehicle: true
      }
    })

    res.json(shipment)
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

// Delete shipment
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.shipment.delete({
      where: { id: req.params.id }
    })

    res.json({ message: 'Shipment deleted successfully' })
  } catch (error) {
    next(error)
  }
})

export default router
