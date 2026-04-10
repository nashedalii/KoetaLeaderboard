'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/utils/api'

// ── Types ──────────────────────────────────────────────────────────────
interface UserData {
  id: number
  nama: string
  identifier: string   // nomor_pegawai (admin/petugas) atau username (driver)
  email: string
  status_aktif: 'aktif' | 'nonaktif'
  role: 'admin' | 'petugas' | 'driver'
  // driver only
  nama_kernet?: string
  armada_id?: number
  kode_armada?: string
  nama_armada?: string
  bus_id?: number
  kode_bus?: string
  nopol?: string
  bus_status?: 'aktif' | 'nonaktif'
}

interface BusOption {
  bus_id: number
  kode_bus: string
  nopol: string
  status_aktif: 'aktif' | 'nonaktif'
  driver_id: number | null
}

interface FormData {
  nama: string
  identifier: string
  email: string
  status_aktif: 'aktif' | 'nonaktif'
  nama_kernet: string
  armada_id: string
  bus_id: string
}

interface AddFormData {
  role: 'admin' | 'petugas' | 'driver'
  nama: string
  nomor_pegawai: string
  username: string
  email: string
  armada_id: string
  nama_kernet: string
  bus_id: string
}

const EMPTY_ADD_FORM: AddFormData = {
  role: 'admin',
  nama: '',
  nomor_pegawai: '',
  username: '',
  email: '',
  armada_id: '',
  nama_kernet: '',
  bus_id: '',
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  petugas: 'Petugas',
  driver: 'Supir'
}

const ROLE_ICON: Record<string, string> = {
  admin: '👑',
  petugas: '🧾',
  driver: '🚌'
}

const ARMADA_OPTIONS = [
  { value: '1', label: 'Armada A' },
  { value: '2', label: 'Armada B' },
  { value: '3', label: 'Armada C' },
]

