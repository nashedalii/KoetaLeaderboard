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
            <span className="identity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </span>
            <div className="identity-info">
              <span className="identity-simple-label">Nama:</span>
              <span className="identity-simple-value">{driverData.nama}</span>
            </div>
          </div>
          <div className="identity-item">
            <span className="identity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m6-3.75h6.375a1.125 1.125 0 0 1 1.125 1.125v3.75m-6 3.75v-3.75a1.125 1.125 0 0 0-1.125-1.125H9.75m12 3.75h2.625a1.125 1.125 0 0 1 1.125-1.125V9.75A1.125 1.125 0 0 0 21.75 8.625H18a2.25 2.25 0 0 0-2.25 2.25m9 1.5h-6.375a1.125 1.125 0 0 1-1.125-1.125v-2.25a1.125 1.125 0 0 1 1.125-1.125H21M8.25 9.75H3.375A1.125 1.125 0 0 1 2.25 8.625V6.375a1.125 1.125 0 0 1 1.125-1.125h4.5m0 6.75v-3a1.125 1.125 0 0 1 1.125-1.125h2.25m-6 3V9.75a1.125 1.125 0 0 1 1.125-1.125H9.75" />
              </svg>
            </span>
            <div className="identity-info">
              <span className="identity-simple-label">Armada:</span>
              <span className="identity-simple-value">{driverData.namaArmada || '-'}</span>
            </div>
          </div>
        </div>
        
        <div className="identity-row">
          <div className="identity-item">
            <span className="identity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Z" />
              </svg>
            </span>
            <div className="identity-info">
              <span className="identity-simple-label">ID:</span>
              <span className="identity-simple-value">{driverData.id}</span>
            </div>
          </div>
          <div className="identity-item">
            <span className="identity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </span>
            <div className="identity-info">
              <span className="identity-simple-label">Nama Kernet:</span>
              <span className="identity-simple-value">{driverData.namaKernet || '-'}</span>
            </div>
          </div>
        </div>
        
        <div className="identity-row">
          <div className="identity-item identity-item-full">
            <span className="identity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </span>
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
            <span className="stat-simple-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
              </svg>
            </span>
            <div className="stat-simple-content">
              <span className="stat-simple-label">Skor Akhir Bulan Maret:</span>
              <span className="stat-simple-value">{skorAkhirMaret}/100</span>
            </div>
          </div>
          
          <div className="stat-simple-card rank-card">
            <span className="stat-simple-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </span>
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
