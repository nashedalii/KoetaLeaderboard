import express from 'express'
import { getPeriodeAktif, setOverridePeriode } from '../controllers/periodeController.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

// Semua admin bisa baca periode aktif; hanya super_admin bisa override
router.get('/aktif',        authenticate, authorize('super_admin', 'admin', 'petugas'), getPeriodeAktif)
router.put('/:id/override', authenticate, authorize('super_admin'), setOverridePeriode)

export default router
