'use client'

import { useState, useEffect, useRef } from 'react'
import { Chart, ChartConfiguration, registerables } from 'chart.js'
import { apiFetch } from '@/utils/api'

Chart.register(...registerables)

const WARNA = [
  { border: 'rgba(239,68,68,0.8)',  bg: 'rgba(239,68,68,0.1)'  },
  { border: 'rgba(59,130,246,0.8)', bg: 'rgba(59,130,246,0.1)' },
  { border: 'rgba(16,185,129,0.8)', bg: 'rgba(16,185,129,0.1)' },
  { border: 'rgba(245,158,11,0.8)', bg: 'rgba(245,158,11,0.1)' },
  { border: 'rgba(168,85,247,0.8)', bg: 'rgba(168,85,247,0.1)' },
  { border: 'rgba(236,72,153,0.8)', bg: 'rgba(236,72,153,0.1)' },
]

interface Siklus { siklus_id: number; nama_siklus: string }
interface Periode { periode_id: number; nama_periode: string }
interface BobotItem { bobot_id: number; nama_bobot: string; persentase_bobot: number }
interface RankingItem {
  rank: number
  driver_id: number
  nama_driver: string
  nama_armada: string
  kode_bus: string
  skor_total: string | number
  indicators: { bobot_id: number; weighted_score: number }[]
}
interface DriverPeriode {
  skor_total: string | number
  nama_periode: string
  indicators: { bobot_id: number; weighted_score: number }[]
}
interface DriverDetail {
  driver: { nama_driver: string; nama_armada: string }
  bobot: BobotItem[]
  periodes: DriverPeriode[]
}

type ChartType        = 'monthly-top20' | 'driver-progress'
type ProgressChartType = 'total' | 'components'

