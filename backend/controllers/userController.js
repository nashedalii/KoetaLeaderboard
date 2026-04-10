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

// GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    const adminResult = await pool.query(
      `SELECT admin_id AS id, nama_admin AS nama, nomor_pegawai AS identifier,
              email, status_aktif, 'admin' AS role
       FROM admin`
    )

    const petugasResult = await pool.query(
      `SELECT p.petugas_id AS id, p.nama_petugas AS nama, p.nomor_pegawai AS identifier,
              p.email, p.status_aktif, 'petugas' AS role,
              a.kode_armada, a.nama_armada
       FROM petugas p
       LEFT JOIN armada a ON p.armada_id = a.armada_id`
    )

    const driverResult = await pool.query(
      `SELECT d.driver_id AS id, d.nama_driver AS nama, d.username AS identifier,
              d.nama_kernet, d.email, d.status_aktif, 'driver' AS role,
              a.armada_id, a.kode_armada, a.nama_armada,
              b.bus_id, b.kode_bus, b.nopol
       FROM driver d
       LEFT JOIN armada a ON d.armada_id = a.armada_id
       LEFT JOIN bus b ON b.driver_id = d.driver_id`
    )

    const users = [
      ...adminResult.rows,
      ...petugasResult.rows,
      ...driverResult.rows
    ]

    res.json(users)
  } catch (err) {
    console.error('Get all users error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// GET /api/users/driver?armada_id=1
export const getAllDrivers = async (req, res) => {
  const { armada_id } = req.query

  try {
    let query = `
      SELECT d.driver_id AS id, d.nama_driver AS nama, d.nama_kernet,
             d.username, d.email, d.status_aktif,
             a.armada_id, a.kode_armada, a.nama_armada,
             b.kode_bus, b.nopol
      FROM driver d
      LEFT JOIN armada a ON d.armada_id = a.armada_id
      LEFT JOIN bus b ON b.driver_id = d.driver_id
    `
    const params = []

    if (armada_id) {
      query += ' WHERE d.armada_id = $1'
      params.push(armada_id)
    }

    query += ' ORDER BY a.kode_armada, d.nama_driver'

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    console.error('Get all drivers error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// PUT /api/users/:role/:id
const VALID_ROLES = ['admin', 'petugas', 'driver']

const TABLE_MAP = {
  admin:   { table: 'admin',   idCol: 'admin_id',   namaCol: 'nama_admin',   identifierCol: 'nomor_pegawai' },
  petugas: { table: 'petugas', idCol: 'petugas_id', namaCol: 'nama_petugas', identifierCol: 'nomor_pegawai' },
  driver:  { table: 'driver',  idCol: 'driver_id',  namaCol: 'nama_driver',  identifierCol: 'username'      }
}

export const updateUser = async (req, res) => {
  const { role, id } = req.params
  const { nama, identifier, email, status_aktif, armada_id, nama_kernet, kode_bus, nopol } = req.body

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Role tidak valid. Gunakan: admin, petugas, driver' })
  }

  const { table, idCol, namaCol, identifierCol } = TABLE_MAP[role]

  const fields = []
  const values = []
  let idx = 1

  if (nama !== undefined)        { fields.push(`${namaCol} = $${idx++}`);       values.push(nama) }
  if (identifier !== undefined)  { fields.push(`${identifierCol} = $${idx++}`); values.push(identifier) }
  if (email !== undefined)       { fields.push(`email = $${idx++}`);            values.push(email) }
  if (status_aktif !== undefined){ fields.push(`status_aktif = $${idx++}`);     values.push(status_aktif) }
  if (armada_id !== undefined && role !== 'admin') {
    fields.push(`armada_id = $${idx++}`)
    values.push(armada_id)
  }
  if (nama_kernet !== undefined && role === 'driver') {
    fields.push(`nama_kernet = $${idx++}`)
    values.push(nama_kernet)
  }

  if (fields.length === 0 && kode_bus === undefined && nopol === undefined) {
    return res.status(400).json({ message: 'Tidak ada field yang diupdate' })
  }

  try {
    let result = { rows: [] }

    if (fields.length > 0) {
      values.push(id)
      result = await pool.query(
        `UPDATE ${table} SET ${fields.join(', ')} WHERE ${idCol} = $${idx} RETURNING ${idCol} AS id, ${namaCol} AS nama, status_aktif`,
        values
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User tidak ditemukan' })
      }
    }

    // Update bus jika role driver dan ada field bus
    if (role === 'driver' && (kode_bus !== undefined || nopol !== undefined)) {
      const busFields = []
      const busValues = []
      let busIdx = 1

      if (kode_bus !== undefined) { busFields.push(`kode_bus = $${busIdx++}`); busValues.push(kode_bus) }
      if (nopol !== undefined)    { busFields.push(`nopol = $${busIdx++}`);    busValues.push(nopol) }

      busValues.push(id)
      await pool.query(
        `UPDATE bus SET ${busFields.join(', ')} WHERE driver_id = $${busIdx}`,
        busValues
      )
    }

    const updatedUser = result.rows[0] ?? {}

    if (result.rows.length === 0 && fields.length === 0) {
      // Hanya update bus, tidak ada user row untuk di-return — fetch ulang
      const refetch = await pool.query(
        `SELECT ${idCol} AS id, ${namaCol} AS nama, status_aktif FROM ${table} WHERE ${idCol} = $1`,
        [id]
      )
      if (refetch.rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' })
      return res.json({ message: 'User berhasil diupdate', user: { ...refetch.rows[0], role } })
    }

    res.json({
      message: 'User berhasil diupdate',
      user: { ...result.rows[0], role }
    })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Identifier atau email sudah digunakan' })
    }
    console.error('Update user error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// DELETE /api/users/:role/:id
export const deleteUser = async (req, res) => {
  const { role, id } = req.params

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Role tidak valid. Gunakan: admin, petugas, driver' })
  }

  const { table, idCol, namaCol } = TABLE_MAP[role]

  try {
    const result = await pool.query(
      `DELETE FROM ${table} WHERE ${idCol} = $1 RETURNING ${idCol} AS id, ${namaCol} AS nama`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' })
    }

    res.json({
      message: 'User berhasil dihapus',
      user: { ...result.rows[0], role }
    })
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ message: 'User tidak bisa dihapus karena masih memiliki data terkait' })
    }
    console.error('Delete user error:', err)
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
