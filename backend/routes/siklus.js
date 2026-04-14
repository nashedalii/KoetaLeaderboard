import express from 'express'
import { getAllSiklus, getSiklusById, createSiklus, deleteSiklus } from '../controllers/siklusController.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/',    authenticate, authorize('admin', 'petugas', 'driver'), getAllSiklus)
router.get('/:id', authenticate, authorize('admin', 'petugas', 'driver'), getSiklusById)
router.post('/',      authenticate, authorize('admin'), createSiklus)
router.delete('/:id', authenticate, authorize('admin'), deleteSiklus)

export default router
