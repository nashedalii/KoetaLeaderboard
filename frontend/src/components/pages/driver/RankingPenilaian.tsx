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
  bobot: Bobot[]
  ranking: DriverRanking[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const apiBase = process.env.NEXT_PUBLIC_API_URL || ''

const getAuth = () => {
  try { return JSON.parse(localStorage.getItem('auth') || '{}') }
  catch { return {} }
}
const getToken  = () => getAuth().token || ''
const getMyId   = (): number | null => getAuth()?.user?.id ?? null
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` })

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

// ── Component ─────────────────────────────────────────────────────────────────
export default function DriverRankingPenilaian() {
  const myId = getMyId()

  // Selectors
  const [siklusList, setSiklusList]           = useState<Siklus[]>([])
  const [selectedSiklus, setSelectedSiklus]   = useState<number | ''>('')
  const [periodeList, setPeriodeList]         = useState<Periode[]>([])
  const [selectedPeriode, setSelectedPeriode] = useState<number | 'all'>('all')

  // Data
  const [rankingData, setRankingData] = useState<RankingData | null>(null)
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState<string | null>(null)

  // ── Fetch siklus ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${apiBase}/api/siklus`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => setSiklusList(d.siklus || d || []))
      .catch(() => {})
  }, [])

  // ── Fetch periode ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedSiklus) { setPeriodeList([]); return }
    fetch(`${apiBase}/api/siklus/${selectedSiklus}`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => setPeriodeList(d.periodes || []))
      .catch(() => {})
    setSelectedPeriode('all')
    setRankingData(null)
  }, [selectedSiklus])

  // ── Fetch ranking ────────────────────────────────────────────────────────────
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

  // ── Derived data ─────────────────────────────────────────────────────────────
  const allRows   = rankingData?.ranking ?? []
  const top10     = allRows.slice(0, 10)
  const top3      = allRows.slice(0, 3)
  const myRow     = myId ? allRows.find(r => r.driver_id === myId) : null
  const myInTop10 = myRow ? myRow.rank <= 10 : false

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Ranking Driver</h1>
            <p className="page-subtitle">Lihat peringkat Anda dibandingkan dengan driver lain</p>
          </div>
        </div>

        <div className="ranking-container">

          {/* Controls */}
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
          </div>

          {/* Error */}
          {error && <div className="error-banner" style={{ marginBottom: '1rem' }}>{error}</div>}

          {/* Empty — no siklus */}
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

          {selectedSiklus && !isLoading && rankingData && (
            allRows.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>Belum ada data ranking</h3>
                <p>Belum ada penilaian yang disetujui untuk periode ini</p>
              </div>
            ) : (
              <>
                {/* ── Podium Top 3 ──────────────────────────────────────── */}
                {top3.length >= 1 && (
                  <div className="podium-container">
                    {/* Susun: 2 - 1 - 3 */}
                    {[
                      top3[1] ?? null,
                      top3[0] ?? null,
                      top3[2] ?? null,
                    ].map((driver, i) => {
                      if (!driver) return <div key={i} className="podium-slot empty" />
                      const podiumRank = i === 0 ? 2 : i === 1 ? 1 : 3
                      const isMe = driver.driver_id === myId
                      return (
                        <div
                          key={driver.driver_id}
                          className={`podium-slot podium-${podiumRank}${isMe ? ' podium-me' : ''}`}
                        >
                          <div className="podium-medal">{MEDAL[podiumRank]}</div>
                          <div className="podium-name">
                            {driver.nama_driver}
                            {isMe && <span className="you-badge">Anda</span>}
                          </div>
                          <div className="podium-armada">{driver.nama_armada}</div>
                          <div className="podium-score">{Number(driver.skor_total).toFixed(2)}</div>
                          <div className={`podium-block podium-block-${podiumRank}`}>
                            <span className="podium-rank-num">#{podiumRank}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* ── Top 10 Table ───────────────────────────────────────── */}
                <div className="table-container">
                  <table className="ranking-table">
                    <thead>
                      <tr>
                        <th style={{ width: 80 }}>Rank</th>
                        <th>Nama Driver</th>
                        <th style={{ width: 120 }}>Armada</th>
                        {rankingData.bobot.map(b => (
                          <th key={b.bobot_id} style={{ width: 100 }}>
                            {b.nama_bobot} ({b.persentase_bobot}%)
                          </th>
                        ))}
                        <th style={{ width: 120 }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top10.map(driver => {
                        const isMe = driver.driver_id === myId
                        return (
                          <tr key={driver.driver_id} className={isMe ? 'current-driver-row' : ''}>
                            <td className="text-center rank-cell">
                              <span className={`rank-badge rank-${driver.rank}`}>
                                {MEDAL[driver.rank] ?? driver.rank}
                              </span>
                            </td>
                            <td className="driver-name">
                              {driver.nama_driver}
                              {isMe && <span className="you-badge">Anda</span>}
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
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ── Posisi saya jika di luar top 10 ───────────────────── */}
                {myRow && !myInTop10 && (
                  <div className="personal-ranking-section">
                    <h3 className="personal-ranking-title">Posisi Anda</h3>
                    <div className="table-container">
                      <table className="ranking-table personal-ranking-table">
                        <thead>
                          <tr>
                            <th style={{ width: 80 }}>Rank</th>
                            <th>Nama Driver</th>
                            <th style={{ width: 120 }}>Armada</th>
                            {rankingData.bobot.map(b => (
                              <th key={b.bobot_id} style={{ width: 100 }}>
                                {b.nama_bobot} ({b.persentase_bobot}%)
                              </th>
                            ))}
                            <th style={{ width: 120 }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="personal-row">
                            <td className="text-center rank-cell">
                              <span className={`rank-badge rank-${myRow.rank}`}>{myRow.rank}</span>
                            </td>
                            <td className="driver-name">
                              {myRow.nama_driver}
                              <span className="you-badge">Anda</span>
                            </td>
                            <td className="text-center">
                              <span className="armada-badge">{myRow.nama_armada}</span>
                            </td>
                            {rankingData.bobot.map(b => (
                              <td key={b.bobot_id} className="text-center weighted-score">
                                {myRow.indicators.find(i => i.bobot_id === b.bobot_id)?.weighted_score ?? '-'}
                              </td>
                            ))}
                            <td className="text-center total-score">
                              {Number(myRow.skor_total).toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  )
}
