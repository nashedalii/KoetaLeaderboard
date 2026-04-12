import express from 'express'
import { getAllBobot, bulkUpdateBobot } from '../controllers/bobotController.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/',      authenticate, authorize('admin'), getAllBobot)
router.put('/bulk',  authenticate, authorize('admin'), bulkUpdateBobot)

export default router
