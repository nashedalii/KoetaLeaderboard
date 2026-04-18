import pool from '../config/db.js'

// ── GET /api/dashboard/admin ──────────────────────────────────────────────
export const getAdminDashboard = async (req, res) => {
  try {
    const [
      driverResult,
      armadaResult,
      petugasResult,
      pendingResult,
      approvedBulanIniResult,
      periodeAktifResult,
    ] = await Promise.all([
      // Total driver aktif
      pool.query(`SELECT COUNT(*) AS total FROM driver WHERE status_aktif = 'aktif'`),
      // Total armada
      pool.query(`SELECT COUNT(*) AS total FROM armada`),
      // Total petugas aktif
      pool.query(`SELECT COUNT(*) AS total FROM petugas WHERE status_aktif = 'aktif'`),
      // Total penilaian pending validasi
      pool.query(`SELECT COUNT(*) AS total FROM penilaian WHERE status_validasi = 'pending'`),
      // Total penilaian approved bulan ini
      pool.query(`
        SELECT COUNT(*) AS total FROM penilaian
        WHERE status_validasi = 'approved'
          AND DATE_TRUNC('month', updated_at) = DATE_TRUNC('month', CURRENT_DATE)
      `),
      // Periode aktif (tanggal hari ini ada di rentang periode)
      pool.query(`
        SELECT periode_id, nama_periode, bulan, tahun
        FROM periode
        WHERE tanggal_mulai <= CURRENT_DATE AND tanggal_selesai >= CURRENT_DATE
        LIMIT 1
      `),
    ])

    const periodeAktif = periodeAktifResult.rows[0] || null

    // Top 5 ranking — dari periode terbaru yang ada penilaian approved
    let top5 = []
    if (periodeAktif) {
      const top5Result = await pool.query(`
        SELECT
          DENSE_RANK() OVER (ORDER BY p.skor_total DESC) AS rank,
          d.nama_driver,
          d.foto_profil,
          a.nama_armada,
          b.kode_bus,
          p.skor_total
        FROM penilaian p
        JOIN driver d ON p.driver_id = d.driver_id
        JOIN armada a ON d.armada_id = a.armada_id
        JOIN bus    b ON p.bus_id    = b.bus_id
        WHERE p.status_validasi = 'approved'
          AND p.periode_id = $1
        ORDER BY rank, d.nama_driver
        LIMIT 5
      `, [periodeAktif.periode_id])
      top5 = top5Result.rows
    } else {
      // Fallback: periode terakhir yang ada penilaian approved
      const lastPeriodeResult = await pool.query(`
        SELECT pr.periode_id, pr.nama_periode, pr.bulan, pr.tahun
        FROM penilaian p
        JOIN periode pr ON p.periode_id = pr.periode_id
        WHERE p.status_validasi = 'approved'
        ORDER BY pr.tanggal_mulai DESC
        LIMIT 1
      `)
      if (lastPeriodeResult.rows.length > 0) {
        const lastPeriode = lastPeriodeResult.rows[0]
        const top5Result = await pool.query(`
          SELECT
            DENSE_RANK() OVER (ORDER BY p.skor_total DESC) AS rank,
            d.nama_driver,
            d.foto_profil,
            a.nama_armada,
            b.kode_bus,
            p.skor_total,
            $2 AS nama_periode
          FROM penilaian p
          JOIN driver d ON p.driver_id = d.driver_id
          JOIN armada a ON d.armada_id = a.armada_id
          JOIN bus    b ON p.bus_id    = b.bus_id
          WHERE p.status_validasi = 'approved'
            AND p.periode_id = $1
          ORDER BY rank, d.nama_driver
          LIMIT 5
        `, [lastPeriode.periode_id, lastPeriode.nama_periode])
        top5 = top5Result.rows
      }
    }

    res.json({
      total_driver_aktif:      parseInt(driverResult.rows[0].total),
      total_armada:            parseInt(armadaResult.rows[0].total),
      total_petugas_aktif:     parseInt(petugasResult.rows[0].total),
      total_pending_validasi:  parseInt(pendingResult.rows[0].total),
      total_approved_bulan_ini: parseInt(approvedBulanIniResult.rows[0].total),
      periode_aktif:           periodeAktif,
      top5_ranking:            top5,
    })
  } catch (err) {
    console.error('Admin dashboard error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}

// ── GET /api/dashboard/petugas ────────────────────────────────────────────
export const getPetugasDashboard = async (req, res) => {
  const petugas_id = req.user.user_id

  try {
    // Profil petugas + armada
    const petugasResult = await pool.query(`
      SELECT pt.nama_petugas, pt.nomor_pegawai, a.armada_id, a.nama_armada
      FROM petugas pt
      LEFT JOIN armada a ON pt.armada_id = a.armada_id
      WHERE pt.petugas_id = $1
    `, [petugas_id])

    if (petugasResult.rows.length === 0) {
      return res.status(404).json({ message: 'Petugas tidak ditemukan' })
    }

    const petugas = petugasResult.rows[0]
    const armada_id = petugas.armada_id

    // Periode aktif
    const periodeAktifResult = await pool.query(`
      SELECT periode_id, nama_periode, bulan, tahun, tanggal_mulai, tanggal_selesai
      FROM periode
      WHERE tanggal_mulai <= CURRENT_DATE AND tanggal_selesai >= CURRENT_DATE
      LIMIT 1
    `)
    const periodeAktif = periodeAktifResult.rows[0] || null

    // Total driver aktif di armada ini
    const totalDriverResult = await pool.query(`
      SELECT COUNT(*) AS total FROM driver
      WHERE armada_id = $1 AND status_aktif = 'aktif'
    `, [armada_id])

    // Status penilaian bulan ini yang disubmit petugas ini
    const statusPenilaianResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE TRUE)                              AS total,
        COUNT(*) FILTER (WHERE status_validasi = 'pending')       AS pending,
        COUNT(*) FILTER (WHERE status_validasi = 'approved')      AS approved,
        COUNT(*) FILTER (WHERE status_validasi = 'rejected')      AS rejected
      FROM penilaian
      WHERE created_by = $1
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `, [petugas_id])

    // Rata-rata skor driver armada (periode terakhir yang ada penilaian)
    let rataSkorArmada = null
    if (periodeAktif) {
      const rataResult = await pool.query(`
        SELECT ROUND(AVG(p.skor_total)::numeric, 2) AS rata_rata
        FROM penilaian p
        JOIN driver d ON p.driver_id = d.driver_id
        WHERE d.armada_id = $1
          AND p.status_validasi = 'approved'
          AND p.periode_id = $2
      `, [armada_id, periodeAktif.periode_id])
      rataSkorArmada = rataResult.rows[0]?.rata_rata ?? null
    }

    // Driver di armada ini yang BELUM dinilai bulan ini oleh petugas ini
    const belumDinilaiResult = await pool.query(`
      SELECT d.driver_id, d.nama_driver, d.nama_kernet, b.kode_bus, b.nopol
      FROM driver d
      LEFT JOIN bus b ON b.driver_id = d.driver_id AND b.status_aktif = 'aktif'
      WHERE d.armada_id = $1
        AND d.status_aktif = 'aktif'
        AND d.driver_id NOT IN (
          SELECT p.driver_id FROM penilaian p
          WHERE p.created_by = $2
            AND DATE_TRUNC('month', p.created_at) = DATE_TRUNC('month', CURRENT_DATE)
        )
      ORDER BY d.nama_driver
    `, [armada_id, petugas_id])

    const statusPenilaian = statusPenilaianResult.rows[0]

    res.json({
      nama_petugas:       petugas.nama_petugas,
      nama_armada:        petugas.nama_armada,
      total_driver_aktif: parseInt(totalDriverResult.rows[0].total),
      periode_aktif:      periodeAktif,
      penilaian_bulan_ini: {
        total:    parseInt(statusPenilaian.total),
        pending:  parseInt(statusPenilaian.pending),
        approved: parseInt(statusPenilaian.approved),
        rejected: parseInt(statusPenilaian.rejected),
      },
      rata_skor_armada:   rataSkorArmada ? parseFloat(rataSkorArmada) : null,
      driver_belum_dinilai: belumDinilaiResult.rows,
    })
  } catch (err) {
    console.error('Petugas dashboard error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}