// ── Component ──────────────────────────────────────────────────────────
export default function KelolaUser() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [passwordModalTitle, setPasswordModalTitle] = useState('Password Berhasil Direset')
  const [saving, setSaving] = useState(false)
  const [busOptions, setBusOptions] = useState<BusOption[]>([])

  const [addFormData, setAddFormData] = useState<AddFormData>(EMPTY_ADD_FORM)
  const [addBusOptions, setAddBusOptions] = useState<BusOption[]>([])

  const [formData, setFormData] = useState<FormData>({
    nama: '',
    identifier: '',
    email: '',
    status_aktif: 'aktif',
    nama_kernet: '',
    armada_id: '',
    bus_id: '',
  })

  // ── Fetch users ──────────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await apiFetch('/api/users')
      setUsers(data ?? [])
    } catch (err: any) {
      setError(err.message ?? 'Gagal memuat data user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  // ── Filter ───────────────────────────────────────────────────────────
  const filtered = users.filter(u => {
    const matchSearch =
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchRole = roleFilter === 'All' || u.role === roleFilter.toLowerCase()
    return matchSearch && matchRole
  })

  // ── Edit ─────────────────────────────────────────────────────────────
  const openEdit = async (user: UserData) => {
    setSelectedUser(user)
    setFormData({
      nama: user.nama,
      identifier: user.identifier,
      email: user.email,
      status_aktif: user.status_aktif,
      nama_kernet: user.nama_kernet ?? '',
      armada_id: user.armada_id?.toString() ?? '',
      bus_id: user.bus_id?.toString() ?? '',
    })

    if (user.role === 'driver' && user.armada_id) {
      try {
        const buses = await apiFetch(`/api/bus?armada_id=${user.armada_id}`)
        setBusOptions(buses ?? [])
      } catch {
        setBusOptions([])
      }
    }

    setShowModal(true)
  }

  const handleSave = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      const body: Record<string, any> = {
        nama: formData.nama,
        identifier: formData.identifier,
        email: formData.email,
        status_aktif: formData.status_aktif,
      }

      if (selectedUser.role !== 'admin') {
        body.armada_id = parseInt(formData.armada_id)
      }
      if (selectedUser.role === 'driver') {
        body.nama_kernet = formData.nama_kernet
        body.bus_id = formData.bus_id ? parseInt(formData.bus_id) : null
      }

      await apiFetch(`/api/users/${selectedUser.role}/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })

      await fetchUsers()
      setShowModal(false)
    } catch (err: any) {
      alert(err.message ?? 'Gagal menyimpan perubahan')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────
  const openDelete = (user: UserData) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      await apiFetch(`/api/users/${selectedUser.role}/${selectedUser.id}`, {
        method: 'DELETE',
      })
      await fetchUsers()
      setShowDeleteModal(false)
    } catch (err: any) {
      alert(err.message ?? 'Gagal menghapus user')
    } finally {
      setSaving(false)
    }
  }

  // ── Reset Password ───────────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      const data = await apiFetch(
        `/api/users/${selectedUser.role}/${selectedUser.id}/reset-password`,
        { method: 'PUT' }
      )
      setNewPassword(data.password_baru)
      setPasswordModalTitle('Password Berhasil Direset')
      setShowModal(false)
      setShowResetModal(true)
    } catch (err: any) {
      alert(err.message ?? 'Gagal mereset password')
    } finally {
      setSaving(false)
    }
  }

  // ── Add ──────────────────────────────────────────────────────────────
  const openAdd = () => {
    setAddFormData(EMPTY_ADD_FORM)
    setAddBusOptions([])
    setShowAddModal(true)
  }

  const handleAdd = async () => {
    const { role, nama, nomor_pegawai, username, email, armada_id, nama_kernet, bus_id } = addFormData

    if (!nama || !username || !email) {
      alert('Nama, username, dan email wajib diisi')
      return
    }
    if (role !== 'driver' && !nomor_pegawai) {
      alert('Nomor pegawai wajib diisi')
      return
    }
    if (role !== 'admin' && !armada_id) {
      alert('Armada wajib diisi')
      return
    }

    setSaving(true)
    try {
      let body: Record<string, any>
      let endpoint: string

      if (role === 'admin') {
        body = { nama_admin: nama, nomor_pegawai, username, email }
        endpoint = '/api/users/admin'
      } else if (role === 'petugas') {
        body = { nama_petugas: nama, nomor_pegawai, username, email, armada_id: parseInt(armada_id) }
        endpoint = '/api/users/petugas'
      } else {
        body = { nama_driver: nama, nama_kernet: nama_kernet || null, username, email, armada_id: parseInt(armada_id) }
        endpoint = '/api/users/driver'
      }

      const result = await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) })

      // Assign bus jika driver dan bus dipilih
      if (role === 'driver' && bus_id && result?.user?.id) {
        try {
          await apiFetch(`/api/users/driver/${result.user.id}`, {
            method: 'PUT',
            body: JSON.stringify({ bus_id: parseInt(bus_id) }),
          })
        } catch {
          // bus assignment gagal, tidak kritis
        }
      }

      await fetchUsers()
      setSelectedUser({ id: result.user.id, nama: result.user.nama ?? nama, identifier: '', email, status_aktif: 'aktif', role })
      setNewPassword(result.password_awal)
      setPasswordModalTitle('User Berhasil Dibuat')
      setShowAddModal(false)
      setShowResetModal(true)
    } catch (err: any) {
      alert(err.message ?? 'Gagal menambahkan user')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="page-title">Kelola User</h1>

        {/* Search & Filter */}
        <div className="table-controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="role-filter"
          >
            <option value="All">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="petugas">Petugas</option>
            <option value="driver">Supir</option>
          </select>

          <button onClick={openAdd} className="btn-add-user">
            <span>➕</span>
            <span>Tambah User</span>
          </button>
        </div>

        {/* State: loading / error / table */}
        {loading ? (
          <div className="loading-state">Memuat data...</div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchUsers} className="btn-edit">Coba Lagi</button>
          </div>
        ) : (
          <div className="table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Bus / Armada</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => (
                  <tr key={`${user.role}-${user.id}`}>
                    <td>{idx + 1}</td>
                    <td className="user-name">
                      <span className="role-icon">{ROLE_ICON[user.role]}</span>
                      {user.nama}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {ROLE_LABEL[user.role]}
                      </span>
                    </td>
                    <td>
                      {user.role === 'driver' && user.status_aktif === 'nonaktif' ? (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      ) : user.role === 'driver' && user.kode_bus ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {user.bus_status === 'nonaktif' ? (
                            <span style={{ fontWeight: 600, color: '#ef4444', fontSize: '0.85rem' }}>
                              ⚠️ Bus telah dinonaktifkan
                            </span>
                          ) : (
                            <span style={{ fontWeight: 600, color: '#667eea' }}>
                              {user.kode_bus} - {user.nopol}
                            </span>
                          )}
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            {user.nama_armada}
                          </span>
                        </div>
                      ) : user.role !== 'admin' && user.nama_armada ? (
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          {user.nama_armada}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${user.status_aktif}`}>
                        {user.status_aktif === 'aktif' ? '🟢 Aktif' : '🔴 Nonaktif'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button onClick={() => openEdit(user)} className="btn-edit">
                        ✏️ Edit
                      </button>
                      <button onClick={() => openDelete(user)} className="btn-delete">
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="no-data"><p>Tidak ada data user yang ditemukan</p></div>
            )}
          </div>
        )}

        {/* ── Edit Modal ── */}
        {showModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit User — {ROLE_LABEL[selectedUser.role]}</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">✖️</button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Lengkap <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={e => setFormData({ ...formData, nama: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {selectedUser.role === 'driver' ? 'Username' : 'Nomor Pegawai'}
                  </label>
                  <input
                    type="text"
                    value={formData.identifier}
                    onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-row">
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

                  {selectedUser.role !== 'admin' && (
                    <div className="form-group">
                      <label className="form-label">Armada</label>
                      <select
                        value={formData.armada_id}
                        onChange={async e => {
                          const newArmadaId = e.target.value
                          setFormData({ ...formData, armada_id: newArmadaId, bus_id: '' })
                          if (selectedUser.role === 'driver' && newArmadaId) {
                            try {
                              const buses = await apiFetch(`/api/bus?armada_id=${newArmadaId}`)
                              setBusOptions(buses ?? [])
                            } catch {
                              setBusOptions([])
                            }
                          }
                        }}
                        className="form-select"
                      >
                        <option value="">Pilih Armada</option>
                        {ARMADA_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {selectedUser.role === 'driver' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Nama Kernet (Opsional)</label>
                      <input
                        type="text"
                        value={formData.nama_kernet}
                        onChange={e => setFormData({ ...formData, nama_kernet: e.target.value })}
                        placeholder="Kosongkan jika tidak ada kernet"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Bus</label>
                      {formData.status_aktif === 'nonaktif' ? (
                        <div className="form-input" style={{ color: '#94a3b8', background: '#f8fafc', cursor: 'not-allowed' }}>
                          — (driver nonaktif)
                        </div>
                      ) : (
                        <select
                          value={formData.bus_id}
                          onChange={e => setFormData({ ...formData, bus_id: e.target.value })}
                          className="form-select"
                        >
                          <option value="">— Tanpa Bus —</option>
                          {busOptions.map(bus => {
                            const isOwn = bus.bus_id === selectedUser.bus_id
                            const isTaken = bus.driver_id !== null && bus.driver_id !== selectedUser.id
                            const isNonaktif = bus.status_aktif === 'nonaktif'
                            const isDisabled = isTaken || isNonaktif

                            let prefix = ''
                            if (isDisabled) prefix = '🔴 '
                            else if (isOwn) prefix = '🟢 '

                            let suffix = ''
                            if (isOwn && isNonaktif) suffix = ' (Bus Anda - Nonaktif)'
                            else if (isTaken) suffix = ' (Terpakai)'
                            else if (isNonaktif) suffix = ' (Nonaktif)'

                            return (
                              <option
                                key={bus.bus_id}
                                value={bus.bus_id.toString()}
                                disabled={isDisabled}
                                style={{
                                  color: isOwn ? '#16a34a' : isDisabled ? '#ef4444' : '#1e293b',
                                  fontWeight: isOwn ? 600 : 400,
                                }}
                              >
                                {prefix}{bus.kode_bus} - {bus.nopol}{suffix}
                              </option>
                            )
                          })}
                        </select>
                      )}
                    </div>
                  </>
                )}

                {/* Reset Password */}
                <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '1rem', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={saving}
                    className="btn-delete"
                    style={{ width: '100%' }}
                  >
                    🔑 Reset Password
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={() => setShowModal(false)} className="btn-cancel">Batal</button>
                <button onClick={handleSave} disabled={saving} className="btn-save">
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Add Modal ── */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Tambah User Baru</h2>
                <button onClick={() => setShowAddModal(false)} className="modal-close">✖️</button>
              </div>

              <div className="modal-body">
                {/* Role selector */}
                <div className="form-group">
                  <label className="form-label">Role <span className="required">*</span></label>
                  <select
                    value={addFormData.role}
                    onChange={e => setAddFormData({ ...EMPTY_ADD_FORM, role: e.target.value as any })}
                    className="form-select"
                  >
                    <option value="admin">Admin</option>
                    <option value="petugas">Petugas</option>
                    <option value="driver">Supir</option>
                  </select>
                </div>

                {/* Nama */}
                <div className="form-group">
                  <label className="form-label">Nama Lengkap <span className="required">*</span></label>
                  <input
                    type="text"
                    value={addFormData.nama}
                    onChange={e => setAddFormData({ ...addFormData, nama: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    className="form-input"
                  />
                </div>

                {/* Nomor Pegawai — admin & petugas only */}
                {addFormData.role !== 'driver' && (
                  <div className="form-group">
                    <label className="form-label">Nomor Pegawai <span className="required">*</span></label>
                    <input
                      type="text"
                      value={addFormData.nomor_pegawai}
                      onChange={e => setAddFormData({ ...addFormData, nomor_pegawai: e.target.value })}
                      placeholder="Contoh: NIP-001"
                      className="form-input"
                    />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Username <span className="required">*</span></label>
                    <input
                      type="text"
                      value={addFormData.username}
                      onChange={e => setAddFormData({ ...addFormData, username: e.target.value })}
                      placeholder="Username login"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email <span className="required">*</span></label>
                    <input
                      type="email"
                      value={addFormData.email}
                      onChange={e => setAddFormData({ ...addFormData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Armada — petugas & driver */}
                {addFormData.role !== 'admin' && (
                  <div className="form-group">
                    <label className="form-label">Armada <span className="required">*</span></label>
                    <select
                      value={addFormData.armada_id}
                      onChange={async e => {
                        const newArmadaId = e.target.value
                        setAddFormData({ ...addFormData, armada_id: newArmadaId, bus_id: '' })
                        if (addFormData.role === 'driver' && newArmadaId) {
                          try {
                            const buses = await apiFetch(`/api/bus?armada_id=${newArmadaId}`)
                            setAddBusOptions(buses ?? [])
                          } catch {
                            setAddBusOptions([])
                          }
                        }
                      }}
                      className="form-select"
                    >
                      <option value="">Pilih Armada</option>
                      {ARMADA_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Driver-only fields */}
                {addFormData.role === 'driver' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Nama Kernet (Opsional)</label>
                      <input
                        type="text"
                        value={addFormData.nama_kernet}
                        onChange={e => setAddFormData({ ...addFormData, nama_kernet: e.target.value })}
                        placeholder="Kosongkan jika tidak ada kernet"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Bus</label>
                      <select
                        value={addFormData.bus_id}
                        onChange={e => setAddFormData({ ...addFormData, bus_id: e.target.value })}
                        className="form-select"
                        disabled={!addFormData.armada_id}
                      >
                        <option value="">— Tanpa Bus —</option>
                        {addBusOptions.map(bus => {
                          const isTaken = bus.driver_id !== null
                          const isNonaktif = bus.status_aktif === 'nonaktif'
                          const isDisabled = isTaken || isNonaktif

                          const prefix = isDisabled ? '🔴 ' : ''
                          let suffix = ''
                          if (isTaken) suffix = ' (Terpakai)'
                          else if (isNonaktif) suffix = ' (Nonaktif)'

                          return (
                            <option
                              key={bus.bus_id}
                              value={bus.bus_id.toString()}
                              disabled={isDisabled}
                              style={{ color: isDisabled ? '#ef4444' : '#1e293b' }}
                            >
                              {prefix}{bus.kode_bus} - {bus.nopol}{suffix}
                            </option>
                          )
                        })}
                      </select>
                      {!addFormData.armada_id && (
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                          Pilih armada terlebih dahulu
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button onClick={() => setShowAddModal(false)} className="btn-cancel">Batal</button>
                <button onClick={handleAdd} disabled={saving} className="btn-save">
                  {saving ? 'Menyimpan...' : 'Tambah User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Modal ── */}
        {showDeleteModal && selectedUser && (
          <div className="modal-overlay delete-modal" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="delete-icon">⚠️</div>
              <h2 className="modal-title">Konfirmasi Hapus User</h2>
              <p className="delete-message">Apakah Anda yakin ingin menghapus user ini?</p>
              <div className="delete-user-info">
                <div className="delete-user-name">{selectedUser.nama}</div>
                <div className="delete-user-role">
                  {selectedUser.email} • {ROLE_LABEL[selectedUser.role]}
                </div>
              </div>
              <div className="form-actions">
                <button onClick={() => setShowDeleteModal(false)} className="btn-cancel">Batal</button>
                <button onClick={confirmDelete} disabled={saving} className="btn-confirm-delete">
                  {saving ? 'Menghapus...' : 'Ya, Hapus User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Reset Password Result Modal ── */}
        {showResetModal && (
          <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{passwordModalTitle}</h2>
                <button onClick={() => setShowResetModal(false)} className="modal-close">✖️</button>
              </div>
              <div className="modal-body">
                <p style={{ marginBottom: '0.75rem', color: '#64748b' }}>
                  Password baru untuk <strong>{selectedUser?.nama}</strong>:
                </p>
                <div style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: '#1e293b'
                }}>
                  {newPassword}
                </div>
                <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#ef4444' }}>
                  ⚠️ Catat password ini. Password tidak bisa dilihat lagi setelah modal ditutup.
                </p>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowResetModal(false)} className="btn-save">
                  Sudah Dicatat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
