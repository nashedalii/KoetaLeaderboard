import express from 'express'
import { createAdmin, createPetugas, createDriver, resetAdminPassword, resetPetugasPassword, resetDriverPassword } from '../controllers/userController.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

// Semua endpoint hanya bisa diakses admin
router.post('/admin', authenticate, authorize('admin'), createAdmin)
router.post('/petugas', authenticate, authorize('admin'), createPetugas)
router.post('/driver', authenticate, authorize('admin'), createDriver)

router.put('/admin/:id/reset-password', authenticate, authorize('admin'), resetAdminPassword)
router.put('/petugas/:id/reset-password', authenticate, authorize('admin'), resetPetugasPassword)
router.put('/driver/:id/reset-password', authenticate, authorize('admin'), resetDriverPassword)

export default router
