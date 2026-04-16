'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/utils/api'

interface Top5Item {
  rank: number
  nama_driver: string
  nama_armada: string
  kode_bus: string
  skor_total: string | number
  nama_periode?: string
}

interface PeriodeAktif {
  periode_id: number
  nama_periode: string
  bulan: string
  tahun: number
}

interface DashboardData {
  total_driver_aktif: number
  total_armada: number
  total_petugas_aktif: number
  total_pending_validasi: number
  total_approved_bulan_ini: number
  periode_aktif: PeriodeAktif | null
  top5_ranking: Top5Item[]
}

const RANK_COLORS = ['#f59e0b', '#94a3b8', '#cd7f32', '#667eea', '#667eea']
const RANK_LABELS = ['🥇', '🥈', '🥉', '4', '5']

export default function AdminDashboard() {
  const [data, setData]       = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await apiFetch('/api/dashboard/admin')
        setData(result)
      } catch {
        setError('Gagal memuat data dashboard')
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-message">Memuat dashboard...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="dashboard-container">
        <div className="alert-error">{error || 'Data tidak tersedia'}</div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard Admin</h1>
            <p className="page-subtitle">
              {data.periode_aktif
                ? `Periode aktif: ${data.periode_aktif.nama_periode}`
                : 'Tidak ada periode aktif saat ini'}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="stats-grid">

          <div className="stat-card driver-card">
            <div className="stat-header">
              <h3>Driver Aktif</h3>
              <div className="stat-icon driver-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </div>
            <div className="stat-number">{data.total_driver_aktif}</div>
            <div className="stat-trend neutral">
              <span>{data.total_armada} armada · {data.total_petugas_aktif} petugas aktif</span>
            </div>
          </div>

          <div className="stat-card validation-card">
            <div className="stat-header">
              <h3>Pending Validasi</h3>
              <div className="stat-icon validation-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
            </div>
            <div className="stat-number">
              <span className="main-number">{data.total_pending_validasi}</span>
              {data.total_pending_validasi > 0 && (
                <span className="pending-text">Perlu Review</span>
              )}
            </div>
            <div className={`stat-trend ${data.total_pending_validasi > 0 ? 'negative' : 'positive'}`}>
              <span>
                {data.total_pending_validasi > 0
                  ? 'Segera lakukan validasi'
                  : 'Semua sudah divalidasi'}
              </span>
            </div>
          </div>

          <div className="stat-card armada-card">
            <div className="stat-header">
              <h3>Approved Bulan Ini</h3>
              <div className="stat-icon armada-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="stat-number">{data.total_approved_bulan_ini}</div>
            <div className="stat-trend positive">
              <span>Penilaian tervalidasi bulan ini</span>
            </div>
          </div>

          <div className="stat-card leaderboard-card">
            <div className="stat-header">
              <h3>Periode Aktif</h3>
              <div className="stat-icon leaderboard-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
            </div>
            <div className="stat-number" style={{ fontSize: '1.2rem' }}>
              {data.periode_aktif ? data.periode_aktif.nama_periode : '—'}
            </div>
            <div className="stat-trend neutral">
              <span>{data.periode_aktif ? 'Sedang berjalan' : 'Tidak ada periode aktif'}</span>
            </div>
          </div>

        </div>

        {/* Top 5 Ranking */}
        <div className="dashboard-section" style={{ marginTop: '2rem' }}>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <h2 className="section-title">Top 5 Driver</h2>
            <span className="section-subtitle">
              {data.top5_ranking[0]?.nama_periode
                ? `Periode: ${data.top5_ranking[0].nama_periode}`
                : data.periode_aktif
                ? `Periode: ${data.periode_aktif.nama_periode}`
                : 'Berdasarkan periode terakhir'}
            </span>
          </div>

          {data.top5_ranking.length === 0 ? (
            <div className="empty-state">
              <p>Belum ada penilaian yang disetujui.</p>
            </div>
          ) : (
            <div className="top5-list">
              {data.top5_ranking.map((item, index) => (
                <div key={index} className="top5-item">
                  <div className="top5-rank" style={{ color: RANK_COLORS[index] }}>
                    {RANK_LABELS[index]}
                  </div>
                  <div className="top5-info">
                    <span className="top5-name">{item.nama_driver}</span>
                    <span className="top5-meta">{item.nama_armada} · {item.kode_bus}</span>
                  </div>
                  <div className="top5-score">
                    {parseFloat(String(item.skor_total)).toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
