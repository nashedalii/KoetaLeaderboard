'use client'

import { useEffect, useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import Sidebar from '@/components/layout/Sidebar'

// Import halaman-halaman (uncomment seiring development)
import AdminDashboard from '@/components/dashboard/AdminDashboard'
import KelolaUser from '@/components/pages/admin/KelolaUser'
import KonfigurasiPenilaian from '@/components/pages/admin/KonfigurasiPenilaian'
import RankingPenilaian from '@/components/pages/admin/RankingPenilaian'
import Analytics from '@/components/pages/admin/Analytics'
// import ValidasiData from '@/components/pages/ValidasiData'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cek session dari localStorage
    const role = localStorage.getItem('userRole')
    const username = localStorage.getItem('username')
    
    if (role && username) {
      setIsLoggedIn(true)
      setUserRole(role)
    } else {
      setIsLoggedIn(false)
      setUserRole('')
    }
    
    setIsLoading(false)
  }, [])

  const handleLoginSuccess = (role: string, username: string) => {
    setIsLoggedIn(true)
    setUserRole(role)
    setCurrentPage('dashboard')
    // Data sudah disimpan di localStorage di LoginForm
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('username')
    setIsLoggedIn(false)
    setUserRole('')
    setCurrentPage('dashboard')
  }

  // Show loading screen while checking localStorage
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div>Loading...</div>
      </div>
    )
  }

  // Render berdasarkan status login dan role
  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  // Render content dengan Sidebar
  const renderContent = () => {
    if (userRole === 'Admin') {
      switch (currentPage) {
        case 'dashboard':
          return <AdminDashboard />
        
        // Uncomment seiring development halaman baru
        case 'kelola-user':
          return <KelolaUser />
        
        case 'konfigurasi':
          return <KonfigurasiPenilaian />
        
        case 'ranking':
          return <RankingPenilaian />
        
        case 'analytics':
          return <Analytics />
        
        // case 'validasi':
        //   return <ValidasiData />
        
        default:
          return <AdminDashboard />
      }
    }

    if (userRole === 'Petugas') {
      return <div className="coming-soon">Dashboard Petugas (Coming Soon)</div>
    }

    if (userRole === 'Supir') {
      return <div className="coming-soon">Dashboard Supir (Coming Soon)</div>
    }

    return <div>Unknown role</div>
  }

  // Render dengan Sidebar
  return (
    <div className="app-container">
      <Sidebar 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}
