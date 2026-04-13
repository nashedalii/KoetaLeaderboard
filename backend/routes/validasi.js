import express from 'express'
import {
  getAllValidasi,
  getValidasiById,
  approvePenilaian,
  rejectPenilaian
} from '../controllers/validasiController.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/',           authenticate, authorize('admin'), getAllValidasi)
router.get('/:id',        authenticate, authorize('admin'), getValidasiById)
router.put('/:id/approve', authenticate, authorize('admin'), approvePenilaian)
router.put('/:id/reject',  authenticate, authorize('admin'), rejectPenilaian)

export default router
