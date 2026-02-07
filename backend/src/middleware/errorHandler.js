import { ZodError } from 'zod'

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(403).json({ error: 'Invalid token' })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' })
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({ error: `Unique constraint failed on ${err.meta?.target[0]}` })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' })
  }

  // Default error
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  })
}
