import pool from '../config/db.js'

// GET /api/bus
export const getAllBus = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.bus_id, b.kode_bus, b.nopol, b.status_aktif,
             b.driver_id, b.armada_id,
             a.kode_armada, a.nama_armada,
             d.nama_driver
      FROM bus b
      LEFT JOIN armada a ON b.armada_id = a.armada_id
      LEFT JOIN driver d ON b.driver_id = d.driver_id
      ORDER BY a.kode_armada, b.kode_bus
    `)
    res.json(result.rows)
  } catch (err) {
    console.error('Get all bus error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// POST /api/bus
export const createBus = async (req, res) => {
  const { kode_bus, nopol, armada_id } = req.body

  if (!kode_bus || !nopol || !armada_id) {
    return res.status(400).json({ message: 'Kode bus, nopol, dan armada wajib diisi' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO bus (kode_bus, nopol, armada_id)
       VALUES ($1, $2, $3)
       RETURNING bus_id, kode_bus, nopol, armada_id, status_aktif`,
      [kode_bus, nopol, armada_id]
    )
    res.status(201).json({ message: 'Bus berhasil ditambahkan', bus: result.rows[0] })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Kode bus atau nopol sudah digunakan' })
    }
    console.error('Create bus error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// PUT /api/bus/:id
export const updateBus = async (req, res) => {
  const { id } = req.params
  const { kode_bus, nopol, armada_id, status_aktif } = req.body

  const fields = []
  const values = []
  let idx = 1

  if (kode_bus !== undefined)    { fields.push(`kode_bus = $${idx++}`);    values.push(kode_bus) }
  if (nopol !== undefined)       { fields.push(`nopol = $${idx++}`);       values.push(nopol) }
  if (armada_id !== undefined)   { fields.push(`armada_id = $${idx++}`);   values.push(armada_id) }
  if (status_aktif !== undefined){ fields.push(`status_aktif = $${idx++}`);values.push(status_aktif) }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'Tidak ada field yang diupdate' })
  }

  values.push(id)

  try {
    const result = await pool.query(
      `UPDATE bus SET ${fields.join(', ')} WHERE bus_id = $${idx}
       RETURNING bus_id, kode_bus, nopol, armada_id, status_aktif`,
      values
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Bus tidak ditemukan' })
    }

    res.json({ message: 'Bus berhasil diupdate', bus: result.rows[0] })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Kode bus atau nopol sudah digunakan' })
    }
    console.error('Update bus error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// DELETE /api/bus/:id
export const deleteBus = async (req, res) => {
  const { id } = req.params

  try {
    // Cek apakah bus sedang dipakai driver
    const check = await pool.query(
      'SELECT driver_id FROM bus WHERE bus_id = $1', [id]
    )

    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Bus tidak ditemukan' })
    }

    if (check.rows[0].driver_id !== null) {
      return res.status(409).json({ message: 'Bus tidak bisa dihapus karena masih digunakan oleh driver' })
    }

    await pool.query('DELETE FROM bus WHERE bus_id = $1', [id])
    res.json({ message: 'Bus berhasil dihapus' })
  } catch (err) {
    console.error('Delete bus error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}
