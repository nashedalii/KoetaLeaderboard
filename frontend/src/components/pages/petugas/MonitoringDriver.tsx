'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '@/utils/api'

// ── Types ──────────────────────────────────────────────────────────────
interface DriverData {
  id: number
  nama: string
  nama_kernet: string | null
  username: string
  email: string
  status_aktif: 'aktif' | 'nonaktif'
  armada_id: number
  kode_armada: string
  nama_armada: string
  kode_bus: string | null
  nopol: string | null
}

interface DriverWithStats extends DriverData {
  averageScore: number
  latestMonthScore: number
  trend: 'up' | 'down' | 'stable'
}

// ── Helpers ────────────────────────────────────────────────────────────
function getArmadaIdFromAuth(): number | null {
  try {
    const raw = localStorage.getItem('auth')
    if (!raw) return null
    const auth = JSON.parse(raw)
    return auth?.user?.armada_id ?? null
  } catch {
    return null
  }
}

// ── Component ──────────────────────────────────────────────────────────
export default function MonitoringDriver() {
  const [drivers, setDrivers] = useState<DriverWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDriver, setSelectedDriver] = useState<DriverWithStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'nonaktif'>('all')

  // ── Fetch drivers by armada ──────────────────────────────────────────
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true)
        setError('')

        const armadaId = getArmadaIdFromAuth()
        const endpoint = armadaId
          ? `/api/users/driver?armada_id=${armadaId}`
          : '/api/users/driver'

        const data: DriverData[] = await apiFetch(endpoint)

        // Skor masih statis sampai Fase 3 (penilaian) selesai
        const withStats: DriverWithStats[] = (data ?? []).map(d => ({
          ...d,
          averageScore: 0,
          latestMonthScore: 0,
          trend: 'stable'
        }))

        setDrivers(withStats)
      } catch (err: any) {
        setError(err.message ?? 'Gagal memuat data driver')
      } finally {
        setLoading(false)
      }
    }

    fetchDrivers()
  }, [])

  // ── Filter ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return drivers.filter(d => {
      const matchSearch =
        d.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.nama_kernet ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus =
        statusFilter === 'all' ? true : d.status_aktif === statusFilter
      return matchSearch && matchStatus
    })
  }, [drivers, searchQuery, statusFilter])

  const getTrendIndicator = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up')   return { icon: '⬆️', color: '#16a34a', text: 'Meningkat' }
    if (trend === 'down') return { icon: '⬇️', color: '#dc2626', text: 'Menurun' }
    return { icon: '➡️', color: '#6b7280', text: 'Stabil' }
  }

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Monitoring Driver</h1>
            <p className="page-subtitle">Monitor data driver di armada Anda</p>
          </div>
        </div>

        {/* Summary */}
        {!loading && !error && (
          <div className="manajemen-controls">
            <div className="manajemen-summary">
              <p>Total Driver: <strong>{drivers.length}</strong></p>
              <p>Aktif: <strong>{drivers.filter(d => d.status_aktif === 'aktif').length}</strong></p>
              <p>Non-aktif: <strong>{drivers.filter(d => d.status_aktif === 'nonaktif').length}</strong></p>
            </div>

            <div className="manajemen-filters">
              <input
                className="search-input"
                placeholder="🔍 Cari driver atau kernet..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <select
                className="filter-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Non-aktif</option>
              </select>
            </div>
          </div>
        )}

        {/* States */}
        {loading ? (
          <div className="loading-state">Memuat data driver...</div>
        ) : error ? (
          <div className="error-state"><p>{error}</p></div>
        ) : (
          <>
            <div className="driver-grid">
              {filtered.map(driver => (
                <div
                  key={driver.id}
                  className="driver-card"
                  onClick={() => setSelectedDriver(driver)}
                >
                  <div className="driver-card-header">
                    <div>
                      <h3 className="driver-name">{driver.nama}</h3>
                    </div>
                    <div className="driver-right">
                      <span className="armada-badge">{driver.nama_armada}</span>
                      <span className={`status-pill ${driver.status_aktif === 'aktif' ? 'active' : 'inactive'}`}>
                        {driver.status_aktif === 'aktif' ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </div>
                  </div>

                  <div className="driver-card-body">
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <p className="muted" style={{ flex: '1 1 45%' }}>
                        Bus: <strong style={{ color: '#667eea' }}>{driver.kode_bus ?? '-'}</strong>
                      </p>
                      <p className="muted" style={{ flex: '1 1 45%' }}>
                        Plat: <strong>{driver.nopol ?? '-'}</strong>
                      </p>
                    </div>
                    <p className="muted" style={{ marginBottom: '0.75rem' }}>
                      Kernet: <strong>{driver.nama_kernet ?? '-'}</strong>
                    </p>

                    <div className="metric">
                      <div>
                        <p className="muted">Rata-rata</p>
                        <p className="large">{driver.averageScore} poin</p>
                      </div>
                      <div>
                        <p className="muted">Bulan Ini</p>
                        <p className="large">{driver.latestMonthScore}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>Tidak ada driver ditemukan</h3>
                <p>Coba ubah filter pencarian atau status</p>
              </div>
            )}
          </>
        )}

        {/* ── Detail Modal (Read Only) ── */}
        {selectedDriver && (
          <div className="modal-overlay" onClick={() => setSelectedDriver(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Profil Driver</h2>
                <button className="modal-close" onClick={() => setSelectedDriver(null)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="profile-section">
                  <h3 className="section-title">Informasi Dasar</h3>
                  <div className="info-grid">
                    {[
                      { label: 'Nama Driver',  value: selectedDriver.nama },
                      { label: 'Username',     value: selectedDriver.username },
                      { label: 'Email',        value: selectedDriver.email },
                      { label: 'Kode Bus',     value: selectedDriver.kode_bus ?? '-' },
                      { label: 'Nomor Polisi', value: selectedDriver.nopol ?? '-' },
                      { label: 'Armada',       value: selectedDriver.nama_armada },
                      { label: 'Kernet',       value: selectedDriver.nama_kernet ?? 'Tidak ada' },
                      { label: 'Status',       value: selectedDriver.status_aktif === 'aktif' ? 'Aktif' : 'Non-aktif' },
                    ].map(item => (
                      <div key={item.label} className="info-item">
                        <span className="info-label">{item.label}</span>
                        <span className="info-value">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="profile-section">
                  <h3 className="section-title">Overview Performa</h3>
                  <div className="performance-grid">
                    <div className="perf-card">
                      <span className="perf-label">Rata-rata Total</span>
                      <span className="perf-value main">{selectedDriver.averageScore}</span>
                    </div>
                    <div className="perf-card">
                      <span className="perf-label">Skor Terbaru</span>
                      <span className="perf-value">{selectedDriver.latestMonthScore}</span>
                    </div>
                    <div className="perf-card">
                      <span className="perf-label">Trend</span>
                      <div className="trend-display">
                        <span>{getTrendIndicator(selectedDriver.trend).icon}</span>
                        <span style={{ color: getTrendIndicator(selectedDriver.trend).color }}>
                          {getTrendIndicator(selectedDriver.trend).text}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    * Data skor akan tersedia setelah fitur penilaian aktif
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
