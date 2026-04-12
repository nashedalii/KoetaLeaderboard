import pool from '../config/db.js'

// ── Helper: hitung total persentase dalam satu siklus ────────────────────
async function getTotalPersentase(siklusId, excludeBobot_id = null) {
  const result = await pool.query(
    `SELECT COALESCE(SUM(persentase_bobot), 0) AS total
     FROM bobot
     WHERE siklus_id = $1
       AND ($2::int IS NULL OR bobot_id != $2)`,
    [siklusId, excludeBobot_id]
  )
  return parseFloat(result.rows[0].total)
}

// ── Helper: cek apakah bobot sudah dipakai di penilaian_detail ───────────
async function isUsedInPenilaian(bobotId) {
  const result = await pool.query(
    'SELECT 1 FROM penilaian_detail WHERE bobot_id = $1 LIMIT 1',
    [bobotId]
  )
  return result.rows.length > 0
}

// ── GET /api/bobot?siklus_id= ─────────────────────────────────────────────
export const getAllBobot = async (req, res) => {
  const { siklus_id } = req.query

  if (!siklus_id) {
    return res.status(400).json({ message: 'siklus_id wajib diisi' })
  }

  try {
    const result = await pool.query(
      `SELECT b.*, a.nama_admin AS dibuat_oleh
       FROM bobot b
       LEFT JOIN admin a ON b.admin_id = a.admin_id
       WHERE b.siklus_id = $1
       ORDER BY b.bobot_id`,
      [siklus_id]
    )

    const total = result.rows.reduce((sum, b) => sum + parseFloat(b.persentase_bobot), 0)

    res.json({
      bobots: result.rows,
      total_persentase: parseFloat(total.toFixed(2)),
      sisa_persentase: parseFloat((100 - total).toFixed(2))
    })
  } catch (err) {
    console.error('Get all bobot error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// ── POST /api/bobot ───────────────────────────────────────────────────────
export const createBobot = async (req, res) => {
  const { nama_bobot, persentase_bobot, deskripsi, siklus_id } = req.body
  const admin_id = req.user.user_id

  if (!nama_bobot || persentase_bobot === undefined || !siklus_id) {
    return res.status(400).json({ message: 'nama_bobot, persentase_bobot, dan siklus_id wajib diisi' })
  }

  if (persentase_bobot <= 0 || persentase_bobot > 100) {
    return res.status(400).json({ message: 'persentase_bobot harus antara 1 dan 100' })
  }

  try {
    // Cek siklus ada
    const siklusCheck = await pool.query(
      'SELECT 1 FROM siklus_penilaian WHERE siklus_id = $1', [siklus_id]
    )
    if (siklusCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Siklus tidak ditemukan' })
    }

    // Validasi total tidak melebihi 100
    const totalSaatIni = await getTotalPersentase(siklus_id)
    if (totalSaatIni + parseFloat(persentase_bobot) > 100) {
      return res.status(400).json({
        message: `Total persentase melebihi 100%. Sisa yang tersedia: ${(100 - totalSaatIni).toFixed(2)}%`
      })
    }

    const result = await pool.query(
      `INSERT INTO bobot (nama_bobot, persentase_bobot, deskripsi, siklus_id, admin_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nama_bobot, persentase_bobot, deskripsi || null, siklus_id, admin_id]
    )

    const totalBaru = totalSaatIni + parseFloat(persentase_bobot)

    res.status(201).json({
      message: 'Bobot berhasil ditambahkan',
      bobot: result.rows[0],
      total_persentase: parseFloat(totalBaru.toFixed(2)),
      sisa_persentase: parseFloat((100 - totalBaru).toFixed(2))
    })
  } catch (err) {
    console.error('Create bobot error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// ── PUT /api/bobot/:id ────────────────────────────────────────────────────
export const updateBobot = async (req, res) => {
  const { id } = req.params
  const { nama_bobot, persentase_bobot, deskripsi, status_aktif } = req.body

  try {
    // Cek bobot ada
    const bobotResult = await pool.query('SELECT * FROM bobot WHERE bobot_id = $1', [id])
    if (bobotResult.rows.length === 0) {
      return res.status(404).json({ message: 'Bobot tidak ditemukan' })
    }
    const bobot = bobotResult.rows[0]

    // Cek apakah sudah dipakai di penilaian
    if (await isUsedInPenilaian(id)) {
      return res.status(409).json({ message: 'Bobot tidak bisa diubah karena sudah digunakan dalam penilaian' })
    }

    // Validasi total persentase (exclude bobot ini sendiri)
    if (persentase_bobot !== undefined) {
      if (persentase_bobot <= 0 || persentase_bobot > 100) {
        return res.status(400).json({ message: 'persentase_bobot harus antara 1 dan 100' })
      }
      const totalTanpaIni = await getTotalPersentase(bobot.siklus_id, parseInt(id))
      if (totalTanpaIni + parseFloat(persentase_bobot) > 100) {
        return res.status(400).json({
          message: `Total persentase melebihi 100%. Sisa yang tersedia: ${(100 - totalTanpaIni).toFixed(2)}%`
        })
      }
    }

    const fields = []
    const values = []
    let idx = 1

    if (nama_bobot !== undefined)       { fields.push(`nama_bobot = $${idx++}`);       values.push(nama_bobot) }
    if (persentase_bobot !== undefined) { fields.push(`persentase_bobot = $${idx++}`); values.push(persentase_bobot) }
    if (deskripsi !== undefined)        { fields.push(`deskripsi = $${idx++}`);         values.push(deskripsi) }
    if (status_aktif !== undefined)     { fields.push(`status_aktif = $${idx++}`);      values.push(status_aktif) }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Tidak ada field yang diupdate' })
    }

    values.push(id)
    const result = await pool.query(
      `UPDATE bobot SET ${fields.join(', ')} WHERE bobot_id = $${idx} RETURNING *`,
      values
    )

    res.json({ message: 'Bobot berhasil diupdate', bobot: result.rows[0] })
  } catch (err) {
    console.error('Update bobot error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// ── DELETE /api/bobot/:id ─────────────────────────────────────────────────
export const deleteBobot = async (req, res) => {
  const { id } = req.params

  try {
    const bobotResult = await pool.query('SELECT * FROM bobot WHERE bobot_id = $1', [id])
    if (bobotResult.rows.length === 0) {
      return res.status(404).json({ message: 'Bobot tidak ditemukan' })
    }

    // Cek apakah sudah dipakai di penilaian
    if (await isUsedInPenilaian(id)) {
      return res.status(409).json({ message: 'Bobot tidak bisa dihapus karena sudah digunakan dalam penilaian' })
    }

    await pool.query('DELETE FROM bobot WHERE bobot_id = $1', [id])
    res.json({ message: 'Bobot berhasil dihapus' })
  } catch (err) {
    console.error('Delete bobot error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}
