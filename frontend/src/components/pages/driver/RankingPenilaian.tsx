'use client'

import { useState, useMemo } from 'react'
import { dummyUsers, User } from '@/data/dummyUsers'

// Bobot penilaian
const bobotPenilaian = {
  etikaAdab: 25,
  disiplin: 20,
  loyalitas: 20,
  skillMengemudi: 15,
  perawatanKendaraan: 10,
  performa: 10
}

export default function RankingPenilaian() {
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  // Get logged in driver
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null
  const currentDriver = dummyUsers.find(user => 
    user.role === 'Supir' && (user.username === username || user.nama === 'Budiman Santoso')
  )

  // Get only drivers (Supir)
  const drivers = dummyUsers.filter(user => user.role === 'Supir')

  // Get unique months from all drivers
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>()
    drivers.forEach(driver => {
      driver.skorBulanan?.forEach(skorBulan => {
        monthsSet.add(skorBulan.bulan)
      })
    })
    
    const monthOrder = ['Januari/2025', 'Februari/2025', 'Maret/2025']
    return monthOrder.filter(month => monthsSet.has(month))
  }, [drivers])

  // Calculate weighted score
  const calculateWeightedScore = (value: number, bobot: number) => {
    return Math.round((value * bobot / 100) * 10) / 10
  }

  // Calculate total score
  const calculateTotalScore = (skor: any) => {
    if (!skor) return 0
    
    const total = 
      calculateWeightedScore(skor.etikaAdab || 0, bobotPenilaian.etikaAdab) +
      calculateWeightedScore(skor.disiplin || 0, bobotPenilaian.disiplin) +
      calculateWeightedScore(skor.loyalitas || 0, bobotPenilaian.loyalitas) +
      calculateWeightedScore(skor.skillMengemudi || 0, bobotPenilaian.skillMengemudi) +
      calculateWeightedScore(skor.perawatanKendaraan || 0, bobotPenilaian.perawatanKendaraan) +
      calculateWeightedScore(skor.performa || 0, bobotPenilaian.performa)
    
    return Math.round(total * 10) / 10
  }

  // Calculate average scores from all months
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
    return drivers
      .map(driver => {
        const skor = getDriverScores(driver)
        return {
          ...driver,
          currentSkor: skor,
          totalScore: calculateTotalScore(skor)
        }
      })
      .sort((a, b) => b.totalScore - a.totalScore)
  }, [drivers, selectedMonth])

  // Find current driver ranking
  const currentDriverRank = rankedDrivers.findIndex(d => d.id === currentDriver?.id) + 1
  const currentDriverData = rankedDrivers.find(d => d.id === currentDriver?.id)

  // Get top 10 drivers (tetap tampilkan semua top 10)
  const topDrivers = rankedDrivers.slice(0, 10)
  
  // Show personal ranking only if driver is outside top 10
  const showPersonalRanking = currentDriverRank > 10

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">Ranking Driver</h1>
          <p className="page-subtitle">Lihat peringkat Anda dibandingkan dengan driver lain</p>
        </div>

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

          {/* Main Ranking Table */}
          <div className="table-container">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Rank</th>
                  <th>Nama</th>
                  <th style={{ width: '120px' }}>Armada</th>
                  <th style={{ width: '100px' }}>Skor 1 (25%)</th>
                  <th style={{ width: '100px' }}>Skor 2 (20%)</th>
                  <th style={{ width: '100px' }}>Skor 3 (20%)</th>
                  <th style={{ width: '100px' }}>Skor 4 (15%)</th>
                  <th style={{ width: '100px' }}>Skor 5 (10%)</th>
                  <th style={{ width: '100px' }}>Skor 6 (10%)</th>
                  <th style={{ width: '120px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {topDrivers.map((driver, index) => {
                  const skor = driver.currentSkor
                  const actualRank = rankedDrivers.findIndex(d => d.id === driver.id) + 1
                  return (
                    <tr key={driver.id}>
                      <td className="text-center rank-cell">
                        <span className={`rank-badge rank-${actualRank}`}>
                          {actualRank}
                        </span>
                      </td>
                      <td className="driver-name">{driver.nama}</td>
                      <td className="text-center">
                        <span className="armada-badge">Armada {driver.namaArmada}</span>
                      </td>
                      <td className="text-center weighted-score">
                        {calculateWeightedScore(skor?.etikaAdab || 0, bobotPenilaian.etikaAdab)}
                      </td>
                      <td className="text-center weighted-score">
                        {calculateWeightedScore(skor?.disiplin || 0, bobotPenilaian.disiplin)}
                      </td>
                      <td className="text-center weighted-score">
                        {calculateWeightedScore(skor?.loyalitas || 0, bobotPenilaian.loyalitas)}
                      </td>
                      <td className="text-center weighted-score">
                        {calculateWeightedScore(skor?.skillMengemudi || 0, bobotPenilaian.skillMengemudi)}
                      </td>
                      <td className="text-center weighted-score">
                        {calculateWeightedScore(skor?.perawatanKendaraan || 0, bobotPenilaian.perawatanKendaraan)}
                      </td>
                      <td className="text-center weighted-score">
                        {calculateWeightedScore(skor?.performa || 0, bobotPenilaian.performa)}
                      </td>
                      <td className="text-center total-score">{driver.totalScore}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Personal Ranking Section - Only show if outside top 10 */}
          {currentDriverData && showPersonalRanking && (
            <div className="personal-ranking-section">
              <h3 className="personal-ranking-title">Ranking Pribadi Driver</h3>
              <div className="table-container">
                <table className="ranking-table personal-ranking-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Rank</th>
                      <th>Nama</th>
                      <th style={{ width: '120px' }}>Armada</th>
                      <th style={{ width: '100px' }}>Skor 1 (25%)</th>
                      <th style={{ width: '100px' }}>Skor 2 (20%)</th>
                      <th style={{ width: '100px' }}>Skor 3 (20%)</th>
                      <th style={{ width: '100px' }}>Skor 4 (15%)</th>
                      <th style={{ width: '100px' }}>Skor 5 (10%)</th>
                      <th style={{ width: '100px' }}>Skor 6 (10%)</th>
                      <th style={{ width: '120px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="personal-row">
                      <td className="text-center rank-cell">
                        <span className={`rank-badge rank-${currentDriverRank}`}>
                          {currentDriverRank}
                        </span>
                      </td>
                      <td className="driver-name">{currentDriverData.nama}</td>
                      <td className="text-center">
                        <span className="armada-badge">Armada {currentDriverData.namaArmada}</span>
                      </td>
                      <td className="text-center weighted-score">
                        {calculateWeightedScore(currentDriverData.currentSkor?.etikaAdab || 0, bobotPenilaian.etikaAdab)}
                      </td>
                      <td className="text-center weighted-score">
                        {calculateWeightedScore(currentDriverData.currentSkor?.disiplin || 0, bobotPenilaian.disiplin)}
                      </td>
                      <td className="text-center weighted-score">
                        {calculateWeightedScore(currentDriverData.currentSkor?.loyalitas || 0, bobotPenilaian.loyalitas)}
                      </td>
                      <td className="text-center weighted-score">
                        {calculateWeightedScore(currentDriverData.currentSkor?.skillMengemudi || 0, bobotPenilaian.skillMengemudi)}
                      </td>
                      <td className="text-center weighted-score">
                        {calculateWeightedScore(currentDriverData.currentSkor?.perawatanKendaraan || 0, bobotPenilaian.perawatanKendaraan)}
                      </td>
                      <td className="text-center weighted-score">
                        {calculateWeightedScore(currentDriverData.currentSkor?.performa || 0, bobotPenilaian.performa)}
                      </td>
                      <td className="text-center total-score">{currentDriverData.totalScore}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
