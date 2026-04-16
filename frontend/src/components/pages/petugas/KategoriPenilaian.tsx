'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@/utils/api'

interface RubricItem {
  range: string
  deskripsi: string
}

interface Bobot {
  bobot_id: number
  nama_bobot: string
  persentase_bobot: number | string
  deskripsi: string | null
}

interface Siklus {
  siklus_id: number
  nama_siklus: string
  status_display: string
}

const WARNA_LIST = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
]

export default function KategoriPenilaian() {
  const [siklusList, setSiklusList]           = useState<Siklus[]>([])
  const [selectedSiklusId, setSelectedSiklusId] = useState<number | null>(null)
  const [bobotList, setBobotList]             = useState<Bobot[]>([])
  const [expandedId, setExpandedId]           = useState<number | null>(null)
  const [isLoadingSiklus, setIsLoadingSiklus] = useState(true)
  const [isLoadingBobot, setIsLoadingBobot]   = useState(false)
  const [error, setError]                     = useState<string | null>(null)

  // Fetch daftar siklus
  useEffect(() => {
    const fetchSiklus = async () => {
      try {
        const data = await apiFetch('/api/siklus')
        setSiklusList(data || [])
        if (data && data.length > 0) {
          setSelectedSiklusId(data[0].siklus_id)
        }
      } catch {
        setError('Gagal memuat daftar siklus')
      } finally {
        setIsLoadingSiklus(false)
      }
    }
    fetchSiklus()
  }, [])

  // Fetch bobot saat siklus berubah
  const fetchBobot = useCallback(async () => {
    if (!selectedSiklusId) return
    setIsLoadingBobot(true)
    setError(null)
    try {
      const data = await apiFetch(`/api/bobot?siklus_id=${selectedSiklusId}`)
      setBobotList(data?.bobots || [])
    } catch {
      setError('Gagal memuat data bobot')
    } finally {
      setIsLoadingBobot(false)
    }
  }, [selectedSiklusId])

  useEffect(() => {
    fetchBobot()
  }, [fetchBobot])

  const parseRubric = (deskripsi: string | null): RubricItem[] => {
    if (!deskripsi) return []
    try {
      const arr = JSON.parse(deskripsi)
      return Array.isArray(arr) ? arr : []
    } catch { return [] }
  }

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (isLoadingSiklus) {
    return (
      <div className="dashboard-container">
        <div className="loading-message">Memuat data siklus...</div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">Kategori Penilaian Driver</h1>
          <p className="page-subtitle">Indikator dan rubric penilaian performa driver</p>
        </div>

        {/* Pilih Siklus */}
        <div className="filter-bar">
          <div className="filter-group">
            <label>Siklus Penilaian</label>
            <select
              value={selectedSiklusId ?? ''}
              onChange={e => setSelectedSiklusId(Number(e.target.value))}
            >
              {siklusList.map(s => (
                <option key={s.siklus_id} value={s.siklus_id}>
                  {s.nama_siklus}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {isLoadingBobot ? (
          <div className="loading-message">Memuat data bobot...</div>
        ) : bobotList.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada data bobot untuk siklus ini.</p>
          </div>
        ) : (
          <div className="kategori-penilaian-container">
            {/* Info Box */}
            <div className="kategori-info-box">
              <svg className="kategori-info-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <div className="kategori-info-content">
                <h3>Sistem Penilaian Berbobot</h3>
                <p>Penilaian driver menggunakan {bobotList.length} indikator dengan total bobot 100%. Klik setiap indikator untuk melihat rubric penilaian.</p>
              </div>
            </div>

            {/* Kategori Cards — 2 kolom independen */}
            <div className="kategori-columns">
              {[
                bobotList.filter((_, i) => i % 2 === 0),
                bobotList.filter((_, i) => i % 2 !== 0),
              ].map((col, colIdx) => (
                <div key={colIdx} className="kategori-col">
                  {col.map((bobot) => {
                    const index = bobotList.indexOf(bobot)
                    const warna = WARNA_LIST[index % WARNA_LIST.length]
                    const rubric = parseRubric(bobot.deskripsi)
                    const isExpanded = expandedId === bobot.bobot_id

                    return (
                      <div
                        key={bobot.bobot_id}
                        className={`kategori-card ${isExpanded ? 'expanded' : ''}`}
                        style={{ borderColor: isExpanded ? warna : 'transparent' }}
                      >
                        {/* Header card */}
                        <div className="kategori-header" onClick={() => toggleExpand(bobot.bobot_id)}>
                          <div className="kategori-header-left">
                            <div className="kategori-icon-wrapper" style={{ backgroundColor: warna }}>
                              <svg className="kategori-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="kategori-header-text">
                              <h3>{bobot.nama_bobot}</h3>
                              <p>{rubric.length > 0 ? `${rubric.length} range rubric` : 'Belum ada rubric'}</p>
                            </div>
                          </div>
                          <div className="kategori-header-right">
                            <span className="kategori-bobot-badge" style={{ backgroundColor: warna }}>
                              {parseFloat(String(bobot.persentase_bobot))}%
                            </span>
                            <svg className="kategori-toggle-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </div>
                        </div>

                        {/* Konten expandable */}
                        <div className="kategori-content">
                          <div className="kategori-content-inner">
                            {rubric.length === 0 ? (
                              <p className="kategori-deskripsi" style={{ borderLeftColor: warna }}>
                                Rubric belum diisi. Hubungi admin untuk melengkapi panduan penilaian.
                              </p>
                            ) : (
                              <table className="rubric-table">
                                <thead>
                                  <tr>
                                    <th className="rubric-th-range">Rentang Nilai</th>
                                    <th className="rubric-th-desc">Deskripsi Kriteria</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rubric.map((item, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'rubric-row-even' : 'rubric-row-odd'}>
                                      <td className="rubric-td-range" style={{ borderLeftColor: warna }}>
                                        {item.range}
                                      </td>
                                      <td className="rubric-td-desc">{item.deskripsi}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Summary bobot */}
            <div className="kategori-summary">
              <h3 className="kategori-summary-title">Distribusi Bobot Penilaian</h3>
              <div className="kategori-summary-grid">
                {bobotList.map((bobot, index) => {
                  const warna = WARNA_LIST[index % WARNA_LIST.length]
                  const pct = parseFloat(String(bobot.persentase_bobot))
                  return (
                    <div key={bobot.bobot_id} className="kategori-summary-item">
                      <div className="kategori-summary-label">
                        <span className="kategori-summary-color" style={{ backgroundColor: warna }}></span>
                        {bobot.nama_bobot}
                      </div>
                      <div className="kategori-progress-bar">
                        <div
                          className="kategori-progress-fill"
                          style={{ width: `${pct}%`, backgroundColor: warna }}
                        >
                          {pct}%
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