export default function Analytics() {
  const [selectedChart, setSelectedChart]           = useState<ChartType>('monthly-top20')
  const [progressChartType, setProgressChartType]   = useState<ProgressChartType>('total')

  const [siklusList, setSiklusList]                 = useState<Siklus[]>([])
  const [selectedSiklus, setSelectedSiklus]         = useState<number | null>(null)
  const [periodeList, setPeriodeList]               = useState<Periode[]>([])
  const [selectedPeriodeId, setSelectedPeriodeId]   = useState<number | null>(null)

  const [rankingList, setRankingList]               = useState<RankingItem[]>([])
  const [selectedDriver, setSelectedDriver]         = useState<number | null>(null)
  const [driverDetail, setDriverDetail]             = useState<DriverDetail | null>(null)
  const [searchDriver, setSearchDriver]             = useState('')

  const chartRef         = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart | null>(null)

  // 1. Load siklus list
  useEffect(() => {
    apiFetch('/api/siklus')
      .then((data: Siklus[]) => {
        setSiklusList(data)
        if (data.length > 0) setSelectedSiklus(data[0].siklus_id)
      })
      .catch(() => {})
  }, [])

  // 2. When siklus changes — load periodes, reset periode filter
  useEffect(() => {
    if (!selectedSiklus) return
    setSelectedPeriodeId(null)
    setSelectedDriver(null)
    setDriverDetail(null)
    apiFetch(`/api/siklus/${selectedSiklus}`)
      .then((data: { periodes: Periode[] }) => setPeriodeList(data.periodes || []))
      .catch(() => {})
  }, [selectedSiklus])

  // 3. Fetch ranking when siklus or periode filter changes
  useEffect(() => {
    if (!selectedSiklus) return
    const url = selectedPeriodeId
      ? `/api/ranking?mode=periode&periode_id=${selectedPeriodeId}`
      : `/api/ranking?mode=siklus&siklus_id=${selectedSiklus}`
    apiFetch(url)
      .then((data: { ranking: RankingItem[] }) => setRankingList(data.ranking || []))
      .catch(() => {})
  }, [selectedSiklus, selectedPeriodeId])

  // 4. Fetch driver detail when driver selected
  useEffect(() => {
    if (!selectedDriver || !selectedSiklus) return
    setDriverDetail(null)
    apiFetch(`/api/ranking/driver/${selectedDriver}?siklus_id=${selectedSiklus}`)
      .then((data: DriverDetail) => setDriverDetail(data))
      .catch(() => {})
  }, [selectedDriver, selectedSiklus])

  // ── Chart renderers ──────────────────────────────────────────────────────

  const renderBarChart = (drivers: RankingItem[], filterLabel: string) => {
    if (!chartRef.current) return
    if (chartInstanceRef.current) chartInstanceRef.current.destroy()

    const bgColors = drivers.map((_, i) => {
      if (i === 0) return 'rgba(255,215,0,0.85)'
      if (i === 1) return 'rgba(192,192,192,0.85)'
      if (i === 2) return 'rgba(205,127,50,0.85)'
      return 'rgba(59,130,246,0.75)'
    })
    const borderColors = drivers.map((_, i) => {
      if (i === 0) return 'rgb(255,165,0)'
      if (i === 1) return 'rgb(168,168,168)'
      if (i === 2) return 'rgb(160,82,45)'
      return 'rgb(37,99,235)'
    })

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: drivers.map(d => d.nama_driver),
        datasets: [{
          label: 'Skor Total',
          data: drivers.map(d => parseFloat(String(d.skor_total))),
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 6,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: `Ranking Driver - ${filterLabel}`,
            font: { size: 20, weight: 'bold' },
            color: '#031E65',
            padding: 20
          },
          tooltip: {
            callbacks: { label: (ctx: any) => `Skor: ${ctx.parsed.x.toFixed(1)} poin` },
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff', bodyColor: '#fff',
            borderColor: '#031E65', borderWidth: 1,
            padding: 12, displayColors: false
          }
        },
        scales: {
          x: {
            beginAtZero: true, max: 100,
            ticks: { font: { size: 12 } },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          y: {
            ticks: { font: { size: 13, weight: 500 as const }, color: '#334155' },
            grid: { display: false }
          }
        },
        layout: { padding: { right: 80 } }
      },
      plugins: [{
        id: 'scoreLabels',
        afterDatasetsDraw(chart: any) {
          const { ctx, chartArea: { right } } = chart
          chart.data.datasets[0].data.forEach((value: number, index: number) => {
            const y = chart.getDatasetMeta(0).data[index].y
            ctx.save()
            ctx.fillStyle = '#031E65'
            ctx.font = 'bold 14px sans-serif'
            ctx.textAlign = 'left'
            ctx.fillText(`${value.toFixed(1)} poin`, right + 10, y + 5)
            ctx.restore()
          })
        }
      }]
    }

    chartInstanceRef.current = new Chart(chartRef.current, config)
  }

  const renderDriverTotalChart = (detail: DriverDetail) => {
    if (!chartRef.current) return
    if (chartInstanceRef.current) chartInstanceRef.current.destroy()

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: detail.periodes.map(p => p.nama_periode),
        datasets: [{
          label: 'Skor Total',
          data: detail.periodes.map(p => parseFloat(String(p.skor_total))),
          borderColor: 'rgba(3,30,101,1)',
          backgroundColor: 'rgba(3,30,101,0.1)',
          borderWidth: 3, tension: 0.4, fill: true,
          pointRadius: 6, pointHoverRadius: 8,
          pointBackgroundColor: 'rgba(3,30,101,1)',
          pointBorderColor: '#fff', pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { color: '#334155', font: { size: 12 }, padding: 15, usePointStyle: true } },
          title: {
            display: true,
            text: `Progress Total - ${detail.driver.nama_driver}`,
            color: '#1e293b', font: { size: 20, weight: 'bold' }, padding: 20
          }
        },
        scales: {
          y: { beginAtZero: true, max: 100, ticks: { color: '#64748b', font: { size: 12 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { ticks: { color: '#64748b', font: { size: 12 } }, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
      }
    }

    chartInstanceRef.current = new Chart(chartRef.current, config)
  }

  const renderDriverComponentsChart = (detail: DriverDetail) => {
    if (!chartRef.current) return
    if (chartInstanceRef.current) chartInstanceRef.current.destroy()

    const datasets = detail.bobot.map((bobot, idx) => ({
      label: `${bobot.nama_bobot} (${bobot.persentase_bobot}%)`,
      data: detail.periodes.map(p => {
        const ind = p.indicators.find(i => i.bobot_id === bobot.bobot_id)
        return ind ? parseFloat(String(ind.weighted_score)) : 0
      }),
      borderColor: WARNA[idx % WARNA.length].border,
      backgroundColor: WARNA[idx % WARNA.length].bg,
      borderWidth: 2, tension: 0.4, pointRadius: 4, pointHoverRadius: 6
    }))

    const config: ChartConfiguration = {
      type: 'line',
      data: { labels: detail.periodes.map(p => p.nama_periode), datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { color: '#334155', font: { size: 12 }, padding: 15, usePointStyle: true } },
          title: {
            display: true,
            text: `Progress Komponen - ${detail.driver.nama_driver}`,
            color: '#1e293b', font: { size: 20, weight: 'bold' }, padding: 20
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 5, color: '#64748b', font: { size: 12 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { ticks: { color: '#64748b', font: { size: 12 } }, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
      }
    }

    chartInstanceRef.current = new Chart(chartRef.current, config)
  }

  // ── Trigger chart render ─────────────────────────────────────────────────

  useEffect(() => {
    if (selectedChart === 'monthly-top20' && rankingList.length > 0) {
      const filterLabel = selectedPeriodeId
        ? periodeList.find(p => p.periode_id === selectedPeriodeId)?.nama_periode ?? ''
        : 'Rata-rata Siklus'
      renderBarChart(rankingList, filterLabel)
    }

    if (selectedChart === 'driver-progress' && selectedDriver && driverDetail) {
      if (progressChartType === 'total') renderDriverTotalChart(driverDetail)
      else renderDriverComponentsChart(driverDetail)
    }

    return () => { if (chartInstanceRef.current) chartInstanceRef.current.destroy() }
  }, [selectedChart, rankingList, selectedDriver, driverDetail, progressChartType, selectedPeriodeId, periodeList])

  const filteredDrivers = rankingList.filter(d =>
    d.nama_driver.toLowerCase().includes(searchDriver.toLowerCase())
  )

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="page-header">
          <div className="header-with-controls">
            <div>
              <h1 className="page-title">Grafik &amp; Analitik</h1>
              <p className="page-subtitle">Visualisasi data performa driver</p>
            </div>

            <div className="chart-controls">
              <select
                value={selectedSiklus ?? ''}
                onChange={e => setSelectedSiklus(Number(e.target.value))}
                className="chart-type-selector"
              >
                {siklusList.length === 0 && <option value="">Memuat siklus...</option>}
                {siklusList.map(s => (
                  <option key={s.siklus_id} value={s.siklus_id}>{s.nama_siklus}</option>
                ))}
              </select>

              <select
                value={selectedChart}
                onChange={e => {
                  setSelectedChart(e.target.value as ChartType)
                  if (e.target.value !== 'driver-progress') {
                    setSelectedDriver(null)
                    setSearchDriver('')
                  }
                }}
                className="chart-type-selector"
              >
                <option value="monthly-top20">📊 Ranking Driver</option>
                <option value="driver-progress">📈 Progress Driver</option>
              </select>
            </div>
          </div>
        </div>

        <div className="analytics-container">

          {/* ── BAR CHART: Ranking Driver ── */}
          {selectedChart === 'monthly-top20' && (
            <>
              <div className="chart-filters">
                <div className="filter-group">
                  <label className="filter-label">Pilih Periode:</label>
                  <select
                    value={selectedPeriodeId ?? 'siklus'}
                    onChange={e => setSelectedPeriodeId(e.target.value === 'siklus' ? null : Number(e.target.value))}
                    className="filter-select"
                  >
                    <option value="siklus">Rata-rata Siklus</option>
                    {periodeList.map(p => (
                      <option key={p.periode_id} value={p.periode_id}>{p.nama_periode}</option>
                    ))}
                  </select>
                </div>
              </div>

              {rankingList.length === 0 ? (
                <div className="empty-state" style={{ padding: '3rem' }}>
                  <p>Belum ada data penilaian approved untuk periode ini.</p>
                </div>
              ) : (
                <div className="chart-wrapper">
                  <canvas ref={chartRef} id="analyticsChart"></canvas>
                </div>
              )}
            </>
          )}

          {/* ── LINE CHART: Progress Driver ── */}
          {selectedChart === 'driver-progress' && (
            <>
              {!selectedDriver ? (
                <div className="driver-progress-container">
                  <div className="search-container">
                    <div className="search-input-wrapper">
                      <input
                        type="text"
                        placeholder="🔍 Cari driver..."
                        value={searchDriver}
                        onChange={e => setSearchDriver(e.target.value)}
                        className="search-input"
                      />
                    </div>
                  </div>

                  <div className="driver-cards-grid">
                    {filteredDrivers.map(driver => (
                      <div
                        key={driver.driver_id}
                        className="driver-progress-card"
                        onClick={() => setSelectedDriver(driver.driver_id)}
                      >
                        <div className="driver-card-header">
                          <h3 className="driver-card-name">{driver.nama_driver}</h3>
                          <span className="driver-card-armada">{driver.nama_armada} · {driver.kode_bus}</span>
                        </div>
                        <div className="driver-card-score">
                          <span className="score-label">Rata-rata Total</span>
                          <span className="score-value">{parseFloat(String(driver.skor_total)).toFixed(1)} poin</span>
                        </div>
                        <div className="driver-card-arrow">→</div>
                      </div>
                    ))}
                    {filteredDrivers.length === 0 && (
                      <p style={{ color: '#64748b' }}>Tidak ada driver dengan data penilaian approved.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="driver-detail-container">
                  <div className="driver-detail-controls">
                    <button
                      onClick={() => { setSelectedDriver(null); setDriverDetail(null) }}
                      className="back-button"
                    >
                      ← Kembali ke Daftar Driver
                    </button>

                    <div className="chart-type-controls">
                      <label className="filter-label">Jenis Grafik:</label>
                      <select
                        value={progressChartType}
                        onChange={e => setProgressChartType(e.target.value as ProgressChartType)}
                        className="chart-type-select"
                      >
                        <option value="total">📊 Grafik Total</option>
                        <option value="components">📈 Grafik Komponen</option>
                      </select>
                    </div>
                  </div>

                  <div className="chart-wrapper">
                    {driverDetail ? (
                      <canvas ref={chartRef} id="analyticsChart"></canvas>
                    ) : (
                      <div style={{ padding: '2rem', color: '#64748b' }}>Memuat data driver...</div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
