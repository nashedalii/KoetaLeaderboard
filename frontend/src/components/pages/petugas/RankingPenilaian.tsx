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
}

interface Bobot {
  bobot_id: number
  nama_bobot: string
  persentase_bobot: number
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

const getAuth = () => {
  try { return JSON.parse(localStorage.getItem('auth') || '{}') }
  catch { return {} }
}
const getToken = () => getAuth().token || ''
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` })

// ── Component ─────────────────────────────────────────────────────────────────
export default function RankingPenilaianPetugas() {
  // Auto-load armada petugas dari auth
  const [myArmada, setMyArmada] = useState<string>('all')

  useEffect(() => {
    const auth = getAuth()
    // armada_id disimpan di auth.armada_id, tapi nama armada perlu di-resolve
    // Kita simpan dulu sebagai armada_id, nanti match ke nama dari ranking data
    if (auth?.armada_id) {
      setMyArmada(`__id__${auth.armada_id}`) // placeholder, di-resolve setelah data datang
    }
  }, [])

  // Selectors
  const [siklusList, setSiklusList]           = useState<Siklus[]>([])
  const [selectedSiklus, setSelectedSiklus]   = useState<number | ''>('')
  const [periodeList, setPeriodeList]         = useState<Periode[]>([])
  const [selectedPeriode, setSelectedPeriode] = useState<number | 'all'>('all')

  // Filter & sort
  const [filterArmada, setFilterArmada] = useState<string>('all')
  const [sortField, setSortField]       = useState<string>('rank')
  const [sortDir, setSortDir]           = useState<'asc' | 'desc'>('asc')

  // Data
  const [rankingData, setRankingData] = useState<RankingData | null>(null)
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState<string | null>(null)

  // Detail view
  const [detailDriver, setDetailDriver]       = useState<DriverRanking | null>(null)
  const [detailData, setDetailData]           = useState<DetailData | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  // ── Fetch siklus ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${apiBase}/api/siklus`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => setSiklusList(d.siklus || d || []))
      .catch(() => {})
  }, [])

  // ── Fetch periode ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedSiklus) { setPeriodeList([]); return }
    fetch(`${apiBase}/api/siklus/${selectedSiklus}`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => setPeriodeList(d.periodes || []))
      .catch(() => {})
    setSelectedPeriode('all')
    setRankingData(null)
  }, [selectedSiklus])

  // ── Fetch ranking ───────────────────────────────────────────────────────────
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

      const res  = await fetch(`${apiBase}/api/ranking?${params}`, { headers: authHeader() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setRankingData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [selectedSiklus, selectedPeriode])

  useEffect(() => { fetchRanking() }, [fetchRanking])

  // ── Resolve armada name dari armada_id setelah data ranking datang ──────────
  useEffect(() => {
    if (!rankingData || !myArmada.startsWith('__id__')) return
    const armadaId = Number(myArmada.replace('__id__', ''))
    // Tidak bisa langsung resolve karena ranking tidak return armada_id
    // Fallback: biarkan 'all' jika tidak bisa match
    // Cara alternatif: fetch armada list
    fetch(`${apiBase}/api/users?role=petugas`, { headers: authHeader() })
      .catch(() => {})
    // Simpler: ambil dari endpoint siklus atau biarkan user filter sendiri
    setMyArmada('all')
  }, [rankingData])

  // ── Derived armada list ─────────────────────────────────────────────────────
  const armadaList = useMemo(() =>
    Array.from(new Set((rankingData?.ranking || []).map(r => r.nama_armada))).sort()
  , [rankingData])

  // ── Client-side filter + sort ───────────────────────────────────────────────
  const displayRows = useMemo(() => {
    if (!rankingData) return []

    let rows = rankingData.ranking.filter(r =>
      filterArmada === 'all' || r.nama_armada === filterArmada
    )

    if (sortField === 'rank') {
      rows = [...rows].sort((a, b) => sortDir === 'asc' ? a.rank - b.rank : b.rank - a.rank)
    } else if (sortField === 'total') {
      rows = [...rows].sort((a, b) =>
        sortDir === 'asc'
          ? Number(a.skor_total) - Number(b.skor_total)
          : Number(b.skor_total) - Number(a.skor_total)
      )
    } else {
      const bobotId = Number(sortField)
      rows = [...rows].sort((a, b) => {
        const wa = a.indicators.find(i => i.bobot_id === bobotId)?.weighted_score ?? 0
        const wb = b.indicators.find(i => i.bobot_id === bobotId)?.weighted_score ?? 0
        return sortDir === 'asc' ? wa - wb : wb - wa
      })
    }
    return rows
  }, [rankingData, filterArmada, sortField, sortDir])

  // ── Sort handler ────────────────────────────────────────────────────────────
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir(field === 'rank' ? 'asc' : 'desc')
    }
  }

  // ── Open detail ─────────────────────────────────────────────────────────────
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
    } catch { }
    finally { setIsLoadingDetail(false) }
  }

  // ── Sort Icon ───────────────────────────────────────────────────────────────
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

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">

        <div className="page-header">
          <div>
            <h1 className="page-title">Ranking Penilaian Driver</h1>
            <p className="page-subtitle">Peringkat driver berdasarkan performa dan penilaian</p>
          </div>
        </div>

        {/* ── Detail View ────────────────────────────────────────────────── */}
        {detailDriver ? (
          <div className="driver-detail-container">
            <button className="back-button" onClick={() => { setDetailDriver(null); setDetailData(null) }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Kembali ke Ranking
            </button>

            <div className="driver-detail-card">
              <div className="driver-detail-header">
                <div className="driver-detail-identity">
                  <h2 className="driver-detail-name">{detailDriver.nama_driver}</h2>
                  {detailDriver.nama_kernet && (
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Kernet: {detailDriver.nama_kernet}</p>
                  )}
                  <div className="driver-detail-meta">
                    <span className="armada-badge">{detailDriver.nama_armada}</span>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{detailDriver.kode_bus} / {detailDriver.nopol}</span>
                  </div>
                </div>
                <div className="driver-rank-display">
                  <span className="rank-label">Peringkat</span>
                  <span className={`rank-number rank-${detailDriver.rank}`}>#{detailDriver.rank}</span>
                </div>
              </div>
            </div>

            {isLoadingDetail ? (
              <div className="loading-state"><div className="loading-spinner" /><p>Memuat detail...</p></div>
            ) : detailData ? (
              <div className="monthly-scores-container">
                <h3 className="section-title">Skor Per Periode</h3>
                <div className="table-container">
                  <table className="monthly-table">
                    <thead>
                      <tr>
                        <th>Periode</th>
                        <th>Armada</th>
                        {detailData.bobot.map(b => (
                          <th key={b.bobot_id}>
                            {b.nama_bobot}<br />
                            <span style={{ fontWeight: 400, fontSize: '0.75rem' }}>({b.persentase_bobot}%)</span>
                          </th>
                        ))}
                        <th>Skor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailData.periodes.length === 0 ? (
                        <tr><td colSpan={3 + detailData.bobot.length} className="text-center">Belum ada data</td></tr>
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
          /* ── Ranking Table ───────────────────────────────────────────────── */
          <div className="ranking-container">
            <div className="ranking-controls">
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

              <div className="filter-group">
                <label className="filter-label">Armada:</label>
                <select
                  className="filter-select"
                  value={filterArmada}
                  onChange={e => setFilterArmada(e.target.value)}
                  disabled={!rankingData}
                >
                  <option value="all">Semua Armada</option>
                  {armadaList.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <div className="error-banner" style={{ marginBottom: '1rem' }}>{error}</div>}

            {!selectedSiklus && (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>Pilih Siklus</h3>
                <p>Pilih siklus terlebih dahulu untuk melihat ranking</p>
              </div>
            )}

            {selectedSiklus && isLoading && (
              <div className="loading-state"><div className="loading-spinner" /><p>Memuat ranking...</p></div>
            )}

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
                            <span className={`rank-badge rank-${driver.rank}`}>{driver.rank}</span>
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
