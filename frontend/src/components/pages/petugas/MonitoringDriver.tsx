'use client'

import { useMemo, useState } from 'react'
import { dummyUsers, User } from '@/data/dummyUsers'

const bobotPenilaian = {
  etikaAdab: 25,
  disiplin: 20,
  loyalitas: 20,
  skillMengemudi: 15,
  perawatanKendaraan: 10,
  performa: 10
}

interface DriverWithStats extends User {
  averageScore: number
  latestMonthScore: number
  trend: 'up' | 'down' | 'stable'
}

export default function ManajemenDriver() {
  const [selectedDriver, setSelectedDriver] = useState<DriverWithStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Aktif' | 'Nonaktif'>('all')
  const [petugasArmada] = useState<'A' | 'B' | 'C'>('A')

  const calculateWeightedScore = (skor: any) => {
    if (!skor) return 0
    const total =
      (skor.etikaAdab * bobotPenilaian.etikaAdab) / 100 +
      (skor.disiplin * bobotPenilaian.disiplin) / 100 +
      (skor.loyalitas * bobotPenilaian.loyalitas) / 100 +
      (skor.skillMengemudi * bobotPenilaian.skillMengemudi) / 100 +
      (skor.perawatanKendaraan * bobotPenilaian.perawatanKendaraan) / 100 +
      (skor.performa * bobotPenilaian.performa) / 100
    return Math.round(total * 10) / 10
  }

  const calculateAverageScore = (driver: User) => {
    if (!driver.skorBulanan || driver.skorBulanan.length === 0) {
      return calculateWeightedScore(driver.skor)
    }
    const totalScore = driver.skorBulanan.reduce((s, b) => s + calculateWeightedScore(b.skor), 0)
    return Math.round((totalScore / driver.skorBulanan.length) * 10) / 10
  }

  const driversWithStats = useMemo(() => {
    return dummyUsers
      .filter((u) => u.role === 'Supir' && u.namaArmada === petugasArmada)
      .map((d) => {
        const averageScore = calculateAverageScore(d)
        const latestMonthScore =
          d.skorBulanan && d.skorBulanan.length > 0
            ? calculateWeightedScore(d.skorBulanan[d.skorBulanan.length - 1].skor)
            : calculateWeightedScore(d.skor)

        let trend: 'up' | 'down' | 'stable' = 'stable'
        if (d.skorBulanan && d.skorBulanan.length >= 2) {
          const cur = calculateWeightedScore(d.skorBulanan[d.skorBulanan.length - 1].skor)
          const prev = calculateWeightedScore(d.skorBulanan[d.skorBulanan.length - 2].skor)
          if (cur > prev + 1) trend = 'up'
          else if (cur < prev - 1) trend = 'down'
        }

        return { ...d, averageScore, latestMonthScore, trend } as DriverWithStats
      })
  }, [petugasArmada])

  const filteredDrivers = useMemo(() => {
    return driversWithStats.filter((driver) => {
      const matchesSearch =
        driver.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (driver.namaKernet || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'Aktif'
          ? driver.status === 'Aktif'
          : driver.status === 'Nonaktif'
      return matchesSearch && matchesStatus
    })
  }, [driversWithStats, searchQuery, statusFilter])

  const handleStatusChange = (driverId: number, newStatus: 'Aktif' | 'Nonaktif') => {
    console.log(`Change status ${driverId} -> ${newStatus}`)
    setSelectedDriver(null)
  }

  const getStatusBadgeClass = (status: string) =>
    `status-pill ${status === 'Aktif' ? 'active' : 'inactive'}`

  const getTrendIndicator = (trend: 'up' | 'down' | 'stable') =>
    trend === 'up'
      ? { icon: '⬆️', color: '#16a34a', text: 'Meningkat' }
      : trend === 'down'
      ? { icon: '⬇️', color: '#dc2626', text: 'Menurun' }
      : { icon: '➡️', color: '#6b7280', text: 'Stabil' }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Monitoring Driver</h1>
            <p className="page-subtitle">Monitor dan kelola data driver di armada Anda</p>
          </div>
        </div>

        <div className="manajemen-controls">
          <div className="manajemen-summary">
            <p>
              Total Driver: <strong>{driversWithStats.length}</strong>
            </p>
            <p>
              Aktif: <strong>{driversWithStats.filter((d) => d.status === 'Aktif').length}</strong>
            </p>
            <p>
              Non-aktif:{' '}
              <strong>{driversWithStats.filter((d) => d.status === 'Nonaktif').length}</strong>
            </p>
          </div>

          <div className="manajemen-filters">
            <input
              className="search-input"
              placeholder="🔍 Cari driver atau kernet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Non-aktif</option>
            </select>
          </div>
        </div>

        <div className="driver-grid">
          {filteredDrivers.map((driver) => (
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
                  <span className="armada-badge">Armada {driver.namaArmada}</span>
                  <span className={getStatusBadgeClass(driver.status)}>{driver.status}</span>
                </div>
              </div>

              <div className="driver-card-body">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <p className="muted" style={{ flex: '1 1 45%' }}>
                    Bus: <strong style={{ color: '#667eea' }}>{driver.kodeBus || '-'}</strong>
                  </p>
                  <p className="muted" style={{ flex: '1 1 45%' }}>
                    Plat: <strong>{driver.nomorPolisi || '-'}</strong>
                  </p>
                </div>
                <p className="muted" style={{ marginBottom: '0.75rem' }}>
                  Kernet: <strong>{driver.namaKernet || '-'}</strong>
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

                <div className="driver-actions">
                  <a className="link" href="#">
                    📄 Lihat Detail →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDrivers.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>Tidak ada driver ditemukan</h3>
            <p>Coba ubah filter pencarian atau status</p>
          </div>
        )}

        {selectedDriver && (
          <div className="modal-overlay" onClick={() => setSelectedDriver(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Profil Driver</h2>
                <button className="modal-close" onClick={() => setSelectedDriver(null)}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="profile-section">
                  <h3 className="section-title">Informasi Dasar</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Nama Driver</span>
                      <span className="info-value">{selectedDriver.nama}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email</span>
                      <span className="info-value">{selectedDriver.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Kode Bus</span>
                      <span className="info-value" style={{ color: '#667eea', fontWeight: '600' }}>
                        {selectedDriver.kodeBus || '-'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Nomor Polisi</span>
                      <span className="info-value" style={{ fontWeight: '600' }}>
                        {selectedDriver.nomorPolisi || '-'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Armada</span>
                      <span className="info-value">Armada {selectedDriver.namaArmada}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Kernet</span>
                      <span className="info-value">
                        {selectedDriver.namaKernet || 'Tidak ada'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Status</span>
                      <span className={getStatusBadgeClass(selectedDriver.status)}>
                        {selectedDriver.status}
                      </span>
                    </div>
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
                </div>

                {selectedDriver.skorBulanan && selectedDriver.skorBulanan.length > 0 && (
                  <div className="profile-section">
                    <h3 className="section-title">Riwayat Performa</h3>
                    <div className="history-table">
                      <div className="table-header">
                        <span>Bulan</span>
                        <span>Etika & Adab</span>
                        <span>Disiplin</span>
                        <span>Loyalitas</span>
                        <span>Skill</span>
                        <span>Perawatan</span>
                        <span>Performa</span>
                        <span>Total</span>
                      </div>
                      {selectedDriver.skorBulanan.map((bulan, idx) => (
                        <div key={idx} className="table-row">
                          <span className="month-cell">{bulan.bulan}</span>
                          <span>{bulan.skor.etikaAdab}</span>
                          <span>{bulan.skor.disiplin}</span>
                          <span>{bulan.skor.loyalitas}</span>
                          <span>{bulan.skor.skillMengemudi}</span>
                          <span>{bulan.skor.perawatanKendaraan}</span>
                          <span>{bulan.skor.performa}</span>
                          <span className="total-cell">
                            {calculateWeightedScore(bulan.skor)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="profile-section">
                  <h3 className="section-title">Manajemen Status</h3>
                  <div className="status-management">
                    <p className="status-info">
                      Status saat ini:{' '}
                      <span className={getStatusBadgeClass(selectedDriver.status)}>
                        {selectedDriver.status}
                      </span>
                    </p>
                    <div className="status-actions">
                      {selectedDriver.status === 'Aktif' ? (
                        <button
                          className="status-btn inactive-btn"
                          onClick={() => handleStatusChange(selectedDriver.id, 'Nonaktif')}
                        >
                          Nonaktifkan Driver
                        </button>
                      ) : (
                        <button
                          className="status-btn active-btn"
                          onClick={() => handleStatusChange(selectedDriver.id, 'Aktif')}
                        >
                          Aktifkan Driver
                        </button>
                      )}
                    </div>
                    <p className="status-note">
                      <strong>Note:</strong> Perubahan status akan mempengaruhi akses driver ke
                      sistem dan perhitungan ranking armada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
