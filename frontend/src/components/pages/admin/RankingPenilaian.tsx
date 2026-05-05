'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Siklus {
  siklus_id: number
  nama_siklus: string
}

interface Periode {
  periode_id: number
  nama_periode: string
  bulan: string
  tahun: number
}

interface Bobot {
  bobot_id: number
  nama_bobot: string
  persentase_bobot: number
}

interface Armada {
  armada_id: number
  kode_armada: string
  nama_armada: string
}

interface DriverRanking {
  rank: number
  driver_id: number
  nama_driver: string
  nama_kernet: string | null
  nama_armada: string
  kode_bus: string
  nopol: string
  skor_total: number
  indicators: { bobot_id: number; weighted_score: number }[]
}

interface RankingData {
  mode: 'periode' | 'siklus'
  bobot: Bobot[]
  ranking: DriverRanking[]
}

interface PeriodeBreakdown {
  penilaian_id: number
  skor_total: number
  nama_periode: string
  bulan: string
  tahun: number
  kode_bus: string
  nopol: string
  nama_armada: string
  indicators: { bobot_id: number; weighted_score: number }[]
}

interface DetailData {
  driver: { nama_driver: string; nama_kernet: string | null; nama_armada: string }
  bobot: Bobot[]
  periodes: PeriodeBreakdown[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const apiBase = process.env.NEXT_PUBLIC_API_URL || ''
const getToken = () => {
  try { return JSON.parse(localStorage.getItem('auth') || '{}').token || '' }
  catch { return '' }
}
const getAuth = () => {
  try { return JSON.parse(localStorage.getItem('auth') || '{}') }
  catch { return {} }
}
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` })

// ── Component ─────────────────────────────────────────────────────────────────
export default function RankingPenilaian() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  // Selectors
  const [siklusList, setSiklusList]         = useState<Siklus[]>([])
  const [selectedSiklus, setSelectedSiklus] = useState<number | ''>('')
  const [periodeList, setPeriodeList]       = useState<Periode[]>([])
  const [selectedPeriode, setSelectedPeriode] = useState<number | 'all'>('all')

  // Armada filter (super_admin only)
  const [armadaList, setArmadaList]         = useState<Armada[]>([])
  const [selectedArmada, setSelectedArmada] = useState<number | ''>('')

  // Sort
  const [sortField, setSortField]   = useState<string>('rank')
  const [sortDir, setSortDir]       = useState<'asc' | 'desc'>('asc')

  // Data
  const [rankingData, setRankingData] = useState<RankingData | null>(null)
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState<string | null>(null)

  // Detail view
  const [detailDriver, setDetailDriver]     = useState<DriverRanking | null>(null)
  const [detailData, setDetailData]         = useState<DetailData | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  // ── Detect role & fetch armada list (super_admin only) ─────────────────────
  useEffect(() => {
    const auth = getAuth()
    const role = auth?.user?.role
    if (role === 'super_admin') {
      setIsSuperAdmin(true)
      fetch(`${apiBase}/api/armada`, { headers: authHeader() })
        .then(r => r.json())
        .then(d => setArmadaList(Array.isArray(d) ? d : []))
        .catch(() => {})
    }
  }, [])

  // ── Fetch siklus list ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${apiBase}/api/siklus`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => setSiklusList(d.siklus || d || []))
      .catch(() => {})
  }, [])

  // ── Fetch periode list when siklus changes ─────────────────────────────────
  useEffect(() => {
    if (!selectedSiklus) { setPeriodeList([]); return }
    fetch(`${apiBase}/api/siklus/${selectedSiklus}`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => setPeriodeList(d.periodes || []))
      .catch(() => {})
    setSelectedPeriode('all')
    setRankingData(null)
  }, [selectedSiklus])

  // ── Fetch ranking ──────────────────────────────────────────────────────────
  const fetchRanking = useCallback(async () => {
    if (!selectedSiklus) return
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedPeriode === 'all') {
        params.set('mode', 'siklus')
        params.set('siklus_id', String(selectedSiklus))
      } else {
        params.set('mode', 'periode')
        params.set('periode_id', String(selectedPeriode))
      }
      // Super admin: server-side armada filter
      if (isSuperAdmin && selectedArmada) {
        params.set('armada_id', String(selectedArmada))
      }

      const res  = await fetch(`${apiBase}/api/ranking?${params}`, { headers: authHeader() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setRankingData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [selectedSiklus, selectedPeriode, selectedArmada, isSuperAdmin])

  useEffect(() => { fetchRanking() }, [fetchRanking])

  // ── Open driver detail ─────────────────────────────────────────────────────
  const openDetail = async (driver: DriverRanking) => {
    setDetailDriver(driver)
    setDetailData(null)
    setIsLoadingDetail(true)
    try {
      const res  = await fetch(
        `${apiBase}/api/ranking/driver/${driver.driver_id}?siklus_id=${selectedSiklus}`,
        { headers: authHeader() }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setDetailData(data)
    } catch { /* detail stays null */ }
    finally { setIsLoadingDetail(false) }
  }

  // ── Client-side sort only (armada filter is server-side for super_admin) ──
  const displayRows = useMemo(() => {
    if (!rankingData) return []

    let rows = [...rankingData.ranking]

    if (sortField === 'rank') {
      rows = [...rows].sort((a, b) =>
        sortDir === 'asc' ? a.rank - b.rank : b.rank - a.rank
      )
    } else if (sortField === 'total') {
      rows = [...rows].sort((a, b) =>
        sortDir === 'asc'
          ? Number(a.skor_total) - Number(b.skor_total)
          : Number(b.skor_total) - Number(a.skor_total)
      )
    } else {
      // sort by bobot_id
      const bobotId = Number(sortField)
      rows = [...rows].sort((a, b) => {
        const wa = a.indicators.find(i => i.bobot_id === bobotId)?.weighted_score ?? 0
        const wb = b.indicators.find(i => i.bobot_id === bobotId)?.weighted_score ?? 0
        return sortDir === 'asc' ? wa - wb : wb - wa
      })
    }
    return rows
  }, [rankingData, sortField, sortDir])

  // ── Sort handler ───────────────────────────────────────────────────────────
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir(field === 'rank' ? 'asc' : 'desc')
    }
  }

  // ── Sort icon ──────────────────────────────────────────────────────────────
  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return (
      <svg className="sort-icon inactive" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
      </svg>
    )
    return sortDir === 'asc' ? (
      <svg className="sort-icon active" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
      </svg>
    ) : (
      <svg className="sort-icon active" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Ranking Penilaian Driver</h1>
            <p className="page-subtitle">Peringkat driver berdasarkan performa dan penilaian</p>
          </div>
        </div>

        {/* ── Detail View ──────────────────────────────────────────────────── */}
        {detailDriver ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Back button — compact inline */}
            <div>
              <button
                onClick={() => { setDetailDriver(null); setDetailData(null) }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'none', border: '1px solid #e2e8f0',
                  borderRadius: 8, padding: '6px 14px',
                  fontSize: '0.875rem', fontWeight: 500, color: '#475569',
                  cursor: 'pointer', transition: 'all 150ms ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#0f172a'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'none'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#475569'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 16, height: 16 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Kembali ke Ranking
              </button>
            </div>

            {/* Driver Hero Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #0ea5e9 100%)',
              borderRadius: 16, padding: '28px 32px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 20, flexWrap: 'wrap',
              boxShadow: '0 4px 24px rgba(15,23,42,0.18)',
            }}>
              {/* Left: identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                {/* Avatar circle */}
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)',
                  border: '2px solid rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="rgba(255,255,255,0.8)" style={{ width: 32, height: 32 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <h2 style={{ margin: 0, color: '#fff', fontSize: '1.375rem', fontWeight: 700, lineHeight: 1.3 }}>
                    {detailDriver.nama_driver}
                  </h2>
                  {detailDriver.nama_kernet && (
                    <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem' }}>
                      Kernet: {detailDriver.nama_kernet}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'rgba(255,255,255,0.15)', color: '#fff',
                      borderRadius: 6, padding: '3px 10px',
                      fontSize: '0.8125rem', fontWeight: 500, border: '1px solid rgba(255,255,255,0.2)',
                    }}>{detailDriver.nama_armada}</span>
                    {detailDriver.kode_bus && (
                      <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8125rem' }}>
                        {detailDriver.kode_bus} / {detailDriver.nopol}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: rank badge */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{
                  background: detailDriver.rank === 1 ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                            : detailDriver.rank === 2 ? 'linear-gradient(135deg,#94a3b8,#64748b)'
                            : detailDriver.rank === 3 ? 'linear-gradient(135deg,#cd7c3a,#a85f25)'
                            : 'rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '10px 22px',
                  border: detailDriver.rank <= 3 ? 'none' : '1px solid rgba(255,255,255,0.2)',
                }}>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Peringkat</div>
                  <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, lineHeight: 1.1, marginTop: 2 }}>
                    #{detailDriver.rank}
                  </div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: 6 }}>
                  Skor: <strong style={{ color: '#fff' }}>{Number(detailDriver.skor_total).toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Score Table */}
            {isLoadingDetail ? (
              <div className="loading-state"><div className="loading-spinner" /><p>Memuat detail...</p></div>
            ) : detailData ? (
              <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#0369a1" style={{ width: 20, height: 20, flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                  </svg>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>Skor Per Periode</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="monthly-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Periode</th>
                        <th>Armada</th>
                        {detailData.bobot.map(b => (
                          <th key={b.bobot_id}>{b.nama_bobot}<br /><span style={{ fontWeight: 400, fontSize: '0.75rem' }}>({b.persentase_bobot}%)</span></th>
                        ))}
                        <th>Skor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailData.periodes.length === 0 ? (
                        <tr><td colSpan={3 + detailData.bobot.length} className="text-center" style={{ padding: '32px 0', color: '#94a3b8' }}>Belum ada data penilaian</td></tr>
                      ) : detailData.periodes.map(p => (
                        <tr key={p.penilaian_id}>
                          <td className="month-cell">{p.nama_periode}</td>
                          <td className="text-center"><span className="armada-badge">{p.nama_armada}</span></td>
                          {detailData.bobot.map(b => (
                            <td key={b.bobot_id} className="text-center weighted-score">
                              {p.indicators.find(i => i.bobot_id === b.bobot_id)?.weighted_score ?? '-'}
                            </td>
                          ))}
                          <td className="text-center total-score">{Number(p.skor_total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>

        ) : (
          /* ── Ranking Table View ─────────────────────────────────────────── */
          <div className="ranking-container">

            {/* Controls */}
            <div className="ranking-controls">
              {/* Siklus selector */}
              <div className="filter-group">
                <label className="filter-label">Siklus:</label>
                <select
                  className="filter-select"
                  value={selectedSiklus}
                  onChange={e => setSelectedSiklus(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">-- Pilih Siklus --</option>
                  {siklusList.map(s => (
                    <option key={s.siklus_id} value={s.siklus_id}>{s.nama_siklus}</option>
                  ))}
                </select>
              </div>

              {/* Periode selector */}
              <div className="filter-group">
                <label className="filter-label">Periode:</label>
                <select
                  className="filter-select"
                  value={selectedPeriode}
                  onChange={e => setSelectedPeriode(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  disabled={!selectedSiklus}
                >
                  <option value="all">Semua Periode (Rata-rata)</option>
                  {periodeList.map(p => (
                    <option key={p.periode_id} value={p.periode_id}>{p.nama_periode}</option>
                  ))}
                </select>
              </div>

              {/* Armada filter — super_admin only */}
              {isSuperAdmin && (
                <div className="filter-group">
                  <label className="filter-label">Armada:</label>
                  <select
                    className="filter-select"
                    value={selectedArmada}
                    onChange={e => {
                      setSelectedArmada(e.target.value ? Number(e.target.value) : '')
                      setRankingData(null)
                    }}
                  >
                    <option value="">Semua Armada</option>
                    {armadaList.map(a => (
                      <option key={a.armada_id} value={a.armada_id}>{a.nama_armada}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Error */}
            {error && <div className="error-banner" style={{ marginBottom: '1rem' }}>{error}</div>}

            {/* Empty state — no siklus selected */}
            {!selectedSiklus && (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>Pilih Siklus</h3>
                <p>Pilih siklus terlebih dahulu untuk melihat ranking</p>
              </div>
            )}

            {/* Loading */}
            {selectedSiklus && isLoading && (
              <div className="loading-state"><div className="loading-spinner" /><p>Memuat ranking...</p></div>
            )}

            {/* Table */}
            {selectedSiklus && !isLoading && rankingData && (
              displayRows.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>Belum ada data ranking</h3>
                  <p>Belum ada penilaian yang disetujui untuk periode ini</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="ranking-table">
                    <thead>
                      <tr>
                        <th style={{ width: 70 }}>
                          <button className="sort-button" onClick={() => handleSort('rank')}>
                            Rank <SortIcon field="rank" />
                          </button>
                        </th>
                        <th>Nama Driver</th>
                        <th style={{ width: 130 }}>Armada</th>
                        {rankingData.bobot.map(b => (
                          <th key={b.bobot_id} style={{ width: 100 }}>
                            <button className="sort-button" onClick={() => handleSort(String(b.bobot_id))}>
                              {b.nama_bobot} ({b.persentase_bobot}%) <SortIcon field={String(b.bobot_id)} />
                            </button>
                          </th>
                        ))}
                        <th style={{ width: 110 }}>
                          <button className="sort-button" onClick={() => handleSort('total')}>
                            Total <SortIcon field="total" />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayRows.map(driver => (
                        <tr
                          key={driver.driver_id}
                          className="clickable-row"
                          onClick={() => openDetail(driver)}
                        >
                          <td className="text-center rank-cell">
                            <span className={`rank-badge rank-${driver.rank}`}>
                              {driver.rank}
                            </span>
                          </td>
                          <td className="driver-name">
                            {driver.nama_driver}
                            {driver.nama_kernet && (
                              <span style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af' }}>
                                Kernet: {driver.nama_kernet}
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            <span className="armada-badge">{driver.nama_armada}</span>
                          </td>
                          {rankingData.bobot.map(b => (
                            <td key={b.bobot_id} className="text-center weighted-score">
                              {driver.indicators.find(i => i.bobot_id === b.bobot_id)?.weighted_score ?? '-'}
                            </td>
                          ))}
                          <td className="text-center total-score">
                            {Number(driver.skor_total).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
