import express from 'express'
import { requireRole } from '../middleware/auth.js'
import {
  getAllRoles,
  getRoleByName,
  updateRoleModules
} from '../controllers/rolesController.js'

const router = express.Router()

// Proteger todas las rutas - solo ADMIN
router.use(requireRole('ADMIN'))

// GET - Obtener todos los roles
router.get('/', getAllRoles)

// GET - Obtener un rol específico
router.get('/:roleName', getRoleByName)

// PUT - Actualizar módulos de un rol
router.put('/:roleName/modules', updateRoleModules)

export default router
