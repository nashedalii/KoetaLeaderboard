'use client'

import { useState } from 'react'
import { dummyUsers, User } from '@/data/dummyUsers'

export default function KelolaUser() {
  const [users, setUsers] = useState<User[]>(dummyUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('All')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    role: 'Supir' as 'Admin' | 'Petugas' | 'Supir',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
    password: '',
    namaKernet: '',
    namaArmada: '' as '' | 'A' | 'B' | 'C',
    kodeBus: '',
    nomorPolisi: ''
  })

  // Filter dan Search
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'All' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Handle Add User
  const handleAddUser = () => {
    setModalMode('add')
    setFormData({
      nama: '',
      email: '',
      role: 'Supir',
      status: 'Aktif',
      password: '',
      namaKernet: '',
      namaArmada: '',
      kodeBus: '',
      nomorPolisi: ''
    })
    setShowModal(true)
  }

  // Handle Edit User
  const handleEditUser = (user: User) => {
    setModalMode('edit')
    setSelectedUser(user)
    setFormData({
      nama: user.nama,
      email: user.email,
      role: user.role,
      status: user.status,
      password: '',
      namaKernet: user.namaKernet || '',
      namaArmada: user.namaArmada || '',
      kodeBus: user.kodeBus || '',
      nomorPolisi: user.nomorPolisi || ''
    })
    setShowModal(true)
  }

  // Handle Delete User
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  // Confirm Delete
  const confirmDelete = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id))
      setShowDeleteModal(false)
      setSelectedUser(null)
    }
  }

  // Handle Save (Add/Edit)
  const handleSave = () => {
    if (!formData.nama || !formData.email) {
      alert('Nama dan Email harus diisi!')
      return
    }

    if (modalMode === 'add') {
      if (!formData.password) {
        alert('Password harus diisi untuk user baru!')
        return
      }
      
      const newUser: User = {
        id: Math.max(...users.map(u => u.id)) + 1,
        nama: formData.nama,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        password: formData.password,
        ...(formData.role === 'Supir' && {
          namaKernet: formData.namaKernet || undefined,
          namaArmada: (formData.namaArmada || undefined) as 'A' | 'B' | 'C' | undefined,
          kodeBus: formData.kodeBus || undefined,
          nomorPolisi: formData.nomorPolisi || undefined,
          skor: {
            etikaAdab: 0,
            disiplin: 0,
            loyalitas: 0,
            skillMengemudi: 0,
            perawatanKendaraan: 0,
            performa: 0
          }
        })
      }
      setUsers([...users, newUser])
    } else {
      // Edit mode
      setUsers(users.map(u => 
        u.id === selectedUser?.id 
          ? {
              ...u,
              nama: formData.nama,
              email: formData.email,
              role: formData.role,
              status: formData.status,
              ...(formData.password && { password: formData.password }),
              ...(formData.role === 'Supir' && {
                namaKernet: formData.namaKernet || undefined,
                namaArmada: (formData.namaArmada || undefined) as 'A' | 'B' | 'C' | undefined,
                kodeBus: formData.kodeBus || undefined,
                nomorPolisi: formData.nomorPolisi || undefined
              })
            }
          : u
      ))
    }
    
    setShowModal(false)
    setSelectedUser(null)
  }

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return '👑'
      case 'Petugas':
        return '🧾'
      case 'Supir':
        return '🚌'
      default:
        return '👤'
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="page-title">Kelola User</h1>

        {/* Search & Filter Bar */}
        <div className="table-controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="role-filter"
          >
            <option value="All">Semua Role</option>
            <option value="Admin">Admin</option>
            <option value="Petugas">Petugas</option>
            <option value="Supir">Supir</option>
          </select>

          <button onClick={handleAddUser} className="btn-add-user">
            <span>➕</span>
            <span>Tambah User</span>
          </button>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Bus/Armada</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td className="user-name">
                    <span className="role-icon">{getRoleIcon(user.role)}</span>
                    {user.nama}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.role === 'Supir' && user.kodeBus ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: '600', color: '#667eea' }}>
                          {user.kodeBus} - {user.nomorPolisi}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          Armada {user.namaArmada}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>-</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${user.status.toLowerCase()}`}>
                      {user.status === 'Aktif' ? '🟢' : '🔴'} {user.status}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="btn-edit"
                      title="Edit User"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user)}
                      className="btn-delete"
                      title="Delete User"
                    >
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="no-data">
              <p>Tidak ada data user yang ditemukan</p>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{modalMode === 'add' ? 'Tambah User Baru' : 'Edit User'}</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">
                  ✖️
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Lengkap <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    placeholder="Masukkan nama lengkap"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email <span className="required">*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="example@dishub.aceh.go.id"
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Role <span className="required">*</span></label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                      className="form-select"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Petugas">Petugas</option>
                      <option value="Supir">Supir</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status <span className="required">*</span></label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="form-select"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password {modalMode === 'add' && <span className="required">*</span>}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={modalMode === 'edit' ? 'Kosongkan jika tidak ingin mengubah' : 'Masukkan password'}
                    className="form-input"
                  />
                </div>

                {/* Khusus untuk Supir */}
                {formData.role === 'Supir' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Kode Bus</label>
                        <input
                          type="text"
                          value={formData.kodeBus}
                          onChange={(e) => setFormData({...formData, kodeBus: e.target.value})}
                          placeholder="Contoh: TR 01"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Nomor Polisi</label>
                        <input
                          type="text"
                          value={formData.nomorPolisi}
                          onChange={(e) => setFormData({...formData, nomorPolisi: e.target.value})}
                          placeholder="Contoh: BL 1234 AB"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Nama Kernet (Opsional)</label>
                        <input
                          type="text"
                          value={formData.namaKernet}
                          onChange={(e) => setFormData({...formData, namaKernet: e.target.value})}
                          placeholder="Kosongkan jika tidak ada kernet"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Armada</label>
                        <select
                          value={formData.namaArmada}
                          onChange={(e) => setFormData({...formData, namaArmada: e.target.value as any})}
                          className="form-select"
                        >
                          <option value="">Pilih Armada</option>
                          <option value="A">Armada A</option>
                          <option value="B">Armada B</option>
                          <option value="C">Armada C</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button onClick={() => setShowModal(false)} className="btn-cancel">
                  Batal
                </button>
                <button onClick={handleSave} className="btn-save">
                  {modalMode === 'add' ? 'Tambah User' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="modal-overlay delete-modal" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="delete-icon">⚠️</div>
              
              <h2 className="modal-title">Konfirmasi Hapus User</h2>
              
              <p className="delete-message">
                Apakah Anda yakin ingin menghapus user ini?
              </p>

              <div className="delete-user-info">
                <div className="delete-user-name">{selectedUser.nama}</div>
                <div className="delete-user-role">{selectedUser.email} • {selectedUser.role}</div>
              </div>

              <div className="form-actions">
                <button onClick={() => setShowDeleteModal(false)} className="btn-cancel">
                  Batal
                </button>
                <button onClick={confirmDelete} className="btn-confirm-delete">
                  Ya, Hapus User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
