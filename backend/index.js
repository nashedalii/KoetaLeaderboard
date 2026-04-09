import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './config/db.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import { authenticate, authorize } from './middleware/authMiddleware.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

// Test protected route
app.get('/api/test-auth', authenticate, (req, res) => {
  res.json({ message: 'Token valid', user: req.user })
})

app.get('/api/test-admin', authenticate, authorize('admin'), (req, res) => {
  res.json({ message: 'Hanya admin yang bisa akses ini', user: req.user })
})

// Test koneksi database
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS time')
    res.json({ success: true, time: result.rows[0].time })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`)
})
