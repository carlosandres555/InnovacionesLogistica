import express from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

const CreateLocationSchema = z.object({
  shipmentId: z.string(),
  vehicleId: z.string(),
  companyId: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
  altitude: z.number().optional(),
  speed: z.number().optional(),
  heading: z.number().optional(),
  address: z.string().optional(),
  notes: z.string().optional()
})

// Get location history for shipment
router.get('/shipment/:shipmentId', async (req, res, next) => {
  try {
    const { limit = 100 } = req.query

    const locations = await prisma.location.findMany({
      where: {
        shipmentId: req.params.shipmentId
      },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit)
    })

    res.json(locations)
  } catch (error) {
    next(error)
  }
})

// Get location history for vehicle
router.get('/vehicle/:vehicleId', async (req, res, next) => {
  try {
    const { limit = 100 } = req.query

    const locations = await prisma.location.findMany({
      where: {
        vehicleId: req.params.vehicleId
      },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit)
    })

    res.json(locations)
  } catch (error) {
    next(error)
  }
})

// Create location (GPS tracking)
router.post('/', async (req, res, next) => {
  try {
    const data = CreateLocationSchema.parse(req.body)

    const location = await prisma.location.create({
      data
    })

    // Broadcast to WebSocket subscribers
    const io = req.app.get('io')
    if (io) {
      io.to(`shipment-${data.shipmentId}`).emit('location-update', {
        shipmentId: data.shipmentId,
        vehicleId: data.vehicleId,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        address: data.address,
        timestamp: location.timestamp
      })
    }

    res.status(201).json(location)
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
