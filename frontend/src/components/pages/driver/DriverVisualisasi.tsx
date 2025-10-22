'use client'

import { useState, useEffect, useRef } from 'react'
import { Chart, ChartConfiguration, registerables } from 'chart.js'
import { dummyUsers } from '@/data/dummyUsers'

// Register Chart.js components
Chart.register(...registerables)

// Bobot penilaian
const bobotPenilaian = {
  etikaAdab: 25,
  disiplin: 20,
  loyalitas: 20,
  skillMengemudi: 15,
  perawatanKendaraan: 10,
  performa: 10
}

type ProgressChartType = 'total' | 'components'

interface AutoNote {
  category: string
  change: number
  message: string
  type: 'positive' | 'negative' | 'neutral'
  color?: string
}

export default function DriverVisualisasi() {
  const [progressChartType, setProgressChartType] = useState<ProgressChartType>('total')
  const [autoNotes, setAutoNotes] = useState<AutoNote[]>([])
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart | null>(null)

  // Get logged in driver based on username from localStorage
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null
  const driver = dummyUsers.find(user => 
    user.role === 'Supir' && (user.username === username || user.nama === 'Budiman Santoso')
  )

  // Calculate weighted score component
  const calculateWeightedScoreComponent = (value: number, bobot: number) => {
    return Math.round((value * bobot / 100) * 10) / 10
  }

  // Calculate total weighted score
  const calculateWeightedScore = (skor: any) => {
    if (!skor) return 0
    
    const total = 
      calculateWeightedScoreComponent(skor.etikaAdab || 0, bobotPenilaian.etikaAdab) +
      calculateWeightedScoreComponent(skor.disiplin || 0, bobotPenilaian.disiplin) +
      calculateWeightedScoreComponent(skor.loyalitas || 0, bobotPenilaian.loyalitas) +
      calculateWeightedScoreComponent(skor.skillMengemudi || 0, bobotPenilaian.skillMengemudi) +
      calculateWeightedScoreComponent(skor.perawatanKendaraan || 0, bobotPenilaian.perawatanKendaraan) +
      calculateWeightedScoreComponent(skor.performa || 0, bobotPenilaian.performa)
    
    return Math.round(total * 10) / 10
  }

  // Generate auto notes based on progress
  const generateAutoNotes = () => {
    if (!driver || !driver.skorBulanan || driver.skorBulanan.length < 2) {
      return []
    }

    const sortedScores = [...driver.skorBulanan].sort((a, b) => {
      const monthOrder = ['Januari/2025', 'Februari/2025', 'Maret/2025']
      return monthOrder.indexOf(a.bulan) - monthOrder.indexOf(b.bulan)
    })

    // Compare last month vs previous month
    const lastMonth = sortedScores[sortedScores.length - 1]
    const prevMonth = sortedScores[sortedScores.length - 2]

    const notes: AutoNote[] = []

    // Total Score Note
    const lastTotal = calculateWeightedScore(lastMonth.skor)
    const prevTotal = calculateWeightedScore(prevMonth.skor)
    const totalChange = Math.round((lastTotal - prevTotal) * 10) / 10

    if (totalChange > 0) {
      notes.push({
        category: 'Skor Total',
        change: totalChange,
        message: `Skor total meningkat ${totalChange} poin dari bulan lalu (${prevTotal} → ${lastTotal}). Pertahankan performa yang sangat baik! 🎉`,
        type: 'positive'
      })
    } else if (totalChange < 0) {
      notes.push({
        category: 'Skor Total',
        change: totalChange,
        message: `Skor total menurun ${Math.abs(totalChange)} poin dari bulan lalu (${prevTotal} → ${lastTotal}). Mari tingkatkan lagi performa Anda! 💪`,
        type: 'negative'
      })
    } else {
      notes.push({
        category: 'Skor Total',
        change: 0,
        message: `Skor total stabil di ${lastTotal}. Pertahankan konsistensi Anda! 👍`,
        type: 'neutral'
      })
    }

    // Individual Component Notes
    const components = [
      { key: 'etikaAdab', label: 'Etika & Adab', emoji: '🙏', color: '#ef4444' },
      { key: 'disiplin', label: 'Kedisiplinan', emoji: '⏰', color: '#3b82f6' },
      { key: 'loyalitas', label: 'Loyalitas', emoji: '❤️', color: '#10b981' },
      { key: 'skillMengemudi', label: 'Skill Mengemudi', emoji: '🚗', color: '#f59e0b' },
      { key: 'perawatanKendaraan', label: 'Perawatan Kendaraan', emoji: '🔧', color: '#a855f7' },
      { key: 'performa', label: 'Performa', emoji: '⚡', color: '#ec4899' }
    ]

    components.forEach(component => {
      const lastValue = lastMonth.skor[component.key as keyof typeof lastMonth.skor]
      const prevValue = prevMonth.skor[component.key as keyof typeof prevMonth.skor]
      const change = lastValue - prevValue

      if (change > 0) {
        notes.push({
          category: component.label,
          change: change,
          message: `${component.emoji} ${component.label} meningkat ${change} poin dari bulan lalu (${prevValue} → ${lastValue}). Terus pertahankan!`,
          type: 'positive',
          color: component.color
        })
      } else if (change < 0) {
        notes.push({
          category: component.label,
          change: change,
          message: `${component.emoji} ${component.label} menurun ${Math.abs(change)} poin dari bulan lalu (${prevValue} → ${lastValue}). Fokuskan perhatian untuk perbaikan di area ini.`,
          type: 'negative',
          color: component.color
        })
      } else {
        notes.push({
          category: component.label,
          change: 0,
          message: `${component.emoji} ${component.label} konsisten di nilai ${lastValue}. Pertahankan!`,
          type: 'neutral',
          color: component.color
        })
      }
    })

    return notes
  }

  // Render Line Chart - Total Score Progress
  const renderDriverTotalChart = () => {
    if (!chartRef.current || !driver) return

    // Destroy previous chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    if (!driver.skorBulanan) return

    // Sort by month order
    const sortedScores = [...driver.skorBulanan].sort((a, b) => {
      const monthOrder = ['Januari/2025', 'Februari/2025', 'Maret/2025']
      return monthOrder.indexOf(a.bulan) - monthOrder.indexOf(b.bulan)
    })

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: sortedScores.map(s => s.bulan),
        datasets: [
          {
            label: 'Skor Total',
            data: sortedScores.map(s => calculateWeightedScore(s.skor)),
            borderColor: 'rgba(102, 126, 234, 1)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: 'rgba(102, 126, 234, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#334155',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: 15,
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: `Progress Skor Total - ${driver.nama}`,
            color: '#1a202c',
            font: {
              size: 20,
              weight: 'bold'
            },
            padding: 20
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#667eea',
            borderWidth: 2,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context: any) {
                return `Skor: ${context.parsed.y.toFixed(1)} / 100`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: '#64748b',
              font: {
                size: 12
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              color: '#64748b',
              font: {
                size: 12
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    }

    chartInstanceRef.current = new Chart(chartRef.current, config)
  }

  // Render Line Chart - 6 Components Progress
  const renderDriverComponentsChart = () => {
    if (!chartRef.current || !driver) return

    // Destroy previous chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    if (!driver.skorBulanan) return

    // Sort by month order
    const sortedScores = [...driver.skorBulanan].sort((a, b) => {
      const monthOrder = ['Januari/2025', 'Februari/2025', 'Maret/2025']
      return monthOrder.indexOf(a.bulan) - monthOrder.indexOf(b.bulan)
    })

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: sortedScores.map(s => s.bulan),
        datasets: [
          {
            label: 'Etika & Adab (25%)',
            data: sortedScores.map(s => calculateWeightedScoreComponent(s.skor.etikaAdab, bobotPenilaian.etikaAdab)),
            borderColor: 'rgba(239, 68, 68, 0.8)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: false
          },
          {
            label: 'Disiplin (20%)',
            data: sortedScores.map(s => calculateWeightedScoreComponent(s.skor.disiplin, bobotPenilaian.disiplin)),
            borderColor: 'rgba(59, 130, 246, 0.8)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: false
          },
          {
            label: 'Loyalitas (20%)',
            data: sortedScores.map(s => calculateWeightedScoreComponent(s.skor.loyalitas, bobotPenilaian.loyalitas)),
            borderColor: 'rgba(16, 185, 129, 0.8)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: false
          },
          {
            label: 'Skill Mengemudi (15%)',
            data: sortedScores.map(s => calculateWeightedScoreComponent(s.skor.skillMengemudi, bobotPenilaian.skillMengemudi)),
            borderColor: 'rgba(245, 158, 11, 0.8)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: false
          },
          {
            label: 'Perawatan Kendaraan (10%)',
            data: sortedScores.map(s => calculateWeightedScoreComponent(s.skor.perawatanKendaraan, bobotPenilaian.perawatanKendaraan)),
            borderColor: 'rgba(168, 85, 247, 0.8)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: false
          },
          {
            label: 'Performa (10%)',
            data: sortedScores.map(s => calculateWeightedScoreComponent(s.skor.performa, bobotPenilaian.performa)),
            borderColor: 'rgba(236, 72, 153, 0.8)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#334155',
              font: {
                size: 12,
                weight: 500
              },
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          title: {
            display: true,
            text: `Progress per Komponen Penilaian - ${driver.nama}`,
            color: '#1a202c',
            font: {
              size: 20,
              weight: 'bold'
            },
            padding: 20
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#667eea',
            borderWidth: 2,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context: any) {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} poin`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 25,
            ticks: {
              color: '#64748b',
              font: {
                size: 12
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              color: '#64748b',
              font: {
                size: 12
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    }

    chartInstanceRef.current = new Chart(chartRef.current, config)
  }

  // Update chart and notes when chart type changes
  useEffect(() => {
    if (progressChartType === 'total') {
      renderDriverTotalChart()
    } else {
      renderDriverComponentsChart()
    }

    // Generate auto notes
    const notes = generateAutoNotes()
    setAutoNotes(notes)

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [progressChartType])

  if (!driver) {
    return (
      <div className="driver-visualisasi">
        <div className="loading-message">Data driver tidak ditemukan</div>
      </div>
    )
  }

  return (
    <div className="driver-visualisasi">
      {/* Page Header - sama seperti halaman lain */}
      <div className="page-header">
        <div className="header-with-controls">
          <div>
            <h1 className="page-title">Visualisasi Progress</h1>
            <p className="page-subtitle">Lihat perkembangan performa Anda dari waktu ke waktu</p>
          </div>
          
          {/* Dropdown untuk pilih jenis chart */}
          <div className="chart-controls">
            <select
              value={progressChartType}
              onChange={(e) => setProgressChartType(e.target.value as ProgressChartType)}
              className="chart-type-selector"
            >
              <option value="total">📈 Grafik Total</option>
              <option value="components">📊 Grafik 6 Komponen</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="analytics-container">
        <div className="chart-card">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Auto Notes Section */}
      <div className="auto-notes-section">
        <h2 className="notes-title">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
          Catatan Otomatis & Saran
        </h2>
        <p className="notes-subtitle">Analisis performa Anda berdasarkan data bulan-bulan sebelumnya</p>

        <div className="notes-grid">
          {autoNotes.length > 0 ? (
            autoNotes.map((note, index) => (
              <div key={index} className={`note-card ${note.type}`}>
                <div className="note-header">
                  <span 
                    className="note-category" 
                    style={{ color: note.color || '#1a202c' }}
                  >
                    {note.category}
                  </span>
                  <span className={`note-badge ${note.type}`}>
                    {note.change > 0 ? `+${note.change}` : note.change < 0 ? `${note.change}` : 'Stabil'}
                  </span>
                </div>
                <p className="note-message">{note.message}</p>
              </div>
            ))
          ) : (
            <div className="no-notes">
              <p>Belum ada cukup data untuk menghasilkan catatan otomatis. Data minimal 2 bulan diperlukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
