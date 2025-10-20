'use client'

import { useState, useEffect, useMemo } from 'react'
import { dummyUsers } from '@/data/dummyUsers'

// Bobot penilaian
const bobotPenilaian = {
  etikaAdab: 25,
  disiplin: 20,
  loyalitas: 20,
  skillMengemudi: 15,
  perawatanKendaraan: 10,
  performa: 10
}

interface Notification {
  id: number
  type: 'reminder' | 'approval' | 'feedback'
  message: string
  date: string
  isRead: boolean
}

export default function PetugasDashboard() {
  const [currentMonth] = useState('Oktober/2025')
  const [petugasArmada] = useState<'A' | 'B' | 'C'>('A') // Hardcoded for now, should come from login data
  
  // Get drivers under this petugas's armada
  const myDrivers = useMemo(() => {
    return dummyUsers.filter(user => 
      user.role === 'Supir' && 
      user.namaArmada === petugasArmada &&
      user.status === 'Aktif'
    )
  }, [petugasArmada])

  // Calculate weighted score component (rounded)
  const calculateWeightedScoreComponent = (value: number, bobot: number) => {
    return Math.round((value * bobot / 100) * 10) / 10
  }

  // Calculate weighted score
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

  // Calculate average score for armada using rata-rata from skorBulanan
  const armadaAverageScore = useMemo(() => {
    if (myDrivers.length === 0) return 0
    
    const totalScore = myDrivers.reduce((sum, driver) => {
      return sum + calculateTotalScore(driver)
    }, 0)
    
    return Math.round((totalScore / myDrivers.length) * 10) / 10
  }, [myDrivers])

  // Find best and worst driver using rata-rata from skorBulanan
  const bestDriver = useMemo(() => {
    if (myDrivers.length === 0) return null
    
    return myDrivers.reduce((best, driver) => {
      const driverScore = calculateTotalScore(driver)
      const bestScore = calculateTotalScore(best)
      return driverScore > bestScore ? driver : best
    })
  }, [myDrivers])

  const worstDriver = useMemo(() => {
    if (myDrivers.length === 0) return null
    
    return myDrivers.reduce((worst, driver) => {
      const driverScore = calculateTotalScore(driver)
      const worstScore = calculateTotalScore(worst)
      return driverScore < worstScore ? driver : worst
    })
  }, [myDrivers])

  // Input status
  const inputStatus = useMemo(() => {
    const total = myDrivers.length
    const completed = myDrivers.filter(d => d.skorBulanan && d.skorBulanan.length > 0).length
    const pending = total - completed
    
    return { total, completed, pending }
  }, [myDrivers])

  // Dummy notifications
  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'reminder',
      message: 'Deadline input data kinerja bulan Oktober: 5 hari lagi',
      date: '2025-10-20',
      isRead: false
    },
    {
      id: 2,
      type: 'approval',
      message: 'Data kinerja bulan September telah disetujui Admin',
      date: '2025-10-18',
      isRead: false
    },
    {
      id: 3,
      type: 'feedback',
      message: 'Admin memberikan catatan untuk data driver Ridho Saputra',
      date: '2025-10-17',
      isRead: true
    }
  ])

  const unreadNotifications = notifications.filter(n => !n.isRead).length

  // Calendar deadlines
  const upcomingDeadlines = [
    { date: '25 Oktober 2025', event: 'Deadline Input Data Oktober', type: 'deadline' },
    { date: '1 November 2025', event: 'Periode Input November Dibuka', type: 'info' },
    { date: '15 November 2025', event: 'Review Meeting dengan Admin', type: 'meeting' }
  ]

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard Petugas - Armada {petugasArmada}</h1>
            <p className="page-subtitle">Monitoring dan manajemen data kinerja driver</p>
          </div>
          <div className="header-date">
            <span className="current-period">📅 Periode: {currentMonth}</span>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="overview-cards-grid">
          {/* Total Drivers */}
          <div className="overview-card">
            <div className="card-icon drivers-icon">
              <span>👥</span>
            </div>
            <div className="card-content">
              <h3 className="card-title">Total Driver</h3>
              <p className="card-value">{myDrivers.length}</p>
              <p className="card-subtitle">Driver aktif di Armada {petugasArmada}</p>
            </div>
          </div>

          {/* Input Status */}
          <div className="overview-card">
            <div className="card-icon status-icon">
              <span>📝</span>
            </div>
            <div className="card-content">
              <h3 className="card-title">Status Input</h3>
              <div className="card-split-value">
                <div>
                  <p className="value-large completed">{inputStatus.completed}</p>
                  <p className="value-label">Selesai</p>
                </div>
                <div>
                  <p className="value-large pending">{inputStatus.pending}</p>
                  <p className="value-label">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="overview-card">
            <div className="card-icon score-icon">
              <span>📊</span>
            </div>
            <div className="card-content">
              <h3 className="card-title">Rata-rata Skor</h3>
              <p className="card-value score">{armadaAverageScore}</p>
              <p className="card-subtitle">Armada {petugasArmada}</p>
            </div>
          </div>

          {/* Notifications */}
          <div className="overview-card">
            <div className="card-icon notification-icon">
              <span>🔔</span>
              {unreadNotifications > 0 && (
                <span className="notification-badge">{unreadNotifications}</span>
              )}
            </div>
            <div className="card-content">
              <h3 className="card-title">Notifikasi</h3>
              <p className="card-value">{unreadNotifications}</p>
              <p className="card-subtitle">Pesan belum dibaca</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-main-grid">
          {/* Quick Stats */}
          <div className="dashboard-section quick-stats">
            <div className="section-header">
              <h2 className="section-title">Quick Stats</h2>
              <span className="section-subtitle">Performa driver terbaik & terburuk</span>
            </div>
            
            <div className="stats-cards">
              {/* Best Driver */}
              {bestDriver && (
                <div className="stat-card best-driver">
                  <div className="stat-header">
                    <span className="stat-badge best">🏆 Terbaik</span>
                  </div>
                  <h3 className="driver-name">{bestDriver.nama}</h3>
                  <div className="driver-info">
                    <span className="info-item">Armada {bestDriver.namaArmada}</span>
                    <span className="info-divider">•</span>
                    <span className="info-item">{bestDriver.namaKernet}</span>
                  </div>
                  <div className="score-display">
                    <span className="score-label">Skor Total</span>
                    <span className="score-value best">{calculateTotalScore(bestDriver)}</span>
                  </div>
                </div>
              )}

              {/* Worst Driver */}
              {worstDriver && (
                <div className="stat-card worst-driver">
                  <div className="stat-header">
                    <span className="stat-badge worst">📉 Perlu Perhatian</span>
                  </div>
                  <h3 className="driver-name">{worstDriver.nama}</h3>
                  <div className="driver-info">
                    <span className="info-item">Armada {worstDriver.namaArmada}</span>
                    <span className="info-divider">•</span>
                    <span className="info-item">{worstDriver.namaKernet}</span>
                  </div>
                  <div className="score-display">
                    <span className="score-label">Skor Total</span>
                    <span className="score-value worst">{calculateTotalScore(worstDriver)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calendar & Deadlines */}
          <div className="dashboard-section calendar-section">
            <div className="section-header">
              <h2 className="section-title">📅 Jadwal & Deadline</h2>
              <span className="section-subtitle">Upcoming events</span>
            </div>
            
            <div className="calendar-list">
              {upcomingDeadlines.map((item, index) => (
                <div key={index} className={`calendar-item ${item.type}`}>
                  <div className="calendar-date">
                    <span className="date-day">{item.date.split(' ')[0]}</span>
                    <span className="date-month">{item.date.split(' ')[1]}</span>
                  </div>
                  <div className="calendar-info">
                    <p className="calendar-event">{item.event}</p>
                    <span className={`calendar-type ${item.type}`}>
                      {item.type === 'deadline' ? '⏰ Deadline' : 
                       item.type === 'meeting' ? '👥 Meeting' : 'ℹ️ Info'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notification Center */}
        <div className="dashboard-section notification-center">
          <div className="section-header">
            <h2 className="section-title">🔔 Notification Center</h2>
            <span className="section-subtitle">{unreadNotifications} unread</span>
          </div>
          
          <div className="notifications-list">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.type} ${notification.isRead ? 'read' : 'unread'}`}
              >
                <div className="notification-icon">
                  {notification.type === 'reminder' && '⏰'}
                  {notification.type === 'approval' && '✅'}
                  {notification.type === 'feedback' && '💬'}
                </div>
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-date">{notification.date}</span>
                </div>
                {!notification.isRead && <div className="unread-indicator"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
