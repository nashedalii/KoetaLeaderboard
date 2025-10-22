'use client'

import { useEffect, useState } from 'react'
import { dummyUsers, User } from '@/data/dummyUsers'

// Bobot penilaian (SAMA dengan RankingPenilaian)
const bobotPenilaian = {
  etikaAdab: 25,
  disiplin: 20,
  loyalitas: 20,
  skillMengemudi: 15,
  perawatanKendaraan: 10,
  performa: 10
}

export default function DriverDashboard() {
  const [driverData, setDriverData] = useState<User | null>(null)
  const [skorAkhirMaret, setSkorAkhirMaret] = useState(0)
  const [rankingMaret, setRankingMaret] = useState(0)
  const [totalDrivers, setTotalDrivers] = useState(0)

  // Calculate weighted score (SAMA dengan RankingPenilaian)
  const calculateWeightedScore = (value: number, bobot: number) => {
    return Math.round((value * bobot / 100) * 10) / 10
  }

  // Calculate total score based on bobot (SAMA dengan RankingPenilaian)
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

  useEffect(() => {
    // Ambil username dari localStorage
    const username = localStorage.getItem('username')
    
    // Cari driver berdasarkan username (untuk supir_01) atau fallback ke Budiman Santoso
    const loggedInDriver = dummyUsers.find(
      (user) => user.role === 'Supir' && (user.username === username || user.nama === 'Budiman Santoso')
    )
    
    if (loggedInDriver) {
      setDriverData(loggedInDriver)
      
      // Ambil skor bulan Maret 2025
      const skorMaret = loggedInDriver.skorBulanan?.find(sb => sb.bulan === 'Maret/2025')
      
      if (skorMaret) {
        // Hitung skor akhir bulan Maret
        const totalScore = calculateTotalScore(skorMaret.skor)
        setSkorAkhirMaret(totalScore)
        
        // Hitung ranking di bulan Maret (SAMA dengan RankingPenilaian)
        const allDrivers = dummyUsers.filter(user => user.role === 'Supir')
        setTotalDrivers(allDrivers.length)
        
        // Hitung skor Maret untuk semua driver dan ranking
        const driversWithMaretScore = allDrivers
          .map(d => {
            const skorMaretDriver = d.skorBulanan?.find(sb => sb.bulan === 'Maret/2025')
            return {
              ...d,
              skorMaret: skorMaretDriver ? calculateTotalScore(skorMaretDriver.skor) : 0
            }
          })
          .sort((a, b) => b.skorMaret - a.skorMaret)
        
        const driverRank = driversWithMaretScore.findIndex(d => d.id === loggedInDriver.id) + 1
        setRankingMaret(driverRank)
      }
    }
  }, [])

  if (!driverData) {
    return (
      <div className="dashboard-container">
        <div className="loading-message">Memuat data...</div>
      </div>
    )
  }

  return (
    <div className="driver-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">
            Selamat Datang, <span className="driver-name">{driverData.nama}</span>
          </h1>
          <p className="welcome-subtitle">
            Dashboard Informasi & Performa Anda
          </p>
        </div>
        <div className="welcome-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
      </div>

      {/* Identity Card - Simple Version */}
      <div className="identity-simple-card">
        <div className="identity-status-row">
          <div className="status-badge-inline active">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>Status: {driverData.status}</span>
          </div>
        </div>
        
        <div className="identity-row">
          <div className="identity-item">
            <span className="identity-icon">👤</span>
            <div className="identity-info">
              <span className="identity-simple-label">Nama:</span>
              <span className="identity-simple-value">{driverData.nama}</span>
            </div>
          </div>
          <div className="identity-item">
            <span className="identity-icon">🚍</span>
            <div className="identity-info">
              <span className="identity-simple-label">Armada:</span>
              <span className="identity-simple-value">{driverData.namaArmada || '-'}</span>
            </div>
          </div>
        </div>
        
        <div className="identity-row">
          <div className="identity-item">
            <span className="identity-icon">🎫</span>
            <div className="identity-info">
              <span className="identity-simple-label">ID:</span>
              <span className="identity-simple-value">{driverData.id}</span>
            </div>
          </div>
          <div className="identity-item">
            <span className="identity-icon">👨‍✈️</span>
            <div className="identity-info">
              <span className="identity-simple-label">Nama Kernet:</span>
              <span className="identity-simple-value">{driverData.namaKernet || '-'}</span>
            </div>
          </div>
        </div>
        
        <div className="identity-row">
          <div className="identity-item identity-item-full">
            <span className="identity-icon">📧</span>
            <div className="identity-info">
              <span className="identity-simple-label">Email:</span>
              <span className="identity-simple-value">{driverData.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats - Simplified */}
      <div className="performance-simple-section">
        <div className="performance-simple-grid">
          <div className="stat-simple-card score-card">
            <span className="stat-simple-icon">🏆</span>
            <div className="stat-simple-content">
              <span className="stat-simple-label">Skor Akhir Bulan Maret:</span>
              <span className="stat-simple-value">{skorAkhirMaret}/100</span>
            </div>
          </div>
          
          <div className="stat-simple-card rank-card">
            <span className="stat-simple-icon">📈</span>
            <div className="stat-simple-content">
              <span className="stat-simple-label">Peringkat:</span>
              <span className="stat-simple-value">#{rankingMaret} dari {totalDrivers} supir</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Scores - Data Bulan Maret */}
      {driverData.skorBulanan && driverData.skorBulanan.find(sb => sb.bulan === 'Maret/2025') && (
        <div className="detailed-scores-section">
          <h3 className="detailed-scores-title">Rincian Penilaian Bulan Maret 2025</h3>
          <div className="scores-grid">
            <div className="score-item">
              <div className="score-item-header">
                <span className="score-item-label">Etika & Adab</span>
                <span className="score-item-value">{driverData.skorBulanan.find(sb => sb.bulan === 'Maret/2025')?.skor.etikaAdab}/100</span>
              </div>
              <div className="score-bar-container">
                <div 
                  className="score-bar"
                  style={{ width: `${driverData.skorBulanan.find(sb => sb.bulan === 'Maret/2025')?.skor.etikaAdab}%` }}
                />
              </div>
            </div>

            <div className="score-item">
              <div className="score-item-header">
                <span className="score-item-label">Disiplin</span>
                <span className="score-item-value">{driverData.skorBulanan.find(sb => sb.bulan === 'Maret/2025')?.skor.disiplin}/100</span>
              </div>
              <div className="score-bar-container">
                <div 
                  className="score-bar"
                  style={{ width: `${driverData.skorBulanan.find(sb => sb.bulan === 'Maret/2025')?.skor.disiplin}%` }}
                />
              </div>
            </div>

            <div className="score-item">
              <div className="score-item-header">
                <span className="score-item-label">Loyalitas</span>
                <span className="score-item-value">{driverData.skorBulanan.find(sb => sb.bulan === 'Maret/2025')?.skor.loyalitas}/100</span>
              </div>
              <div className="score-bar-container">
                <div 
                  className="score-bar"
                  style={{ width: `${driverData.skorBulanan.find(sb => sb.bulan === 'Maret/2025')?.skor.loyalitas}%` }}
                />
              </div>
            </div>

            <div className="score-item">
              <div className="score-item-header">
                <span className="score-item-label">Skill Mengemudi</span>
                <span className="score-item-value">{driverData.skorBulanan.find(sb => sb.bulan === 'Maret/2025')?.skor.skillMengemudi}/100</span>
              </div>
              <div className="score-bar-container">
                <div 
                  className="score-bar"
                  style={{ width: `${driverData.skorBulanan.find(sb => sb.bulan === 'Maret/2025')?.skor.skillMengemudi}%` }}
                />
              </div>
            </div>

            <div className="score-item">
              <div className="score-item-header">
                <span className="score-item-label">Perawatan Kendaraan</span>
                <span className="score-item-value">{driverData.skorBulanan.find(sb => sb.bulan === 'Maret/2025')?.skor.perawatanKendaraan}/100</span>
              </div>
              <div className="score-bar-container">
                <div 
                  className="score-bar"
                  style={{ width: `${driverData.skorBulanan.find(sb => sb.bulan === 'Maret/2025')?.skor.perawatanKendaraan}%` }}
                />
              </div>
            </div>

            <div className="score-item">
              <div className="score-item-header">
                <span className="score-item-label">Performa</span>
                <span className="score-item-value">{driverData.skorBulanan.find(sb => sb.bulan === 'Maret/2025')?.skor.performa}/100</span>
              </div>
              <div className="score-bar-container">
                <div 
                  className="score-bar"
                  style={{ width: `${driverData.skorBulanan.find(sb => sb.bulan === 'Maret/2025')?.skor.performa}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
