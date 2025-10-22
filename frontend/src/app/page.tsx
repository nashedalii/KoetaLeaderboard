'use client'

import { useEffect, useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import Sidebar from '@/components/layout/Sidebar'
import { DataProvider } from '@/contexts/DataContext'

// Import halaman-halaman Admin
import AdminDashboard from '@/components/dashboard/AdminDashboard'
import KelolaUser from '@/components/pages/admin/KelolaUser'
import KonfigurasiPenilaian from '@/components/pages/admin/KonfigurasiPenilaian'
import RankingPenilaian from '@/components/pages/admin/RankingPenilaian'
import Analytics from '@/components/pages/admin/Analytics'
import ValidasiDataPetugas from '@/components/pages/admin/ValidasiDataPetugas'

// Import halaman-halaman Petugas
import PetugasDashboard from '@/components/pages/petugas/PetugasDashboard'
import ManajemenDriver from '@/components/pages/petugas/ManajemenDriver'
import InputValidasiData from '@/components/pages/petugas/InputValidasiData'

// Import halaman-halaman Driver
import DriverDashboard from '@/components/pages/driver/DriverDashboard'

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
    // Set default page berdasarkan role
    if (role === 'Petugas') {
      setCurrentPage('petugas-dashboard')
    } else if (role === 'Supir') {
      setCurrentPage('driver-dashboard')
    } else {
      setCurrentPage('dashboard')
    }
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
        
        case 'validasi':
          return <ValidasiDataPetugas />
        
        default:
          return <AdminDashboard />
      }
    }

    if (userRole === 'Petugas') {
      switch (currentPage) {
        case 'petugas-dashboard':
          return <PetugasDashboard />
        
        case 'manajemen-driver':
          return <ManajemenDriver />
        
        case 'input-validasi':
          return <InputValidasiData />
        
        case 'petugas-ranking':
          return <RankingPenilaian />
        
        default:
          return <PetugasDashboard />
      }
    }

    if (userRole === 'Supir') {
      switch (currentPage) {
        case 'driver-dashboard':
          return <DriverDashboard />
        
        default:
          return <DriverDashboard />
      }
    }

    return <div>Unknown role</div>
  }

  // Render dengan Sidebar
  return (
    <DataProvider>
      <div className="app-container">
        <Sidebar 
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          userRole={userRole as 'Admin' | 'Petugas' | 'Supir'}
        />
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </DataProvider>
  )
}
