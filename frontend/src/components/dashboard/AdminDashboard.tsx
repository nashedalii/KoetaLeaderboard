'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/utils/api'

interface Top5Item {
  rank: number
  nama_driver: string
  nama_armada: string
  kode_bus: string
  skor_total: string | number
  nama_periode?: string
}

interface PeriodeAktif {
  periode_id: number
  nama_periode: string
  bulan: string
  tahun: number
}

interface DashboardData {
  total_driver_aktif: number
  total_armada: number
  total_petugas_aktif: number
  total_pending_validasi: number
  total_approved_bulan_ini: number
  periode_aktif: PeriodeAktif | null
  top5_ranking: Top5Item[]
}

const RANK_COLORS  = ['#f59e0b', '#94a3b8', '#cd7f32', '#667eea', '#667eea']
const RANK_BG      = ['#fef3c7', '#f1f5f9', '#fdf3e3', '#eef2ff', '#eef2ff']
const CARD_ACCENTS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6']

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function AvatarInitials({ name, rank }: { name: string; rank: number }) {
  const bg = RANK_COLORS[rank - 1] ?? '#667eea'
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: bg,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8rem',
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: '0.04em',
      }}
    >
      {getInitials(name)}
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const color = RANK_COLORS[rank - 1] ?? '#667eea'
  const bg    = RANK_BG[rank - 1]    ?? '#eef2ff'
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: bg,
        border: `2px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {rank <= 3 ? (
        <svg viewBox="0 0 20 20" width={16} height={16} fill={color}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.35 2.438c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.663 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ) : (
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{rank}</span>
      )}
    </div>
  )
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  const color = pct >= 90 ? '#10b981' : pct >= 75 ? '#3b82f6' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ width: 80, height: 6, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 999,
          transition: 'width 0.6s ease',
        }}
      />
    </div>
  )
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 20,
        padding: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ height: 14, background: '#e5e7eb', borderRadius: 8, width: '55%' }} />
        <div style={{ height: 36, width: 36, background: '#e5e7eb', borderRadius: 10 }} />
      </div>
      <div style={{ height: 44, background: '#e5e7eb', borderRadius: 8, width: '38%', marginBottom: 12 }} />
      <div style={{ height: 12, background: '#f3f4f6', borderRadius: 8, width: '72%' }} />
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData]         = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await apiFetch('/api/dashboard/admin')
        setData(result)
      } catch {
        setError('Gagal memuat data dashboard')
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div style={{ height: 32, background: 'rgba(255,255,255,0.2)', borderRadius: 8, width: 220, marginBottom: 8 }} />
          <div style={{ height: 14, background: 'rgba(255,255,255,0.12)', borderRadius: 8, width: 160, marginBottom: 40 }} />
          <div className="stats-grid">
            {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="dashboard-container">
        <div className="alert-error">{error ?? 'Data tidak tersedia'}</div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Driver Aktif',
      value: data.total_driver_aktif,
      sub: `${data.total_armada} armada · ${data.total_petugas_aktif} petugas aktif`,
      subClass: 'neutral',
      accent: CARD_ACCENTS[0],
      iconBg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)',
      iconColor: '#2563eb',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
    {
      title: 'Pending Validasi',
      value: data.total_pending_validasi,
      sub: data.total_pending_validasi > 0 ? 'Segera lakukan validasi' : 'Semua sudah divalidasi',
      subClass: data.total_pending_validasi > 0 ? 'negative' : 'positive',
      accent: CARD_ACCENTS[1],
      iconBg: 'linear-gradient(135deg,#ddd6fe,#c4b5fd)',
      iconColor: '#7c3aed',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
    },
    {
      title: 'Approved Bulan Ini',
      value: data.total_approved_bulan_ini,
      sub: 'Penilaian tervalidasi bulan ini',
      subClass: 'positive',
      accent: CARD_ACCENTS[2],
      iconBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
      iconColor: '#059669',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Periode Aktif',
      value: null,
      valueLg: data.periode_aktif?.nama_periode ?? '—',
      sub: data.periode_aktif ? 'Sedang berjalan' : 'Tidak ada periode aktif',
      subClass: data.periode_aktif ? 'positive' : 'neutral',
      accent: CARD_ACCENTS[3],
      iconBg: 'linear-gradient(135deg,#fef3c7,#fde68a)',
      iconColor: '#d97706',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
  ]

  const periodLabel = data.top5_ranking[0]?.nama_periode
    ?? data.periode_aktif?.nama_periode
    ?? 'Periode terakhir'

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="page-header" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 className="page-title" style={{ marginBottom: 6 }}>Dashboard Admin</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0 }}>
                {data.periode_aktif
                  ? `Periode aktif: ${data.periode_aktif.nama_periode}`
                  : 'Tidak ada periode aktif saat ini'}
              </p>
            </div>
            {data.periode_aktif && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.35)',
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#34d399',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#34d399',
                    display: 'inline-block',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
                Live
              </div>
            )}
          </div>
        </div>

        {/* ── Stat Cards ───────────────────────────────────────── */}
        <div className="stats-grid">
          {statCards.map((card, i) => (
            <div
              key={i}
              className="stat-card"
              style={{
                borderTop: `4px solid ${card.accent}`,
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* subtle background glow */}
              <div
                style={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: card.accent,
                  opacity: 0.04,
                  pointerEvents: 'none',
                }}
              />

              <div className="stat-header">
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {card.title}
                </h3>
                <div className="stat-icon" style={{ background: card.iconBg, color: card.iconColor }}>
                  {card.icon}
                </div>
              </div>

              <div className="stat-number" style={{ fontSize: card.valueLg ? '1.4rem' : 48, fontWeight: 800, color: '#111827' }}>
                {card.value !== null ? card.value : card.valueLg}
              </div>

              <div className={`stat-trend ${card.subClass}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {card.subClass === 'positive' && (
                  <svg width={14} height={14} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                  </svg>
                )}
                {card.subClass === 'negative' && (
                  <svg width={14} height={14} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{card.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Top 5 Driver ─────────────────────────────────────── */}
        <div
          style={{
            background: 'rgba(255,255,255,0.97)',
            borderRadius: 20,
            padding: 28,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg,#667eea,#764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Top 5 Driver</h2>
                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Berdasarkan skor tertinggi</p>
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#6b7280',
                background: '#f3f4f6',
                borderRadius: 999,
                padding: '4px 12px',
                border: '1px solid #e5e7eb',
              }}
            >
              Periode: {periodLabel}
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#f3f4f6', marginBottom: 16 }} />

          {data.top5_ranking.length === 0 ? (
            <div className="empty-state">
              <p>Belum ada penilaian yang disetujui.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.top5_ranking.map((item, index) => {
                const score = parseFloat(String(item.skor_total))
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 16px',
                      borderRadius: 14,
                      background: index === 0 ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : '#f9fafb',
                      border: index === 0 ? '1px solid #fde68a' : '1px solid #f3f4f6',
                      cursor: 'default',
                      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLDivElement
                      el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
                      el.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLDivElement
                      el.style.boxShadow = 'none'
                      el.style.transform = 'none'
                    }}
                  >
                    {/* Rank badge */}
                    <RankBadge rank={index + 1} />

                    {/* Avatar */}
                    <AvatarInitials name={item.nama_driver} rank={index + 1} />

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.nama_driver}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>
                        {item.nama_armada} · {item.kode_bus}
                      </p>
                    </div>

                    {/* Score + bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 800,
                          color: RANK_COLORS[index] ?? '#667eea',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {score.toFixed(1)}
                      </span>
                      <ScoreBar score={score} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
