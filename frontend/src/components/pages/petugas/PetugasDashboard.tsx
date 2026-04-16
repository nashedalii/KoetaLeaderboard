'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/utils/api'

interface DriverBelumDinilai {
  driver_id: number
  nama_driver: string
  nama_kernet: string | null
  kode_bus: string | null
  nopol: string | null
}

interface PenilaianBulanIni {
  total: number
  pending: number
  approved: number
  rejected: number
}

interface PeriodeAktif {
  periode_id: number
  nama_periode: string
  bulan: string
  tahun: number
  tanggal_mulai: string
  tanggal_selesai: string
}

interface DashboardData {
  nama_petugas: string
  nama_armada: string
  total_driver_aktif: number
  periode_aktif: PeriodeAktif | null
  penilaian_bulan_ini: PenilaianBulanIni
  rata_skor_armada: number | null
  driver_belum_dinilai: DriverBelumDinilai[]
}

export default function PetugasDashboard() {
  const [data, setData]           = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await apiFetch('/api/dashboard/petugas')
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

  const { penilaian_bulan_ini: p } = data
  const submitPct = data.total_driver_aktif > 0
    ? Math.round(((data.total_driver_aktif - data.driver_belum_dinilai.length) / data.total_driver_aktif) * 100)
    : 0

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard Petugas</h1>
            <p className="page-subtitle">
              {data.nama_petugas} · Armada {data.nama_armada || '—'}
            </p>
          </div>
          {data.periode_aktif && (
            <div className="header-date">
              <span className="current-period">
                Periode Aktif: {data.periode_aktif.nama_periode}
              </span>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="overview-cards-grid">

          <div className="overview-card">
            <div className="card-icon drivers-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div className="card-content">
              <h3 className="card-title">Total Driver</h3>
              <p className="card-value">{data.total_driver_aktif}</p>
              <p className="card-subtitle">Driver aktif di armada {data.nama_armada}</p>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon status-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="card-content">
              <h3 className="card-title">Input Bulan Ini</h3>
              <div className="card-split-value">
                <div>
                  <p className="value-large completed">{p.approved}</p>
                  <p className="value-label">Approved</p>
                </div>
                <div>
                  <p className="value-large pending">{p.pending}</p>
                  <p className="value-label">Pending</p>
                </div>
                {p.rejected > 0 && (
                  <div>
                    <p className="value-large" style={{ color: '#ef4444' }}>{p.rejected}</p>
                    <p className="value-label">Rejected</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon score-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div className="card-content">
              <h3 className="card-title">Rata-rata Skor Armada</h3>
              <p className="card-value score">
                {data.rata_skor_armada != null
                  ? parseFloat(String(data.rata_skor_armada)).toFixed(1)
                  : '—'}
              </p>
              <p className="card-subtitle">
                {data.periode_aktif ? `Periode ${data.periode_aktif.nama_periode}` : 'Belum ada data'}
              </p>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon notification-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="card-content">
              <h3 className="card-title">Progress Input</h3>
              <p className="card-value">{submitPct}%</p>
              <p className="card-subtitle">
                {data.total_driver_aktif - data.driver_belum_dinilai.length} dari {data.total_driver_aktif} driver dinilai
              </p>
            </div>
          </div>

        </div>

        {/* Driver belum dinilai */}
        <div className="dashboard-section" style={{ marginTop: '2rem' }}>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <h2 className="section-title">Driver Belum Dinilai Bulan Ini</h2>
            <span className="section-subtitle">
              {data.driver_belum_dinilai.length === 0
                ? 'Semua driver sudah dinilai'
                : `${data.driver_belum_dinilai.length} driver belum dinilai`}
            </span>
          </div>

          {data.driver_belum_dinilai.length === 0 ? (
            <div className="alert-success">
              Semua driver di armada {data.nama_armada} sudah dinilai bulan ini.
            </div>
          ) : (
            <div className="belum-dinilai-list">
              {data.driver_belum_dinilai.map((driver) => (
                <div key={driver.driver_id} className="belum-dinilai-item">
                  <div className="belum-dinilai-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div className="belum-dinilai-info">
                    <span className="belum-dinilai-nama">{driver.nama_driver}</span>
                    <span className="belum-dinilai-meta">
                      {driver.kode_bus || '—'} · {driver.nopol || '—'}
                      {driver.nama_kernet ? ` · Kernet: ${driver.nama_kernet}` : ''}
                    </span>
                  </div>
                  <div className="belum-dinilai-badge">Belum Dinilai</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
