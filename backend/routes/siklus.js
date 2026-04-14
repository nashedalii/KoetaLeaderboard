import express from 'express'
import { getAllSiklus, getSiklusById, createSiklus } from '../controllers/siklusController.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/',    authenticate, authorize('admin', 'petugas', 'driver'), getAllSiklus)
router.get('/:id', authenticate, authorize('admin', 'petugas', 'driver'), getSiklusById)
router.post('/',   authenticate, authorize('admin'), createSiklus)

export default router
