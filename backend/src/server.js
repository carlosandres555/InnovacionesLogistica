import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

// Load environment variables
dotenv.config()

// Import routes
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import smRoutes from './routes/sm.js'
import deliveryStatusRoutes from './routes/deliveryStatus.js'
import rolesRoutes from './routes/roles.js'
import contractorsRoutes from './routes/contractors.js'

// Import middleware
import { authenticateToken } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'

// Initialize Express app
const app = express()

// Trust proxy (needed when behind CloudFront, ALB, or other proxies)
app.set('trust proxy', 1)

// Middleware
app.use(helmet())
// Configure CORS to accept multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://innovacioneslogistica.com',
  'https://d5lpz2l1b1l41.cloudfront.net' // CloudFront domain name
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  trustProxy: true // Trust X-Forwarded-For header from CloudFront/ALB
})
app.use('/api/', limiter)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Public routes
app.use('/api/auth', authRoutes)

// Protected routes (require authentication)
app.use('/api/users', authenticateToken, usersRoutes)
app.use('/api/sm', authenticateToken, smRoutes)
app.use('/api/delivery-status', authenticateToken, deliveryStatusRoutes)
app.use('/api/roles', authenticateToken, rolesRoutes)
app.use('/api/contractors', authenticateToken, contractorsRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler middleware
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
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
  process.exit(0)
})

export default app
// API Version 1.0.0
