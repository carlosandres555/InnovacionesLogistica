import jwt from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' })
      }
      return res.status(403).json({ error: 'Invalid token' })
    }

    req.user = user
    next()
  })
}

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}
