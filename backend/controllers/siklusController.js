import pool from '../config/db.js'

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// ── Helper: format angka jadi 2 digit ────────────────────────────────────
const pad = n => String(n).padStart(2, '0')

// ── Helper: generate daftar periode bulanan ──────────────────────────────
// Menggunakan string YYYY-MM-DD langsung untuk menghindari timezone offset
function generatePeriodes(siklusId, tanggalMulai, tanggalSelesai) {
  // Parse komponen tanggal dari string (hindari new Date(string) yang bisa shift timezone)
  const [startYear, startMonth] = tanggalMulai.split('-').map(Number)
  const [endYear,   endMonth]   = tanggalSelesai.split('-').map(Number)

  const periodes = []
  let year  = startYear
  let month = startMonth // 1-indexed (Januari = 1)

  while (year < endYear || (year === endYear && month <= endMonth)) {
    // tanggal_mulai = hari pertama bulan (string langsung, tanpa Date)
    const firstDay = `${year}-${pad(month)}-01`

    // tanggal_selesai = hari terakhir bulan
    // new Date(year, month, 0): month di sini 1-indexed, day 0 = hari terakhir bulan sebelumnya
    // contoh: new Date(2025, 9, 0) = 30 Sep 2025 (hari terakhir Agustus ke-9 → September hari 0)
    const lastDate = new Date(year, month, 0)
    const lastDay  = `${lastDate.getFullYear()}-${pad(lastDate.getMonth() + 1)}-${pad(lastDate.getDate())}`

    periodes.push({
      bulan:           BULAN[month - 1], // BULAN array 0-indexed
      tahun:           year,
      nama_periode:    `${BULAN[month - 1]} ${year}`,
      tanggal_mulai:   firstDay,
      tanggal_selesai: lastDay,
      siklus_id:       siklusId,
    })

    // Pindah ke bulan berikutnya
    month++
    if (month > 12) {
      month = 1
      year++
    }
  }

  return periodes
}

// ── GET /api/siklus ──────────────────────────────────────────────────────
export const getAllSiklus = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*,
        CASE
          WHEN s.status_siklus = 'nonaktif'        THEN 'nonaktif'
          WHEN s.tanggal_mulai > CURRENT_DATE       THEN 'belum_dimulai'
          WHEN s.tanggal_selesai < CURRENT_DATE     THEN 'selesai'
          ELSE 'berjalan'
        END AS status_display,
        COUNT(p.periode_id)::int AS jumlah_periode
      FROM siklus_penilaian s
      LEFT JOIN periode p ON p.siklus_id = s.siklus_id
      GROUP BY s.siklus_id
      ORDER BY s.tanggal_mulai DESC
    `)
    res.json(result.rows)
  } catch (err) {
    console.error('Get all siklus error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// ── GET /api/siklus/:id ───────────────────────────────────────────────────
export const getSiklusById = async (req, res) => {
  const { id } = req.params
  try {
    const siklusResult = await pool.query(
      'SELECT * FROM siklus_penilaian WHERE siklus_id = $1', [id]
    )
    if (siklusResult.rows.length === 0) {
      return res.status(404).json({ message: 'Siklus tidak ditemukan' })
    }

    const periodeResult = await pool.query(`
      SELECT p.*,
        CASE
          WHEN p.is_override = true THEN true
          WHEN NOT EXISTS (
            SELECT 1 FROM periode WHERE siklus_id = p.siklus_id AND is_override = true
          ) AND CURRENT_DATE BETWEEN p.tanggal_mulai AND p.tanggal_selesai THEN true
          ELSE false
        END AS is_aktif
      FROM periode p
      WHERE p.siklus_id = $1
      ORDER BY p.tanggal_mulai
    `, [id])

    res.json({
      siklus: siklusResult.rows[0],
      periodes: periodeResult.rows
    })
  } catch (err) {
    console.error('Get siklus by id error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// ── POST /api/siklus ─────────────────────────────────────────────────────
export const createSiklus = async (req, res) => {
  const { nama_siklus, tanggal_mulai, tanggal_selesai } = req.body

  if (!nama_siklus || !tanggal_mulai || !tanggal_selesai) {
    return res.status(400).json({ message: 'nama_siklus, tanggal_mulai, dan tanggal_selesai wajib diisi' })
  }

  if (new Date(tanggal_selesai) <= new Date(tanggal_mulai)) {
    return res.status(400).json({ message: 'tanggal_selesai harus setelah tanggal_mulai' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. Insert siklus
    const siklusResult = await client.query(
      `INSERT INTO siklus_penilaian (nama_siklus, tanggal_mulai, tanggal_selesai)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nama_siklus, tanggal_mulai, tanggal_selesai]
    )
    const siklus = siklusResult.rows[0]

    // 2. Generate & insert periode bulanan
    const periodes = generatePeriodes(siklus.siklus_id, tanggal_mulai, tanggal_selesai)

    for (const p of periodes) {
      await client.query(
        `INSERT INTO periode (bulan, tahun, nama_periode, tanggal_mulai, tanggal_selesai, siklus_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [p.bulan, p.tahun, p.nama_periode, p.tanggal_mulai, p.tanggal_selesai, p.siklus_id]
      )
    }

    await client.query('COMMIT')

    res.status(201).json({
      message: `Siklus berhasil dibuat dengan ${periodes.length} periode bulanan`,
      siklus,
      jumlah_periode: periodes.length
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Create siklus error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  } finally {
    client.release()
  }
}
