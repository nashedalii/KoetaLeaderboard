'use client'

import { useState, useMemo } from 'react'
import { dummyUsers, User, SkorBulanan } from '@/data/dummyUsers'

// Bobot penilaian (dari Konfigurasi Penilaian)
const bobotPenilaian = {
  etikaAdab: 25,
  disiplin: 20,
  loyalitas: 20,
  skillMengemudi: 15,
  perawatanKendaraan: 10,
  performa: 10
}

type SortField = 'rank' | 'skor1' | 'skor2' | 'skor3' | 'skor4' | 'skor5' | 'skor6' | 'total'
type SortDirection = 'asc' | 'desc'

export default function RankingPenilaian() {
  const [selectedDriver, setSelectedDriver] = useState<User | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('rank')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Get only drivers (Supir)
  const drivers = dummyUsers.filter(user => user.role === 'Supir')

  // Get unique months from all drivers (with proper chronological order)
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>()
    drivers.forEach(driver => {
      driver.skorBulanan?.forEach(skorBulan => {
        monthsSet.add(skorBulan.bulan)
      })
    })
    
    // Define proper chronological order
    const monthOrder = ['Januari/2025', 'Februari/2025', 'Maret/2025']
    
    // Filter and sort by chronological order
    return monthOrder.filter(month => monthsSet.has(month))
  }, [drivers])

  // Calculate weighted score (skor sudah dipersentase)
  const calculateWeightedScore = (value: number, bobot: number) => {
    return Math.round((value * bobot / 100) * 10) / 10
  }

  // Calculate total score based on bobot
  const calculateTotalScore = (skor: any) => {
    if (!skor) return 0
    
    // Sum up all weighted scores (rounded individually)
    const total = 
      calculateWeightedScore(skor.etikaAdab || 0, bobotPenilaian.etikaAdab) +
      calculateWeightedScore(skor.disiplin || 0, bobotPenilaian.disiplin) +
      calculateWeightedScore(skor.loyalitas || 0, bobotPenilaian.loyalitas) +
      calculateWeightedScore(skor.skillMengemudi || 0, bobotPenilaian.skillMengemudi) +
      calculateWeightedScore(skor.perawatanKendaraan || 0, bobotPenilaian.perawatanKendaraan) +
      calculateWeightedScore(skor.performa || 0, bobotPenilaian.performa)
    
    return Math.round(total * 10) / 10 // Round to 1 decimal
  }

  // Calculate average score from all months
  const calculateAverageScores = (driver: User) => {
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

    driver.skorBulanan.forEach(sb => {
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

  // Get scores for selected month or average scores
  const getDriverScores = (driver: User) => {
    if (selectedMonth === 'all') {
      return calculateAverageScores(driver)
    }
    
    const monthlyScore = driver.skorBulanan?.find(sb => sb.bulan === selectedMonth)
    return monthlyScore?.skor || driver.skor
  }

  // Sort drivers by total score (descending)
  const rankedDrivers = useMemo(() => {
    const driversWithScores = drivers
      .map(driver => {
        const skor = getDriverScores(driver)
        return {
          ...driver,
          currentSkor: skor,
          totalScore: calculateTotalScore(skor),
          skor1: calculateWeightedScore(skor?.etikaAdab || 0, bobotPenilaian.etikaAdab),
          skor2: calculateWeightedScore(skor?.disiplin || 0, bobotPenilaian.disiplin),
          skor3: calculateWeightedScore(skor?.loyalitas || 0, bobotPenilaian.loyalitas),
          skor4: calculateWeightedScore(skor?.skillMengemudi || 0, bobotPenilaian.skillMengemudi),
          skor5: calculateWeightedScore(skor?.perawatanKendaraan || 0, bobotPenilaian.perawatanKendaraan),
          skor6: calculateWeightedScore(skor?.performa || 0, bobotPenilaian.performa)
        }
      })

    // Sort based on selected field
    driversWithScores.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'skor1':
          comparison = a.skor1 - b.skor1
          break
        case 'skor2':
          comparison = a.skor2 - b.skor2
          break
        case 'skor3':
          comparison = a.skor3 - b.skor3
          break
        case 'skor4':
          comparison = a.skor4 - b.skor4
          break
        case 'skor5':
          comparison = a.skor5 - b.skor5
          break
        case 'skor6':
          comparison = a.skor6 - b.skor6
          break
        case 'total':
          comparison = a.totalScore - b.totalScore
          break
        case 'rank':
        default:
          comparison = b.totalScore - a.totalScore // Default: highest total score first
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return driversWithScores
  }, [drivers, selectedMonth, sortField, sortDirection])

  // Handle column header click for sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, default to descending for scores (highest first)
      setSortField(field)
      setSortDirection(field === 'rank' ? 'asc' : 'desc')
    }
  }

  // Render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="sort-icon inactive" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
        </svg>
      )
    }

    if (sortDirection === 'asc') {
      return (
        <svg className="sort-icon active" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
        </svg>
      )
    } else {
      return (
        <svg className="sort-icon active" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      )
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">Ranking Penilaian Driver</h1>
          <p className="page-subtitle">Peringkat driver berdasarkan performa dan penilaian</p>
        </div>

        {!selectedDriver ? (
          // Ranking Table View
          <div className="ranking-container">
            {/* Month Filter */}
            <div className="ranking-controls">
              <div className="filter-group">
                <label className="filter-label">Filter Bulan:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="month-filter"
                >
                  <option value="all">Semua Bulan (Rata-rata)</option>
                  {availableMonths.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="table-container">
              <table className="ranking-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>
                      <button className="sort-button" onClick={() => handleSort('rank')}>
                        Rank {renderSortIcon('rank')}
                      </button>
                    </th>
                    <th>Nama</th>
                    <th style={{ width: '120px' }}>Armada</th>
                    <th style={{ width: '100px' }}>
                      <button className="sort-button" onClick={() => handleSort('skor1')}>
                        Skor 1 (25%) {renderSortIcon('skor1')}
                      </button>
                    </th>
                    <th style={{ width: '100px' }}>
                      <button className="sort-button" onClick={() => handleSort('skor2')}>
                        Skor 2 (20%) {renderSortIcon('skor2')}
                      </button>
                    </th>
                    <th style={{ width: '100px' }}>
                      <button className="sort-button" onClick={() => handleSort('skor3')}>
                        Skor 3 (20%) {renderSortIcon('skor3')}
                      </button>
                    </th>
                    <th style={{ width: '100px' }}>
                      <button className="sort-button" onClick={() => handleSort('skor4')}>
                        Skor 4 (15%) {renderSortIcon('skor4')}
                      </button>
                    </th>
                    <th style={{ width: '100px' }}>
                      <button className="sort-button" onClick={() => handleSort('skor5')}>
                        Skor 5 (10%) {renderSortIcon('skor5')}
                      </button>
                    </th>
                    <th style={{ width: '100px' }}>
                      <button className="sort-button" onClick={() => handleSort('skor6')}>
                        Skor 6 (10%) {renderSortIcon('skor6')}
                      </button>
                    </th>
                    <th style={{ width: '120px' }}>
                      <button className="sort-button" onClick={() => handleSort('total')}>
                        Total {renderSortIcon('total')}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rankedDrivers.map((driver, index) => {
                    return (
                      <tr 
                        key={driver.id}
                        onClick={() => setSelectedDriver(driver)}
                        className="clickable-row"
                      >
                        <td className="text-center rank-cell">
                          <span className={`rank-badge rank-${index + 1}`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="driver-name">{driver.nama}</td>
                        <td className="text-center">
                          <span className="armada-badge">Armada {driver.namaArmada}</span>
                        </td>
                        <td className="text-center weighted-score">
                          {driver.skor1}
                        </td>
                        <td className="text-center weighted-score">
                          {driver.skor2}
                        </td>
                        <td className="text-center weighted-score">
                          {driver.skor3}
                        </td>
                        <td className="text-center weighted-score">
                          {driver.skor4}
                        </td>
                        <td className="text-center weighted-score">
                          {driver.skor5}
                        </td>
                        <td className="text-center weighted-score">
                          {driver.skor6}
                        </td>
                        <td className="text-center total-score">{driver.totalScore}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Driver Detail View with Monthly Scores
          <div className="driver-detail-container">
            <button 
              onClick={() => setSelectedDriver(null)}
              className="btn-back"
            >
              ← Kembali ke Ranking
            </button>

            {/* Driver Info Card */}
            <div className="driver-info-card">
              <div className="driver-avatar">
                <span className="avatar-icon">👤</span>
              </div>
              <div className="driver-info">
                <h2 className="driver-detail-name">{selectedDriver.nama}</h2>
                <p className="driver-detail-subtitle">Informasi tentang Driver</p>
              </div>
            </div>

            {/* Monthly Scores Table */}
            <div className="monthly-scores-container">
              <h3 className="section-title">Skor Bulanan</h3>
              <div className="table-container">
                <table className="monthly-table">
                  <thead>
                    <tr>
                      <th>Bulan/Tahun</th>
                      <th>Armada</th>
                      <th>Skor 1 (25%)</th>
                      <th>Skor 2 (20%)</th>
                      <th>Skor 3 (20%)</th>
                      <th>Skor 4 (15%)</th>
                      <th>Skor 5 (10%)</th>
                      <th>Skor 6 (10%)</th>
                      <th>Skor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDriver.skorBulanan && selectedDriver.skorBulanan.length > 0 ? (
                      selectedDriver.skorBulanan.map((skorBulan, index) => {
                        const monthlyTotal = calculateTotalScore(skorBulan.skor)
                        return (
                          <tr key={index}>
                            <td className="month-cell">{skorBulan.bulan}</td>
                            <td className="text-center">
                              <span className="armada-badge">Armada {selectedDriver.namaArmada}</span>
                            </td>
                            <td className="text-center weighted-score">
                              {calculateWeightedScore(skorBulan.skor.etikaAdab, bobotPenilaian.etikaAdab)}
                            </td>
                            <td className="text-center weighted-score">
                              {calculateWeightedScore(skorBulan.skor.disiplin, bobotPenilaian.disiplin)}
                            </td>
                            <td className="text-center weighted-score">
                              {calculateWeightedScore(skorBulan.skor.loyalitas, bobotPenilaian.loyalitas)}
                            </td>
                            <td className="text-center weighted-score">
                              {calculateWeightedScore(skorBulan.skor.skillMengemudi, bobotPenilaian.skillMengemudi)}
                            </td>
                            <td className="text-center weighted-score">
                              {calculateWeightedScore(skorBulan.skor.perawatanKendaraan, bobotPenilaian.perawatanKendaraan)}
                            </td>
                            <td className="text-center weighted-score">
                              {calculateWeightedScore(skorBulan.skor.performa, bobotPenilaian.performa)}
                            </td>
                            <td className="text-center total-score">{monthlyTotal}</td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center empty-state">
                          Belum ada data skor bulanan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
