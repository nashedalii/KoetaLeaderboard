import pool from '../config/db.js'

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// POST /api/users/admin
export const createAdmin = async (req, res) => {
  const { nama_admin, nomor_pegawai, username, email } = req.body

  if (!nama_admin || !nomor_pegawai || !username || !email) {
    return res.status(400).json({ message: 'Semua field wajib diisi' })
  }

  const password = generatePassword()

  try {
    const result = await pool.query(
      `INSERT INTO admin (nama_admin, nomor_pegawai, username, email, password)
       VALUES ($1, $2, $3, $4, crypt($5, gen_salt('bf')))
       RETURNING admin_id AS id, nama_admin AS nama, username`,
      [nama_admin, nomor_pegawai, username, email, password]
    )

    res.status(201).json({
      message: 'Admin berhasil dibuat',
      user: { ...result.rows[0], role: 'admin' },
      password_awal: password
    })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Nomor pegawai, username, atau email sudah digunakan' })
    }
    console.error('Create admin error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// POST /api/users/petugas
export const createPetugas = async (req, res) => {
  const { nama_petugas, nomor_pegawai, username, email, armada_id } = req.body

  if (!nama_petugas || !nomor_pegawai || !username || !email || !armada_id) {
    return res.status(400).json({ message: 'Semua field wajib diisi' })
  }

  const password = generatePassword()

  try {
    const result = await pool.query(
      `INSERT INTO petugas (nama_petugas, nomor_pegawai, username, email, password, armada_id)
       VALUES ($1, $2, $3, $4, crypt($5, gen_salt('bf')), $6)
       RETURNING petugas_id AS id, nama_petugas AS nama, username`,
      [nama_petugas, nomor_pegawai, username, email, password, armada_id]
    )

    res.status(201).json({
      message: 'Petugas berhasil dibuat',
      user: { ...result.rows[0], role: 'petugas' },
      password_awal: password
    })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Nomor pegawai, username, atau email sudah digunakan' })
    }
    console.error('Create petugas error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// PUT /api/users/admin/:id/reset-password
export const resetAdminPassword = async (req, res) => {
  const { id } = req.params
  const password = generatePassword()

  try {
    const result = await pool.query(
      `UPDATE admin SET password = crypt($1, gen_salt('bf'))
       WHERE admin_id = $2
       RETURNING admin_id AS id, username`,
      [password, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Admin tidak ditemukan' })
    }

    res.json({
      message: 'Password berhasil direset',
      user: { ...result.rows[0], role: 'admin' },
      password_baru: password
    })
  } catch (err) {
    console.error('Reset admin password error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// PUT /api/users/petugas/:id/reset-password
export const resetPetugasPassword = async (req, res) => {
  const { id } = req.params
  const password = generatePassword()

  try {
    const result = await pool.query(
      `UPDATE petugas SET password = crypt($1, gen_salt('bf'))
       WHERE petugas_id = $2
       RETURNING petugas_id AS id, username`,
      [password, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Petugas tidak ditemukan' })
    }

    res.json({
      message: 'Password berhasil direset',
      user: { ...result.rows[0], role: 'petugas' },
      password_baru: password
    })
  } catch (err) {
    console.error('Reset petugas password error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// PUT /api/users/driver/:id/reset-password
export const resetDriverPassword = async (req, res) => {
  const { id } = req.params
  const password = generatePassword()

  try {
    const result = await pool.query(
      `UPDATE driver SET password = crypt($1, gen_salt('bf'))
       WHERE driver_id = $2
       RETURNING driver_id AS id, username`,
      [password, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Driver tidak ditemukan' })
    }

    res.json({
      message: 'Password berhasil direset',
      user: { ...result.rows[0], role: 'driver' },
      password_baru: password
    })
  } catch (err) {
    console.error('Reset driver password error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// POST /api/users/driver
export const createDriver = async (req, res) => {
  const { nama_driver, nama_kernet, username, email, armada_id } = req.body

  if (!nama_driver || !username || !email || !armada_id) {
    return res.status(400).json({ message: 'Semua field wajib diisi' })
  }

  const password = generatePassword()

  try {
    const result = await pool.query(
      `INSERT INTO driver (nama_driver, nama_kernet, username, email, password, armada_id)
       VALUES ($1, $2, $3, $4, crypt($5, gen_salt('bf')), $6)
       RETURNING driver_id AS id, nama_driver AS nama, username`,
      [nama_driver, nama_kernet || null, username, email, password, armada_id]
    )

    res.status(201).json({
      message: 'Driver berhasil dibuat',
      user: { ...result.rows[0], role: 'driver' },
      password_awal: password
    })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Username atau email sudah digunakan' })
    }
    console.error('Create driver error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}
