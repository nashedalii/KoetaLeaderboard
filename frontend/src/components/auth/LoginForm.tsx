'use client'

import { useState } from 'react'
import Image from 'next/image'

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  petugas: 'Petugas',
  driver: 'Supir'
}

interface LoginFormProps {
  onLoginSuccess?: (role: string, nama: string) => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.message || 'Login gagal')
        return
      }

      const roleLabel = ROLE_LABEL[data.user.role] ?? data.user.role

      const auth = {
        token: data.token,
        user: {
          id: data.user.id,
          nama: data.user.nama,
          role: data.user.role,
          roleLabel
        }
      }

      localStorage.setItem('auth', JSON.stringify(auth))

      if (onLoginSuccess) {
        onLoginSuccess(roleLabel, data.user.nama)
      }

    } catch (err) {
      setErrorMessage('Tidak dapat terhubung ke server')
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
              <label htmlFor="identifier" className="form-label">
                Username / Nomor Pegawai
              </label>
              <input
                id="identifier"
                type="text"
                placeholder="Masukkan username atau nomor pegawai"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
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

            {errorMessage && (
              <div className="message error">
                {errorMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}
