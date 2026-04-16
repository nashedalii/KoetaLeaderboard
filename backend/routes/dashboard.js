import express from 'express'
import { getAdminDashboard, getPetugasDashboard } from '../controllers/dashboardController.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/admin',   authenticate, authorize('admin'),   getAdminDashboard)
router.get('/petugas', authenticate, authorize('petugas'), getPetugasDashboard)

export default router
