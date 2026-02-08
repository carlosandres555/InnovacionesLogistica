// Test deploy - 2026-02-08
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { Server } from 'socket.io'
import http from 'http'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

// Load environment variables
dotenv.config()

// Import routes
import authRoutes from './routes/auth.js'
import shipmentsRoutes from './routes/shipments.js'
import companiesRoutes from './routes/companies.js'
import vehiclesRoutes from './routes/vehicles.js'
import locationsRoutes from './routes/locations.js'
import uploadsRoutes from './routes/uploads.js'

// Import middleware
import { authenticateToken } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'

// Initialize Express app
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

// Store io instance globally for use in routes
app.set('io', io)

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
})
app.use('/api/', limiter)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Public routes
app.use('/api/auth', authRoutes)

// Protected routes (require authentication)
app.use('/api/shipments', authenticateToken, shipmentsRoutes)
app.use('/api/companies', authenticateToken, companiesRoutes)
app.use('/api/vehicles', authenticateToken, vehiclesRoutes)
app.use('/api/locations', authenticateToken, locationsRoutes)
app.use('/api/uploads', authenticateToken, uploadsRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler middleware
app.use(errorHandler)

// WebSocket events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-shipment', (shipmentId) => {
    socket.join(`shipment-${shipmentId}`)
    console.log(`User joined shipment: ${shipmentId}`)
  })

  socket.on('leave-shipment', (shipmentId) => {
    socket.leave(`shipment-${shipmentId}`)
    console.log(`User left shipment: ${shipmentId}`)
  })

  socket.on('location-update', (data) => {
    // Broadcast to shipment room
    io.to(`shipment-${data.shipmentId}`).emit('location-update', data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Start server
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║     Innovaciones Logistica API Server                  ║
║     Environment: ${process.env.NODE_ENV || 'development'}                        ║
║     Port: ${PORT}                                           ║
╚════════════════════════════════════════════════════════╝
  `)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

export default app
// API Version 1.0.0
