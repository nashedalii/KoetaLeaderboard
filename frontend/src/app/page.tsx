'use client'

import { useEffect, useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import AdminDashboard from '@/components/dashboard/AdminDashboard'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('')
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
    // Data sudah disimpan di localStorage di LoginForm
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

  // Render dashboard berdasarkan role
  if (userRole === 'Admin') {
    return <AdminDashboard />
  } else if (userRole === 'Petugas') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <h1 style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>
            Dashboard Petugas (Coming Soon)
          </h1>
        </div>
      </div>
    )
  } else if (userRole === 'Supir') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <h1 style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>
            Dashboard Supir (Coming Soon)
          </h1>
        </div>
      </div>
    )
  }

  // Fallback ke login
  return <LoginForm onLoginSuccess={handleLoginSuccess} />
}
