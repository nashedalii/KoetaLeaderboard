'use client'

import { useMemo, useState } from 'react'
import { dummyUsers, User } from '@/data/dummyUsers'
import { useDataContext } from '@/contexts/DataContext'

const bobotPenilaian = {
  etikaAdab: 25,
  disiplin: 20,
  loyalitas: 20,
  skillMengemudi: 15,
  perawatanKendaraan: 10,
  performa: 10
}

interface PendingValidation {
  driver: User
  bulan: string
  petugas: User
  skor: {
    etikaAdab: number
    disiplin: number
    loyalitas: number
    skillMengemudi: number
    perawatanKendaraan: number
    performa: number
  }
  totalSkor: number
  statusValidasi: 'pending' | 'approved' | 'rejected'
  catatanPetugas?: string
  buktiFiles?: string[]
  catatanAdmin?: string
}

export default function ValidasiDataPetugas() {
  const { pendingValidations, approvePendingValidation, rejectPendingValidation } = useDataContext()
  const [selectedArmada, setSelectedArmada] = useState<'all' | 'A' | 'B' | 'C'>('all')
  const [selectedValidation, setSelectedValidation] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [forceRefresh, setForceRefresh] = useState(0)

  // Debug: Log pending validations
  console.log('All pending validations:', pendingValidations)
  console.log('ForceRefresh count:', forceRefresh)
  
  // Force reload from localStorage
  const handleRefresh = () => {
    console.log('Manual refresh triggered')
    const savedData = localStorage.getItem('pendingValidations')
    console.log('localStorage data on refresh:', savedData)
    setForceRefresh(prev => prev + 1)
    window.location.reload() // Force full page reload
  }

  // Filter validations based on armada and search
  const filteredValidations = useMemo(() => {
    const pending = pendingValidations.filter(v => v.statusValidasi === 'pending')
    console.log('Pending validations:', pending)
    
    const withDrivers = pending.map(v => {
      // Get driver data
      const driver = dummyUsers.find(u => u.id === v.driverId)
      console.log(`Mapping validation for driverId ${v.driverId}, found driver:`, driver)
      return { ...v, driver }
    })
    
    const filtered = withDrivers.filter(v => {
      if (!v.driver) {
        console.log('Filtered out: no driver found')
        return false
      }
      const matchesArmada = selectedArmada === 'all' || v.driver.namaArmada === selectedArmada
      const matchesSearch = v.driver.nama.toLowerCase().includes(searchQuery.toLowerCase())
      console.log(`Driver ${v.driver.nama}: armada=${matchesArmada}, search=${matchesSearch}`)
      return matchesArmada && matchesSearch
    })
    
    console.log('Final filtered validations:', filtered)
    return filtered
  }, [pendingValidations, selectedArmada, searchQuery])

  const handleViewDetail = (validation: any) => {
    setSelectedValidation(validation)
    setShowDetailModal(true)
  }

  const handleApprove = () => {
    if (!selectedValidation) return
    
    approvePendingValidation(selectedValidation.id)
    alert(`Data penilaian ${selectedValidation.driver?.nama} berhasil disetujui!`)
    
    setShowDetailModal(false)
    setSelectedValidation(null)
  }

  const handleReject = () => {
    if (!selectedValidation || !rejectReason.trim()) {
      alert('Harap berikan alasan penolakan!')
      return
    }
    
    rejectPendingValidation(selectedValidation.id, rejectReason)
    alert(`Data penilaian ${selectedValidation.driver?.nama} ditolak.\nAlasan: ${rejectReason}`)
    
    setShowRejectModal(false)
    setShowDetailModal(false)
    setRejectReason('')
    setSelectedValidation(null)
  }

  const handleOpenRejectModal = () => {
    setShowDetailModal(false)
    setShowRejectModal(true)
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Validasi Data Petugas</h1>
            <p className="page-subtitle">Review dan validasi penilaian driver dari petugas</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleRefresh}
            title="Refresh data dari localStorage"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Summary Cards */}
        <div className="input-summary">
          <div className="summary-item pending">
            <span className="summary-icon">⏳</span>
            <div>
              <p className="summary-label">Menunggu Validasi</p>
              <p className="summary-value">{pendingValidations.filter(v => v.statusValidasi === 'pending').length}</p>
            </div>
          </div>
          <div className="summary-item approved">
            <span className="summary-icon">✓</span>
            <div>
              <p className="summary-label">Disetujui Bulan Ini</p>
              <p className="summary-value">{pendingValidations.filter(v => v.statusValidasi === 'approved').length}</p>
            </div>
          </div>
          <div className="summary-item not-filled">
            <span className="summary-icon">✕</span>
            <div>
              <p className="summary-label">Ditolak Bulan Ini</p>
              <p className="summary-value">{pendingValidations.filter(v => v.statusValidasi === 'rejected').length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="input-controls">
          <div className="filter-group">
            <label className="filter-label">Filter Armada:</label>
            <select 
              className="filter-select"
              value={selectedArmada}
              onChange={(e) => setSelectedArmada(e.target.value as any)}
            >
              <option value="all">Semua Armada</option>
              <option value="A">Armada A</option>
              <option value="B">Armada B</option>
              <option value="C">Armada C</option>
            </select>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Cari nama driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Validation List */}
        <div className="validation-list">
          {filteredValidations.length > 0 ? (
            filteredValidations.map((validation, idx) => (
              <div key={idx} className="validation-card">
                <div className="validation-header">
                  <div className="validation-info">
                    <h3 className="validation-driver-name">{validation.driver?.nama}</h3>
                    <p className="validation-meta">
                      <span className="badge-armada">Armada {validation.driver?.namaArmada}</span>
                      <span className="divider">•</span>
                      <span>{validation.bulan}</span>
                    </p>
                    <p className="validation-petugas">
                      Diinput oleh: <strong>{validation.petugas.nama}</strong>
                    </p>
                  </div>
                  <div className="validation-score">
                    <div className="score-label">Total Skor</div>
                    <div className="score-value">{validation.totalSkor}</div>
                  </div>
                </div>

                <div className="validation-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={() => handleViewDetail(validation)}
                  >
                    👁️ Lihat Detail
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <h3>Tidak ada data pending</h3>
              <p>Semua data sudah divalidasi atau tidak ada data yang perlu direview</p>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedValidation && (
          <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">Detail Penilaian Driver</h2>
                  <p className="modal-subtitle">
                    {selectedValidation.driver.nama} - {selectedValidation.bulan}
                  </p>
                </div>
                <button className="modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
              </div>

              <div className="modal-body">
                {/* Info Petugas */}
                <div className="preview-section">
                  <h3>Informasi Petugas</h3>
                  <table className="preview-table">
                    <tbody>
                      <tr>
                        <td><strong>Nama Petugas:</strong></td>
                        <td>{selectedValidation.petugas.nama}</td>
                      </tr>
                      <tr>
                        <td><strong>Email:</strong></td>
                        <td>{selectedValidation.petugas.email}</td>
                      </tr>
                      <tr>
                        <td><strong>Armada:</strong></td>
                        <td>Armada {selectedValidation.driver.namaArmada}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Data Penilaian */}
                <div className="preview-section">
                  <h3>Data Penilaian</h3>
                  <table className="preview-table">
                    <tbody>
                      <tr>
                        <td><strong>Etika & Adab (25%):</strong></td>
                        <td>{selectedValidation.skor.etikaAdab}</td>
                      </tr>
                      <tr>
                        <td><strong>Disiplin (20%):</strong></td>
                        <td>{selectedValidation.skor.disiplin}</td>
                      </tr>
                      <tr>
                        <td><strong>Loyalitas (20%):</strong></td>
                        <td>{selectedValidation.skor.loyalitas}</td>
                      </tr>
                      <tr>
                        <td><strong>Skill Mengemudi (15%):</strong></td>
                        <td>{selectedValidation.skor.skillMengemudi}</td>
                      </tr>
                      <tr>
                        <td><strong>Perawatan Kendaraan (10%):</strong></td>
                        <td>{selectedValidation.skor.perawatanKendaraan}</td>
                      </tr>
                      <tr>
                        <td><strong>Performa (10%):</strong></td>
                        <td>{selectedValidation.skor.performa}</td>
                      </tr>
                      <tr className="total-row">
                        <td><strong>Total Skor Tertimbang:</strong></td>
                        <td><strong className="total-score">{selectedValidation.totalSkor}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Catatan Petugas */}
                {selectedValidation.catatanPetugas && (
                  <div className="preview-section">
                    <h3>Catatan dari Petugas</h3>
                    <p className="preview-note">{selectedValidation.catatanPetugas}</p>
                  </div>
                )}

                {/* Bukti Pendukung */}
                {selectedValidation.buktiFiles && selectedValidation.buktiFiles.length > 0 && (
                  <div className="preview-section">
                    <h3>Bukti Pendukung</h3>
                    <ul className="file-list">
                      {selectedValidation.buktiFiles && selectedValidation.buktiFiles.map((file: any, idx: number) => (
                        <li key={idx}>📄 {file.name || file}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  className="btn btn-outline btn-reject"
                  onClick={handleOpenRejectModal}
                >
                  ✕ Tolak
                </button>
                <button 
                  className="btn btn-primary btn-approve"
                  onClick={handleApprove}
                >
                  ✓ Setujui
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedValidation && (
          <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">Tolak Penilaian</h2>
                  <p className="modal-subtitle">
                    {selectedValidation.driver.nama} - {selectedValidation.bulan}
                  </p>
                </div>
                <button className="modal-close" onClick={() => setShowRejectModal(false)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="form-section">
                  <h3 className="form-section-title">Alasan Penolakan</h3>
                  <p className="form-help-text">
                    Berikan penjelasan mengapa data ini ditolak. Catatan ini akan dikirim ke petugas.
                  </p>
                  <textarea
                    className="form-textarea"
                    rows={5}
                    placeholder="Contoh: Data tidak lengkap, bukti tidak valid, atau penilaian tidak sesuai..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setShowRejectModal(false)
                    setShowDetailModal(true)
                  }}
                >
                  ← Kembali
                </button>
                <button 
                  className="btn btn-primary btn-reject"
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                >
                  ✓ Konfirmasi Tolak
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
