import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './config/db.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import busRoutes from './routes/bus.js'
import siklusRoutes from './routes/siklus.js'
import periodeRoutes from './routes/periode.js'
import bobotRoutes from './routes/bobot.js'
import penilaianRoutes from './routes/penilaian.js'
import validasiRoutes from './routes/validasi.js'
import rankingRoutes from './routes/ranking.js'
import driverRoutes from './routes/driver.js'
import { authenticate, authorize } from './middleware/authMiddleware.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/bus', busRoutes)
app.use('/api/siklus', siklusRoutes)
app.use('/api/periode', periodeRoutes)
app.use('/api/bobot', bobotRoutes)
app.use('/api/penilaian', penilaianRoutes)
app.use('/api/validasi', validasiRoutes)
app.use('/api/ranking', rankingRoutes)
app.use('/api/driver',  driverRoutes)

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
