import express from 'express'
import { getAllSiklus, getSiklusById, createSiklus } from '../controllers/siklusController.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/',    authenticate, authorize('admin'), getAllSiklus)
router.get('/:id', authenticate, authorize('admin'), getSiklusById)
router.post('/',   authenticate, authorize('admin'), createSiklus)

export default router
