import express from 'express'
import { getAllBobot, bulkUpdateBobot, updateBobotDeskripsi } from '../controllers/bobotController.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/',               authenticate, authorize('admin', 'petugas'), getAllBobot)
router.put('/bulk',           authenticate, authorize('admin'), bulkUpdateBobot)
router.put('/:id/deskripsi',  authenticate, authorize('admin'), updateBobotDeskripsi)

export default router
