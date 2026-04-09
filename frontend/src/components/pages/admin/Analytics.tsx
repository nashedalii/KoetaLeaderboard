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

type ChartType = 'monthly-top20' | 'driver-progress'
type ProgressChartType = 'total' | 'components'

export default function Analytics() {
  const [selectedChart, setSelectedChart] = useState<ChartType>('monthly-top20')
  const [selectedMonth, setSelectedMonth] = useState<string>('Total')
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null)
  const [searchDriver, setSearchDriver] = useState<string>('')
  const [progressChartType, setProgressChartType] = useState<ProgressChartType>('total')
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart | null>(null)

  // Get drivers only
  const drivers = dummyUsers.filter(user => user.role === 'Supir')

  // Filter drivers based on search
  const filteredDrivers = drivers.filter(driver => 
    driver.nama.toLowerCase().includes(searchDriver.toLowerCase())
  )

  // Calculate individual weighted score (rounded)
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

  // Get available months + Total option
  const availableMonths = ['Total', 'Januari/2025', 'Februari/2025', 'Maret/2025']

  // Calculate average scores from all months (same method as RankingPenilaian)
  const calculateAverageScores = (driver: any) => {
    if (!driver.skorBulanan || driver.skorBulanan.length === 0) {
      return driver.skor
    }

    const totals = {
      etikaAdab: 0,
      disiplin: 0,
      loyalitas: 0,
      skillMengemudi: 0,
      perawatanKendaraan: 0,
      performa: 0
    }

    driver.skorBulanan.forEach((sb: any) => {
      totals.etikaAdab += sb.skor.etikaAdab
      totals.disiplin += sb.skor.disiplin
      totals.loyalitas += sb.skor.loyalitas
      totals.skillMengemudi += sb.skor.skillMengemudi
      totals.perawatanKendaraan += sb.skor.perawatanKendaraan
      totals.performa += sb.skor.performa
    })

    const count = driver.skorBulanan.length

    return {
      etikaAdab: Math.round((totals.etikaAdab / count) * 10) / 10,
      disiplin: Math.round((totals.disiplin / count) * 10) / 10,
      loyalitas: Math.round((totals.loyalitas / count) * 10) / 10,
      skillMengemudi: Math.round((totals.skillMengemudi / count) * 10) / 10,
      perawatanKendaraan: Math.round((totals.perawatanKendaraan / count) * 10) / 10,
      performa: Math.round((totals.performa / count) * 10) / 10
    }
  }

  // Calculate total score using average scores
  const calculateTotalScore = (driver: any) => {
    const avgScores = calculateAverageScores(driver)
    return calculateWeightedScore(avgScores)
  }

  // Render Bar Chart - All Drivers by Month (Horizontal)
  const renderMonthlyTop20Chart = () => {
    if (!chartRef.current) return

    // Destroy previous chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    // Get scores - either by month or total
    const driversWithScores = drivers
      .map(driver => {
        if (selectedMonth === 'Total') {
          return {
            nama: driver.nama,
            score: calculateTotalScore(driver)
          }
        } else {
          const monthlyScore = driver.skorBulanan?.find(s => s.bulan === selectedMonth)
          return {
            nama: driver.nama,
            score: monthlyScore ? calculateWeightedScore(monthlyScore.skor) : 0
          }
        }
      })
      .filter(d => d.score > 0)
      .sort((a, b) => b.score - a.score) // Sort descending - highest first

    // Create gradient colors - top 3 special, rest blue gradient
    const backgroundColors = driversWithScores.map((_, index) => {
      if (index === 0) return 'rgba(255, 215, 0, 0.85)'      // Gold
      if (index === 1) return 'rgba(192, 192, 192, 0.85)'    // Silver
      if (index === 2) return 'rgba(205, 127, 50, 0.85)'     // Bronze
      return 'rgba(59, 130, 246, 0.75)'                       // Blue for others
    })

    const borderColors = driversWithScores.map((_, index) => {
      if (index === 0) return 'rgb(255, 165, 0)'
      if (index === 1) return 'rgb(168, 168, 168)'
      if (index === 2) return 'rgb(160, 82, 45)'
      return 'rgb(37, 99, 235)'
    })

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: driversWithScores.map(d => d.nama),
        datasets: [{
          label: 'Skor Total',
          data: driversWithScores.map(d => d.score),
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 6,
        }]
      },
      options: {
        indexAxis: 'y', // HORIZONTAL BAR
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: `Ranking Driver - ${selectedMonth === 'Total' ? 'Rata-rata Keseluruhan' : selectedMonth}`,
            font: {
              size: 20,
              weight: 'bold'
            },
            color: '#031E65',
            padding: 20
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return `Skor: ${context.parsed.x.toFixed(1)} poin`
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#031E65',
            borderWidth: 1,
            padding: 12,
            displayColors: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            title: {
              display: false
            },
            ticks: {
              callback: function(value: any) {
                return value
              },
              font: {
                size: 12
              }
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            ticks: {
              font: {
                size: 13,
                weight: 500 as const
              },
              color: '#334155'
            },
            grid: {
              display: false
            }
          }
        },
        layout: {
          padding: {
            right: 80 // Space for score labels
          }
        }
      },
      plugins: [{
        id: 'scoreLabels',
        afterDatasetsDraw(chart: any) {
          const { ctx, chartArea: { right }, scales: { x } } = chart
          
          chart.data.datasets[0].data.forEach((value: number, index: number) => {
            const y = chart.getDatasetMeta(0).data[index].y
            
            // Draw score value at the end of bar
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

  // Render Line Chart - Driver Progress (Total Score)
  const renderDriverTotalChart = () => {
    if (!chartRef.current || !selectedDriver) return

    // Destroy previous chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    const driver = drivers.find(d => d.id === selectedDriver)
    if (!driver || !driver.skorBulanan) return

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
            borderColor: 'rgba(3, 30, 101, 1)',
            backgroundColor: 'rgba(3, 30, 101, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: 'rgba(3, 30, 101, 1)',
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
                size: 12
              },
              padding: 15,
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: `Progress Total - ${driver.nama}`,
            color: '#1e293b',
            font: {
              size: 20,
              weight: 'bold'
            },
            padding: 20
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

  // Render Line Chart - Driver Progress (6 Components)
  const renderDriverComponentsChart = () => {
    if (!chartRef.current || !selectedDriver) return

    // Destroy previous chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    const driver = drivers.find(d => d.id === selectedDriver)
    if (!driver || !driver.skorBulanan) return

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
            data: sortedScores.map(s => calculateWeightedScoreComponent(s.skor.etikaAdab, 25)),
            borderColor: 'rgba(239, 68, 68, 0.8)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Disiplin (20%)',
            data: sortedScores.map(s => calculateWeightedScoreComponent(s.skor.disiplin, 20)),
            borderColor: 'rgba(59, 130, 246, 0.8)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Loyalitas (20%)',
            data: sortedScores.map(s => calculateWeightedScoreComponent(s.skor.loyalitas, 20)),
            borderColor: 'rgba(16, 185, 129, 0.8)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Skill Mengemudi (15%)',
            data: sortedScores.map(s => calculateWeightedScoreComponent(s.skor.skillMengemudi, 15)),
            borderColor: 'rgba(245, 158, 11, 0.8)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Perawatan Kendaraan (10%)',
            data: sortedScores.map(s => calculateWeightedScoreComponent(s.skor.perawatanKendaraan, 10)),
            borderColor: 'rgba(168, 85, 247, 0.8)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Performa (10%)',
            data: sortedScores.map(s => calculateWeightedScoreComponent(s.skor.performa, 10)),
            borderColor: 'rgba(236, 72, 153, 0.8)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
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
                size: 12
              },
              padding: 15,
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: `Progress Komponen - ${driver.nama}`,
            color: '#1e293b',
            font: {
              size: 20,
              weight: 'bold'
            },
            padding: 20
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 25,
            ticks: {
              stepSize: 5,
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

  // Update chart when dependencies change
  useEffect(() => {
    if (selectedChart === 'monthly-top20') {
      renderMonthlyTop20Chart()
    } else if (selectedChart === 'driver-progress' && selectedDriver) {
      if (progressChartType === 'total') {
        renderDriverTotalChart()
      } else {
        renderDriverComponentsChart()
      }
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [selectedChart, selectedMonth, selectedDriver, progressChartType])

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="page-header">
          <div className="header-with-controls">
            <div>
              <h1 className="page-title">Grafik & Analitik</h1>
              <p className="page-subtitle">Visualisasi data performa driver</p>
            </div>
            
            {/* Chart Type Selector */}
            <div className="chart-controls">
              <select
                value={selectedChart}
                onChange={(e) => {
                  setSelectedChart(e.target.value as ChartType)
                  // Reset selected driver when switching away from driver-progress
                  if (e.target.value !== 'driver-progress') {
                    setSelectedDriver(null)
                    setSearchDriver('')
                  }
                }}
                className="chart-type-selector"
              >
                <option value="monthly-top20">📊 Ranking Driver Bulanan</option>
                <option value="driver-progress">📈 Progress Driver</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="analytics-container">
          {selectedChart === 'monthly-top20' && (
            <>
              {/* Controls for Monthly Ranking */}
              <div className="chart-filters">
                <div className="filter-group">
                  <label className="filter-label">Pilih Bulan:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="filter-select"
                  >
                    {availableMonths.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chart Canvas */}
              <div className="chart-wrapper">
                <canvas ref={chartRef} id="analyticsChart"></canvas>
              </div>
            </>
          )}

          {selectedChart === 'driver-progress' && (
            <>
              {!selectedDriver ? (
                /* Driver List View */
                <div className="driver-progress-container">
                  {/* Search Bar */}
                  <div className="search-container">
                    <div className="search-input-wrapper">
                      <input
                        type="text"
                        placeholder="🔍 Cari driver..."
                        value={searchDriver}
                        onChange={(e) => setSearchDriver(e.target.value)}
                        className="search-input"
                      />
                    </div>
                  </div>

                  {/* Driver Cards Grid */}
                  <div className="driver-cards-grid">
                    {filteredDrivers
                      .filter(d => d.skorBulanan && d.skorBulanan.length > 0)
                      .map(driver => {
                        const avgScore = calculateTotalScore(driver)
                        return (
                          <div
                            key={driver.id}
                            className="driver-progress-card"
                            onClick={() => setSelectedDriver(driver.id)}
                          >
                            <div className="driver-card-header">
                              <h3 className="driver-card-name">{driver.nama}</h3>
                              <span className="driver-card-armada">Armada {driver.namaArmada}</span>
                            </div>
                            <div className="driver-card-score">
                              <span className="score-label">Rata-rata Total</span>
                              <span className="score-value">{avgScore.toFixed(1)} poin</span>
                            </div>
                            <div className="driver-card-arrow">→</div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              ) : (
                /* Driver Detail Chart View */
                <div className="driver-detail-container">
                  {/* Back Button and Chart Type Selector */}
                  <div className="driver-detail-controls">
                    <button
                      onClick={() => setSelectedDriver(null)}
                      className="back-button"
                    >
                      ← Kembali ke Daftar Driver
                    </button>
                    
                    <div className="chart-type-controls">
                      <label className="filter-label">Jenis Grafik:</label>
                      <select
                        value={progressChartType}
                        onChange={(e) => setProgressChartType(e.target.value as ProgressChartType)}
                        className="chart-type-select"
                      >
                        <option value="total">📊 Grafik Total</option>
                        <option value="components">📈 Grafik 6 Komponen</option>
                      </select>
                    </div>
                  </div>

                  {/* Chart Canvas */}
                  <div className="chart-wrapper">
                    <canvas ref={chartRef} id="analyticsChart"></canvas>
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
