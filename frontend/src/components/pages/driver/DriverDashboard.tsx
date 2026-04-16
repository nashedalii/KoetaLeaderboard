'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/utils/api'

interface DriverProfile {
  driver_id: number
  nama_driver: string
  nama_kernet: string | null
  email: string
  status_aktif: string
  nama_armada: string | null
  kode_bus: string | null
  nopol: string | null
}

interface ScoreItem {
  bobot_id: number
  nama_bobot: string
  persentase_bobot: number
  nilai: number
  weighted_score: number
}

interface PeriodeTerakhir {
  skor_total: number
  nama_periode: string
  bulan: string
  tahun: number
  scores: ScoreItem[]
}

interface RankingData {
  rank: number | null
  skor_total: number | null
  total_driver: number
  periode_terakhir: PeriodeTerakhir | null
}

interface Siklus {
  siklus_id: number
  nama_siklus: string
}

export default function DriverDashboard() {
  const [profile, setProfile]       = useState<DriverProfile | null>(null)
  const [ranking, setRanking]       = useState<RankingData | null>(null)
  const [siklusList, setSiklusList] = useState<Siklus[]>([])
  const [selectedSiklusId, setSelectedSiklusId] = useState<number | null>(null)
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState<string | null>(null)

  // Fetch siklus list
  useEffect(() => {
    const fetchSiklus = async () => {
      try {
        const data = await apiFetch('/api/siklus')
        setSiklusList(data || [])
        if (data && data.length > 0) {
          setSelectedSiklusId(data[0].siklus_id)
        }
      } catch {
        setError('Gagal memuat data siklus')
      }
    }
    fetchSiklus()
  }, [])

  // Fetch profil + ranking saat siklus berubah
  useEffect(() => {
    if (!selectedSiklusId) return

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [profileData, rankingData] = await Promise.all([
          apiFetch('/api/driver/me'),
          apiFetch(`/api/driver/me/ranking?siklus_id=${selectedSiklusId}`),
        ])
        setProfile(profileData)
        setRanking(rankingData)
      } catch {
        setError('Gagal memuat data dashboard')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [selectedSiklusId])

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-message">Memuat data...</div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="dashboard-container">
        <div className="alert-error">{error || 'Data tidak ditemukan'}</div>
      </div>
    )
  }

  const periode = ranking?.periode_terakhir

  return (
    <div className="driver-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">
            Selamat Datang, <span className="driver-name">{profile.nama_driver}</span>
          </h1>
          <p className="welcome-subtitle">Dashboard Informasi & Performa Anda</p>
        </div>
        <div className="welcome-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
      </div>

      {/* Pilih Siklus */}
      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="filter-group">
          <label>Siklus Penilaian</label>
          <select
            value={selectedSiklusId ?? ''}
            onChange={e => setSelectedSiklusId(Number(e.target.value))}
          >
            {siklusList.map(s => (
              <option key={s.siklus_id} value={s.siklus_id}>{s.nama_siklus}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Identity Card */}
      <div className="identity-simple-card">
        <div className="identity-status-row">
          <div className={`status-badge-inline ${profile.status_aktif === 'aktif' ? 'active' : 'inactive'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>Status: {profile.status_aktif === 'aktif' ? 'Aktif' : 'Nonaktif'}</span>
          </div>
        </div>

        <div className="identity-row">
          <div className="identity-item">
            <span className="identity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </span>
            <div className="identity-info">
              <span className="identity-simple-label">Nama:</span>
              <span className="identity-simple-value">{profile.nama_driver}</span>
            </div>
          </div>
          <div className="identity-item">
            <span className="identity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5h-6m3 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497" />
              </svg>
            </span>
            <div className="identity-info">
              <span className="identity-simple-label">Armada:</span>
              <span className="identity-simple-value">{profile.nama_armada || '-'}</span>
            </div>
          </div>
          <div className="identity-item">
            <span className="identity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
              </svg>
            </span>
            <div className="identity-info">
              <span className="identity-simple-label">Kode Bus:</span>
              <span className="identity-simple-value" style={{ color: '#667eea', fontWeight: '600' }}>{profile.kode_bus || '-'}</span>
            </div>
          </div>
        </div>

        <div className="identity-row">
          <div className="identity-item">
            <span className="identity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Z" />
              </svg>
            </span>
            <div className="identity-info">
              <span className="identity-simple-label">Nomor Polisi:</span>
              <span className="identity-simple-value" style={{ fontWeight: '600' }}>{profile.nopol || '-'}</span>
            </div>
          </div>
          <div className="identity-item">
            <span className="identity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </span>
            <div className="identity-info">
              <span className="identity-simple-label">ID Driver:</span>
              <span className="identity-simple-value">{profile.driver_id}</span>
            </div>
          </div>
          <div className="identity-item">
            <span className="identity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </span>
            <div className="identity-info">
              <span className="identity-simple-label">Nama Kernet:</span>
              <span className="identity-simple-value">{profile.nama_kernet || '-'}</span>
            </div>
          </div>
        </div>

        <div className="identity-row">
          <div className="identity-item identity-item-full">
            <span className="identity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </span>
            <div className="identity-info">
              <span className="identity-simple-label">Email:</span>
              <span className="identity-simple-value">{profile.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="performance-simple-section">
        <div className="performance-simple-grid">
          <div className="stat-simple-card score-card">
            <span className="stat-simple-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
              </svg>
            </span>
            <div className="stat-simple-content">
              <span className="stat-simple-label">
                Skor {periode ? `${periode.bulan} ${periode.tahun}` : 'Terkini'}:
              </span>
              <span className="stat-simple-value">
                {periode ? `${parseFloat(String(periode.skor_total)).toFixed(1)}/100` : '-'}
              </span>
            </div>
          </div>

          <div className="stat-simple-card rank-card">
            <span className="stat-simple-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </span>
            <div className="stat-simple-content">
              <span className="stat-simple-label">Peringkat dalam Siklus:</span>
              <span className="stat-simple-value">
                {ranking?.rank != null
                  ? `#${ranking.rank} dari ${ranking.total_driver} driver`
                  : 'Belum ada data'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rincian Skor Periode Terakhir */}
      {periode && periode.scores.length > 0 && (
        <div className="detailed-scores-section">
          <h3 className="detailed-scores-title">
            Rincian Penilaian — {periode.nama_periode}
          </h3>
          <div className="scores-grid">
            {periode.scores.map((score) => (
              <div key={score.bobot_id} className="score-item">
                <div className="score-item-header">
                  <span className="score-item-label">{score.nama_bobot}</span>
                  <span className="score-item-value">{score.nilai}/100</span>
                </div>
                <div className="score-bar-container">
                  <div
                    className="score-bar"
                    style={{ width: `${score.nilai}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jika belum ada penilaian dalam siklus ini */}
      {(!periode) && (
        <div className="empty-state" style={{ marginTop: '1.5rem' }}>
          <p>Belum ada penilaian yang disetujui dalam siklus ini.</p>
        </div>
      )}
    </div>
  )
}
