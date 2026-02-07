import express from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

const CreateVehicleSchema = z.object({
  companyId: z.string(),
  plate: z.string().min(1),
  model: z.string().min(1),
  capacity: z.number().positive(),
  gpsDevice: z.string().optional()
})

// Get all vehicles for user's company
router.get('/', async (req, res, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        company: {
          OR: [
            { ownerId: req.user.id },
            { employees: { some: { id: req.user.id } } }
          ]
        }
      },
      include: {
        currentDriver: {
          select: { id: true, firstName: true, lastName: true }
        },
        _count: {
          select: { shipments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(vehicles)
  } catch (error) {
    next(error)
  }
})

// Get vehicle by ID
router.get('/:id', async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: {
        currentDriver: true,
        shipments: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        locations: {
          take: 20,
          orderBy: { timestamp: 'desc' }
        }
      }
    })

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' })
    }

    res.json(vehicle)
  } catch (error) {
    next(error)
  }
})

// Create vehicle
router.post('/', async (req, res, next) => {
  try {
    const data = CreateVehicleSchema.parse(req.body)

    const vehicle = await prisma.vehicle.create({
      data,
      include: {
        currentDriver: true,
        company: true
      }
    })

    res.status(201).json(vehicle)
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

// Update vehicle
router.put('/:id', async (req, res, next) => {
  try {
    const { plate, model, capacity, status, driverId, gpsDevice } = req.body

    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: {
        ...(plate && { plate }),
        ...(model && { model }),
        ...(capacity && { capacity }),
        ...(status && { status }),
        ...(driverId && { driverId }),
        ...(gpsDevice && { gpsDevice })
      },
      include: {
        currentDriver: true
      }
    })

    res.json(vehicle)
  } catch (error) {
    next(error)
  }
})

export default router
