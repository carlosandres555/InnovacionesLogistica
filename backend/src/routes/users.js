import express from 'express'
import { requireRole } from '../middleware/auth.js'
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword
} from '../controllers/usersController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { CreateUserSchema, UpdateUserSchema, ResetPasswordSchema } from '../validators/userValidators.js'

const router = express.Router()

router.use(requireRole('ADMIN'))

router.get('/', getUsers)
router.get('/:id', getUserById)
router.post('/', validateRequest(CreateUserSchema), createUser)
router.put('/:id', validateRequest(UpdateUserSchema), updateUser)
router.delete('/:id', deleteUser)
router.post('/:id/reset-password', validateRequest(ResetPasswordSchema), resetPassword)

export default router
