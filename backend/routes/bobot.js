import express from 'express'
import { getAllBobot, createBobot, updateBobot, deleteBobot } from '../controllers/bobotController.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/',    authenticate, authorize('admin'), getAllBobot)
router.post('/',   authenticate, authorize('admin'), createBobot)
router.put('/:id', authenticate, authorize('admin'), updateBobot)
router.delete('/:id', authenticate, authorize('admin'), deleteBobot)

export default router
