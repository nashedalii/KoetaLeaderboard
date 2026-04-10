import express from 'express'
import { getAllBus, createBus, updateBus, deleteBus } from '../controllers/busController.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticate, authorize('admin'), getAllBus)
router.post('/', authenticate, authorize('admin'), createBus)
router.put('/:id', authenticate, authorize('admin'), updateBus)
router.delete('/:id', authenticate, authorize('admin'), deleteBus)

export default router
