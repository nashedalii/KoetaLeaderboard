'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/utils/api'

// ── Types ──────────────────────────────────────────────────────────────────
interface Siklus {
  siklus_id: number
  nama_siklus: string
  tanggal_mulai: string
  tanggal_selesai: string
  status_siklus: 'aktif' | 'nonaktif'
  status_display: 'berjalan' | 'belum_dimulai' | 'selesai' | 'nonaktif'
  jumlah_periode: number
}

interface Periode {
  periode_id: number
  bulan: string
  tahun: number
  nama_periode: string
  tanggal_mulai: string
  tanggal_selesai: string
  is_override: boolean
  is_aktif: boolean
}

// ── Helpers ────────────────────────────────────────────────────────────────
const BULAN_ID = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
]

function formatTanggal(dateStr: string) {
  const [year, month, day] = dateStr.split('-')
  return `${parseInt(day)} ${BULAN_ID[parseInt(month) - 1]} ${year}`
}

function getToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function autoNamaSiklus(mulai: string, selesai: string) {
  if (!mulai || !selesai) return ''
  const [mulaiY, mulaiM] = mulai.split('-')
  const [selesaiY, selesaiM] = selesai.split('-')
  return `${BULAN_ID[parseInt(mulaiM) - 1]} ${mulaiY} – ${BULAN_ID[parseInt(selesaiM) - 1]} ${selesaiY}`
}

const STATUS_CONFIG = {
  berjalan:      { label: 'Berjalan',      color: '#16a34a', bg: '#dcfce7' },
  belum_dimulai: { label: 'Belum Dimulai', color: '#64748b', bg: '#f1f5f9' },
  selesai:       { label: 'Selesai',       color: '#2563eb', bg: '#dbeafe' },
  nonaktif:      { label: 'Nonaktif',      color: '#dc2626', bg: '#fee2e2' },
}

