'use client'

import { useState } from 'react'
import Image from 'next/image'

interface LoginFormProps {
  onLoginSuccess?: (role: string, username: string) => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [userRole, setUserRole] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setUserRole('')

    // Role-based credentials
    const roleCredentials = {
      // Admin
      'admin_dishub': { password: 'admin123', role: 'Admin' },
      
      // Petugas
      'petugas_01': { password: 'petugas123', role: 'Petugas' },
      'petugas_02': { password: 'petugas123', role: 'Petugas' },
      
      // Supir
      'supir_01': { password: 'supir123', role: 'Supir' },
      'supir_02': { password: 'supir123', role: 'Supir' },
    }

    // Cek role credentials
    const userCredential = roleCredentials[username as keyof typeof roleCredentials]
    
    if (userCredential && userCredential.password === password) {
      setUserRole(userCredential.role)
      setMessage(`🎉 Berhasil login sebagai ${userCredential.role}`)
      
      // Simpan role di localStorage untuk session management
      localStorage.setItem('userRole', userCredential.role)
      localStorage.setItem('username', username)
      
      // Trigger callback setelah 1.5 detik
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(userCredential.role, username)
        }
      }, 1500)
      
      setIsLoading(false)
      return
    }

    // Jika bukan demo credentials, coba hubungi backend
    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()
      if (data.success) {
        setMessage(`✅ ${data.message}`)
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (error) {
      setMessage('❌ Username atau password salah!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-container">
      <div className="login-wrapper">
        {/* Logo Dishub */}
        <div className="logo-container">
          <Image 
            src="/logodishub.png" 
            alt="Logo Dishub" 
            width={149}
            height={149}
            priority
            className="logo"
            style={{ border: 'none', outline: 'none' }}
          />
        </div>

        {/* Form Sign In */}
        <div className="signin-card">
          <h1 className="signin-title">Sign In</h1>
          
          <form onSubmit={handleLogin} className="signin-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'LOG IN'}
            </button>

            {message && (
              <div className={`message ${message.includes('Berhasil') || message.includes('berhasil') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            {userRole && (
              <div className="role-display">
                <div className="role-badge">
                  Role: <span className={`role-${userRole.toLowerCase()}`}>{userRole}</span>
                </div>
              </div>
            )}

            <a href="#" className="forgot-password">
              Forget your password?
            </a>
          </form>
        </div>
      </div>
    </main>
  )
}