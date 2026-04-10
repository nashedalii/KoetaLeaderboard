'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/utils/api'

interface BusData {
  bus_id: number
  kode_bus: string
  nopol: string
  status_aktif: 'aktif' | 'nonaktif'
  driver_id: number | null
  armada_id: number | null
  kode_armada: string | null
  nama_armada: string | null
  nama_driver: string | null
}

interface FormData {
  kode_bus: string
  nopol: string
  armada_id: string
  status_aktif: 'aktif' | 'nonaktif'
}

const ARMADA_OPTIONS = [
  { value: '1', label: 'Armada A' },
  { value: '2', label: 'Armada B' },
  { value: '3', label: 'Armada C' },
]

const EMPTY_FORM: FormData = {
  kode_bus: '',
  nopol: '',
  armada_id: '',
  status_aktif: 'aktif'
}

export default function KelolaBus() {
  const [buses, setBuses] = useState<BusData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [armadaFilter, setArmadaFilter] = useState('All')

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // ── Fetch ────────────────────────────────────────────────────────────
  const fetchBuses = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await apiFetch('/api/bus')
      setBuses(data ?? [])
    } catch (err: any) {
      setError(err.message ?? 'Gagal memuat data bus')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBuses() }, [])

  // ── Filter ───────────────────────────────────────────────────────────
  const filtered = buses.filter(b => {
    const matchSearch =
      b.kode_bus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.nopol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.nama_driver ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchArmada = armadaFilter === 'All' || b.kode_armada === armadaFilter
    return matchSearch && matchArmada
  })

  // ── Add ──────────────────────────────────────────────────────────────
  const openAdd = () => {
    setModalMode('add')
    setFormData(EMPTY_FORM)
    setSelectedBus(null)
    setShowModal(true)
  }

  // ── Edit ─────────────────────────────────────────────────────────────
  const openEdit = (bus: BusData) => {
    setModalMode('edit')
    setSelectedBus(bus)
    setFormData({
      kode_bus: bus.kode_bus,
      nopol: bus.nopol,
      armada_id: bus.armada_id?.toString() ?? '',
      status_aktif: bus.status_aktif
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.kode_bus || !formData.nopol || !formData.armada_id) {
      alert('Kode bus, nopol, dan armada wajib diisi')
      return
    }
    setSaving(true)
    try {
      const body = {
        kode_bus: formData.kode_bus,
        nopol: formData.nopol,
        armada_id: parseInt(formData.armada_id),
        status_aktif: formData.status_aktif
      }

      if (modalMode === 'add') {
        await apiFetch('/api/bus', { method: 'POST', body: JSON.stringify(body) })
      } else if (selectedBus) {
        await apiFetch(`/api/bus/${selectedBus.bus_id}`, { method: 'PUT', body: JSON.stringify(body) })
      }

      await fetchBuses()
      setShowModal(false)
    } catch (err: any) {
      alert(err.message ?? 'Gagal menyimpan data bus')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────
  const openDelete = (bus: BusData) => {
    setSelectedBus(bus)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedBus) return
    setSaving(true)
    try {
      await apiFetch(`/api/bus/${selectedBus.bus_id}`, { method: 'DELETE' })
      await fetchBuses()
      setShowDeleteModal(false)
    } catch (err: any) {
      alert(err.message ?? 'Gagal menghapus bus')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="page-title">Kelola Bus</h1>

        {/* Controls */}
        <div className="table-controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari kode bus, nopol, atau driver..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={armadaFilter}
            onChange={e => setArmadaFilter(e.target.value)}
            className="role-filter"
          >
            <option value="All">Semua Armada</option>
            <option value="A">Armada A</option>
            <option value="B">Armada B</option>
            <option value="C">Armada C</option>
          </select>

          <button onClick={openAdd} className="btn-add-user">
            <span>➕</span>
            <span>Tambah Bus</span>
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-state">Memuat data bus...</div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchBuses} className="btn-edit">Coba Lagi</button>
          </div>
        ) : (
          <div className="table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Kode Bus</th>
                  <th>Nomor Polisi</th>
                  <th>Armada</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bus, idx) => (
                  <tr key={bus.bus_id}>
                    <td>{idx + 1}</td>
                    <td><strong style={{ color: '#667eea' }}>{bus.kode_bus}</strong></td>
                    <td>{bus.nopol}</td>
                    <td>
                      {bus.nama_armada ? (
                        <span className="role-badge role-petugas">{bus.nama_armada}</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>
                    <td>
                      {bus.nama_driver ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          🚌 {bus.nama_driver}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Belum ada driver</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${bus.status_aktif}`}>
                        {bus.status_aktif === 'aktif' ? '🟢 Aktif' : '🔴 Nonaktif'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button onClick={() => openEdit(bus)} className="btn-edit">✏️ Edit</button>
                      <button onClick={() => openDelete(bus)} className="btn-delete">🗑️ Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="no-data"><p>Tidak ada data bus yang ditemukan</p></div>
            )}
          </div>
        )}

        {/* ── Add / Edit Modal ── */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{modalMode === 'add' ? 'Tambah Bus Baru' : 'Edit Bus'}</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">✖️</button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Kode Bus <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.kode_bus}
                    onChange={e => setFormData({ ...formData, kode_bus: e.target.value })}
                    placeholder="Contoh: TR 01"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor Polisi <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.nopol}
                    onChange={e => setFormData({ ...formData, nopol: e.target.value })}
                    placeholder="Contoh: BL 1234 AB"
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Armada <span className="required">*</span></label>
                    <select
                      value={formData.armada_id}
                      onChange={e => setFormData({ ...formData, armada_id: e.target.value })}
                      className="form-select"
                    >
                      <option value="">Pilih Armada</option>
                      {ARMADA_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={formData.status_aktif}
                      onChange={e => setFormData({ ...formData, status_aktif: e.target.value as any })}
                      className="form-select"
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={() => setShowModal(false)} className="btn-cancel">Batal</button>
                <button onClick={handleSave} disabled={saving} className="btn-save">
                  {saving ? 'Menyimpan...' : modalMode === 'add' ? 'Tambah Bus' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Modal ── */}
        {showDeleteModal && selectedBus && (
          <div className="modal-overlay delete-modal" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="delete-icon">⚠️</div>
              <h2 className="modal-title">Konfirmasi Hapus Bus</h2>
              <p className="delete-message">Apakah Anda yakin ingin menghapus bus ini?</p>
              <div className="delete-user-info">
                <div className="delete-user-name">{selectedBus.kode_bus}</div>
                <div className="delete-user-role">{selectedBus.nopol} • {selectedBus.nama_armada}</div>
              </div>
              {selectedBus.driver_id && (
                <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', margin: '0.5rem 0' }}>
                  ⚠️ Bus ini masih digunakan oleh {selectedBus.nama_driver}
                </p>
              )}
              <div className="form-actions">
                <button onClick={() => setShowDeleteModal(false)} className="btn-cancel">Batal</button>
                <button onClick={confirmDelete} disabled={saving || !!selectedBus.driver_id} className="btn-confirm-delete">
                  {saving ? 'Menghapus...' : 'Ya, Hapus Bus'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