// ── Component ──────────────────────────────────────────────────────────────
export default function KonfigurasiPenilaian() {
  const [sikluses, setSikluses]           = useState<Siklus[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')

  const [selectedSiklus, setSelectedSiklus] = useState<Siklus | null>(null)
  const [periodes, setPeriodes]             = useState<Periode[]>([])
  const [loadingDetail, setLoadingDetail]   = useState(false)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [saving, setSaving]                   = useState(false)
  const [form, setForm] = useState({ nama_siklus: '', tanggal_mulai: '', tanggal_selesai: '' })

  const [confirmDelete, setConfirmDelete] = useState<Siklus | null>(null)
  const [deleting, setDeleting]           = useState(false)

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Fetch siklus ──────────────────────────────────────────────────────────
  const fetchSikluses = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await apiFetch('/api/siklus')
      setSikluses(data ?? [])
    } catch (err: any) {
      setError(err.message ?? 'Gagal memuat data siklus')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSikluses() }, [])

  // ── Buka detail siklus ───────────────────────────────────────────────────
  const openDetail = async (siklus: Siklus) => {
    setSelectedSiklus(siklus)
    setLoadingDetail(true)
    try {
      const data = await apiFetch(`/api/siklus/${siklus.siklus_id}`)
      setPeriodes(data.periodes ?? [])
    } catch (err: any) {
      alert(err.message ?? 'Gagal memuat detail siklus')
    } finally {
      setLoadingDetail(false)
    }
  }

  // ── Toggle override periode ───────────────────────────────────────────────
  const handleToggleOverride = async (periode: Periode) => {
    try {
      await apiFetch(`/api/periode/${periode.periode_id}/override`, { method: 'PUT' })
      // Refresh periodes
      const data = await apiFetch(`/api/siklus/${selectedSiklus!.siklus_id}`)
      setPeriodes(data.periodes ?? [])
    } catch (err: any) {
      alert(err.message ?? 'Gagal mengubah periode aktif')
    }
  }

  // ── Create siklus ─────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.tanggal_mulai || !form.tanggal_selesai) {
      alert('Tanggal mulai dan selesai wajib diisi')
      return
    }
    if (form.tanggal_selesai <= form.tanggal_mulai) {
      alert('Tanggal selesai harus setelah tanggal mulai')
      return
    }
    const nama = form.nama_siklus.trim() || autoNamaSiklus(form.tanggal_mulai, form.tanggal_selesai)

    setSaving(true)
    try {
      await apiFetch('/api/siklus', {
        method: 'POST',
        body: JSON.stringify({ nama_siklus: nama, tanggal_mulai: form.tanggal_mulai, tanggal_selesai: form.tanggal_selesai })
      })
      await fetchSikluses()
      setShowCreateModal(false)
      setForm({ nama_siklus: '', tanggal_mulai: '', tanggal_selesai: '' })
    } catch (err: any) {
      alert(err.message ?? 'Gagal membuat siklus')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete siklus ─────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await apiFetch(`/api/siklus/${confirmDelete.siklus_id}`, { method: 'DELETE' })
      setConfirmDelete(null)
      await fetchSikluses()
    } catch (err: any) {
      alert(err.message ?? 'Gagal menghapus siklus')
    } finally {
      setDeleting(false)
    }
  }

  const today = getToday()

  // ── Render: Detail Siklus ─────────────────────────────────────────────────
  if (selectedSiklus) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <button onClick={() => setSelectedSiklus(null)} className="btn-cancel">
              ← Kembali
            </button>
            <div>
              <h1 className="page-title" style={{ margin: 0 }}>{selectedSiklus.nama_siklus}</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                {formatTanggal(selectedSiklus.tanggal_mulai)} – {formatTanggal(selectedSiklus.tanggal_selesai)}
              </p>
            </div>
          </div>

          {loadingDetail ? (
            <div className="loading-state">Memuat periode...</div>
          ) : isMobile ? (
            <div className="user-card-list">
              {periodes.map(p => {
                const isFuture = p.tanggal_mulai > today
                const isAktif  = p.is_aktif
                return (
                  <div key={p.periode_id} className="user-card" style={{ background: isAktif ? '#f0fdf4' : undefined }}>
                    <div className="user-card-left">
                      <div className="user-card-info">
                        <div className="user-card-name" style={{ color: isAktif ? '#16a34a' : isFuture ? '#94a3b8' : '#1e293b' }}>
                          {p.nama_periode}
                          {p.is_override && <span style={{ marginLeft: 6, fontSize: '0.7rem', color: '#f59e0b' }}>(override)</span>}
                        </div>
                        <div className="user-card-meta">
                          {isFuture ? (
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Belum dimulai</span>
                          ) : isAktif ? (
                            <span className="status-badge status-aktif" style={{ fontSize: '0.7rem' }}>🟢 Aktif</span>
                          ) : (
                            <span className="status-badge status-nonaktif" style={{ fontSize: '0.7rem' }}>⚫ Tidak Aktif</span>
                          )}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 2 }}>
                          {formatTanggal(p.tanggal_mulai)} – {formatTanggal(p.tanggal_selesai)}
                        </div>
                      </div>
                    </div>
                    <div className="user-card-right">
                      <div className="user-card-actions">
                        {isFuture ? (
                          <button className="btn-edit" disabled style={{ opacity: 0.4, cursor: 'not-allowed', padding: '5px 10px', fontSize: '0.78rem' }}>
                            Aktifkan
                          </button>
                        ) : isAktif ? (
                          <button onClick={() => handleToggleOverride(p)} className="btn-delete" style={{ padding: '5px 10px', fontSize: '0.78rem' }}>
                            Nonaktifkan
                          </button>
                        ) : (
                          <button onClick={() => handleToggleOverride(p)} className="btn-edit" style={{ padding: '5px 10px', fontSize: '0.78rem' }}>
                            Aktifkan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="table-container">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Periode</th>
                    <th>Tanggal Mulai</th>
                    <th>Tanggal Selesai</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {periodes.map((p, idx) => {
                    const isFuture  = p.tanggal_mulai > today
                    const isAktif   = p.is_aktif

                    return (
                      <tr key={p.periode_id} style={{ background: isAktif ? '#f0fdf4' : undefined }}>
                        <td>{idx + 1}</td>
                        <td>
                          <strong style={{ color: isAktif ? '#16a34a' : isFuture ? '#94a3b8' : '#1e293b' }}>
                            {p.nama_periode}
                          </strong>
                          {p.is_override && (
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#f59e0b' }}>
                              (override)
                            </span>
                          )}
                        </td>
                        <td style={{ color: isFuture ? '#94a3b8' : undefined }}>{formatTanggal(p.tanggal_mulai)}</td>
                        <td style={{ color: isFuture ? '#94a3b8' : undefined }}>{formatTanggal(p.tanggal_selesai)}</td>
                        <td>
                          {isFuture ? (
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Belum dimulai</span>
                          ) : isAktif ? (
                            <span className="status-badge status-aktif">🟢 Aktif</span>
                          ) : (
                            <span className="status-badge status-nonaktif">⚫ Tidak Aktif</span>
                          )}
                        </td>
                        <td>
                          {isFuture ? (
                            <button className="btn-edit" disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>
                              Aktifkan
                            </button>
                          ) : isAktif ? (
                            <button onClick={() => handleToggleOverride(p)} className="btn-delete">
                              Nonaktifkan
                            </button>
                          ) : (
                            <button onClick={() => handleToggleOverride(p)} className="btn-edit">
                              Aktifkan
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Render: List Siklus ───────────────────────────────────────────────────
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Konfigurasi Penilaian</h1>
          <button onClick={() => setShowCreateModal(true)} className="btn-add-user">
            <span>➕</span>
            <span>Buat Siklus</span>
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Memuat data siklus...</div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchSikluses} className="btn-edit">Coba Lagi</button>
          </div>
        ) : isMobile ? (
          <div className="user-card-list">
            {sikluses.length === 0 ? (
              <div className="no-data" style={{ background: 'white', borderRadius: 12, padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                <p>Belum ada siklus penilaian</p>
              </div>
            ) : sikluses.map(s => {
              const cfg = STATUS_CONFIG[s.status_display] ?? STATUS_CONFIG.nonaktif
              return (
                <div key={s.siklus_id} className="user-card">
                  <div className="user-card-left">
                    <div className="user-card-info">
                      <div className="user-card-name">{s.nama_siklus}</div>
                      <div className="user-card-meta">
                        <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 600, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                        <span className="user-card-hp">{s.jumlah_periode} bulan</span>
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 2 }}>
                        {formatTanggal(s.tanggal_mulai)} – {formatTanggal(s.tanggal_selesai)}
                      </div>
                    </div>
                  </div>
                  <div className="user-card-right">
                    <div className="user-card-actions">
                      <button onClick={() => openDetail(s)} className="btn-edit" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: '0.78rem' }}>
                        📋 Detail
                      </button>
                      {s.status_display === 'belum_dimulai' && (
                        <button onClick={() => setConfirmDelete(s)} className="btn-delete" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: '0.78rem' }}>
                          🗑️ Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>#</th><th>Nama Siklus</th><th>Mulai</th>
                  <th>Selesai</th><th>Periode</th><th>Status</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sikluses.map((s, idx) => {
                  const cfg = STATUS_CONFIG[s.status_display] ?? STATUS_CONFIG.nonaktif
                  return (
                    <tr key={s.siklus_id}>
                      <td>{idx + 1}</td>
                      <td><strong style={{ color: '#031e65' }}>{s.nama_siklus}</strong></td>
                      <td>{formatTanggal(s.tanggal_mulai)}</td>
                      <td>{formatTanggal(s.tanggal_selesai)}</td>
                      <td style={{ textAlign: 'center' }}>{s.jumlah_periode} bulan</td>
                      <td>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600, color: cfg.color, background: cfg.bg }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button onClick={() => openDetail(s)} className="btn-edit">📋 Detail</button>
                        {s.status_display === 'belum_dimulai' && (
                          <button onClick={() => setConfirmDelete(s)} className="btn-delete">🗑️ Hapus</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {sikluses.length === 0 && <div className="no-data"><p>Belum ada siklus penilaian</p></div>}
          </div>
        )}

        {/* ── Confirm Delete Modal ── */}
        {confirmDelete && (
          <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
            <div className="confirm-modal" onClick={e => e.stopPropagation()}>
              <div className="confirm-modal-icon">🗑️</div>
              <h3 className="confirm-modal-title">Hapus Siklus?</h3>
              <p className="confirm-modal-desc">
                Siklus <strong>{confirmDelete.nama_siklus}</strong> beserta semua periode dan bobot di dalamnya akan dihapus permanen. Data tidak dapat dikembalikan.
              </p>
              <div className="confirm-modal-actions">
                <button className="btn btn-outline" onClick={() => setConfirmDelete(null)} disabled={deleting}>
                  Batal
                </button>
                <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Create Siklus Modal ── */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Buat Siklus Baru</h2>
                <button onClick={() => setShowCreateModal(false)} className="modal-close">✖️</button>
              </div>

              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tanggal Mulai <span className="required">*</span></label>
                    <input
                      type="date"
                      value={form.tanggal_mulai}
                      onChange={e => setForm({ ...form, tanggal_mulai: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tanggal Selesai <span className="required">*</span></label>
                    <input
                      type="date"
                      value={form.tanggal_selesai}
                      onChange={e => setForm({ ...form, tanggal_selesai: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Siklus</label>
                  <input
                    type="text"
                    value={form.nama_siklus}
                    onChange={e => setForm({ ...form, nama_siklus: e.target.value })}
                    placeholder={autoNamaSiklus(form.tanggal_mulai, form.tanggal_selesai) || 'Otomatis dari tanggal'}
                    className="form-input"
                  />
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    Kosongkan untuk menggunakan nama otomatis
                  </p>
                </div>

                {form.tanggal_mulai && form.tanggal_selesai && form.tanggal_selesai > form.tanggal_mulai && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem', fontSize: '0.85rem', color: '#16a34a' }}>
                    ✅ Akan membuat periode bulanan dari <strong>{formatTanggal(form.tanggal_mulai)}</strong> hingga <strong>{formatTanggal(form.tanggal_selesai)}</strong>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button onClick={() => setShowCreateModal(false)} className="btn-cancel">Batal</button>
                <button onClick={handleCreate} disabled={saving} className="btn-save">
                  {saving ? 'Membuat...' : 'Buat Siklus'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
