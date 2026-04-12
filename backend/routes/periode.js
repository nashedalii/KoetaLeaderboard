import express from 'express'
import { getPeriodeAktif, setOverridePeriode } from '../controllers/periodeController.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/aktif',           authenticate, authorize('admin', 'petugas'), getPeriodeAktif)
router.put('/:id/override',    authenticate, authorize('admin'),            setOverridePeriode)

export default router
