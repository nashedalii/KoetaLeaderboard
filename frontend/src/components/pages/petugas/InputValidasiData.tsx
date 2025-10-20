'use client'

import { useMemo, useState } from 'react'
import { dummyUsers, User } from '@/data/dummyUsers'

const bobotPenilaian = {
  etikaAdab: 25,
  disiplin: 20,
  loyalitas: 20,
  skillMengemudi: 15,
  perawatanKendaraan: 10,
  performa: 10
}

type StatusInput = 'belum-diisi' | 'pending' | 'approved'

interface DriverInputStatus extends User {
  statusInput: StatusInput
  lastInputMonth?: string
}

interface FormData {
  driverId: number
  bulan: string
  etikaAdab: string
  disiplin: string
  loyalitas: string
  skillMengemudi: string
  perawatanKendaraan: string
  performa: string
  buktiFiles: File[]
  catatan: string
}

export default function InputValidasiData() {
  const [selectedDriver, setSelectedDriver] = useState<DriverInputStatus | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | StatusInput>('all')
  const [selectedMonth, setSelectedMonth] = useState('April/2025')
  const [petugasArmada] = useState<'A' | 'B' | 'C'>('A')
  const [refreshKey, setRefreshKey] = useState(0) // Add this to trigger re-render
  
  // Form states
  const [showInputForm, setShowInputForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    driverId: 0,
    bulan: 'April/2025',
    etikaAdab: '',
    disiplin: '',
    loyalitas: '',
    skillMengemudi: '',
    perawatanKendaraan: '',
    performa: '',
    buktiFiles: [],
    catatan: ''
  })

  const availableMonths = ['Januari/2025', 'Februari/2025', 'Maret/2025', 'April/2025']

  // Determine status for each driver based on selected month
  const getDriverStatus = (driver: User, month: string): StatusInput => {
    // Check if driver has data for selected month
    const hasData = driver.skorBulanan?.some(sb => sb.bulan === month)
    
    if (!hasData) return 'belum-diisi'
    
    // Simulate: April is pending, previous months are approved
    if (month === 'April/2025') return 'pending'
    
    return 'approved'
  }

  const driversWithStatus = useMemo(() => {
    return dummyUsers
      .filter((u) => u.role === 'Supir' && u.namaArmada === petugasArmada)
      .map((d) => {
        const statusInput = getDriverStatus(d, selectedMonth)
        const lastInputMonth = d.skorBulanan?.[d.skorBulanan.length - 1]?.bulan
        return { ...d, statusInput, lastInputMonth } as DriverInputStatus
      })
  }, [petugasArmada, selectedMonth, refreshKey]) // Add refreshKey to dependencies

  const filteredDrivers = useMemo(() => {
    return driversWithStatus.filter((driver) => {
      const matchesSearch =
        driver.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (driver.namaKernet || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' ? true : driver.statusInput === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [driversWithStatus, searchQuery, statusFilter])

  const getStatusBadge = (status: StatusInput) => {
    switch (status) {
      case 'approved':
        return { className: 'status-badge approved', text: '✓ Disetujui', icon: '✓' }
      case 'pending':
        return { className: 'status-badge pending', text: '⏳ Pending', icon: '⏳' }
      case 'belum-diisi':
        return { className: 'status-badge not-filled', text: '⚠️ Belum Diisi', icon: '⚠️' }
    }
  }

  const handleOpenInputForm = (driver: DriverInputStatus) => {
    setSelectedDriver(driver)
    setFormData({
      driverId: driver.id,
      bulan: selectedMonth,
      etikaAdab: '',
      disiplin: '',
      loyalitas: '',
      skillMengemudi: '',
      perawatanKendaraan: '',
      performa: '',
      buktiFiles: [],
      catatan: ''
    })
    setShowInputForm(true)
  }

  const handleFormChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setFormData(prev => ({ ...prev, buktiFiles: [...prev.buktiFiles, ...files] }))
    }
  }

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      buktiFiles: prev.buktiFiles.filter((_, i) => i !== index)
    }))
  }

  const calculateTotal = () => {
    const total =
      ((parseFloat(formData.etikaAdab) || 0) * bobotPenilaian.etikaAdab) / 100 +
      ((parseFloat(formData.disiplin) || 0) * bobotPenilaian.disiplin) / 100 +
      ((parseFloat(formData.loyalitas) || 0) * bobotPenilaian.loyalitas) / 100 +
      ((parseFloat(formData.skillMengemudi) || 0) * bobotPenilaian.skillMengemudi) / 100 +
      ((parseFloat(formData.perawatanKendaraan) || 0) * bobotPenilaian.perawatanKendaraan) / 100 +
      ((parseFloat(formData.performa) || 0) * bobotPenilaian.performa) / 100
    return Math.round(total * 10) / 10
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  const handleSubmit = () => {
    if (!selectedDriver) return
    
    // Simulate adding score to driver's skorBulanan
    const driverIndex = dummyUsers.findIndex(u => u.id === selectedDriver.id)
    if (driverIndex !== -1) {
      const newScore = {
        bulan: selectedMonth,
        skor: {
          etikaAdab: parseFloat(formData.etikaAdab) || 0,
          disiplin: parseFloat(formData.disiplin) || 0,
          loyalitas: parseFloat(formData.loyalitas) || 0,
          skillMengemudi: parseFloat(formData.skillMengemudi) || 0,
          perawatanKendaraan: parseFloat(formData.perawatanKendaraan) || 0,
          performa: parseFloat(formData.performa) || 0
        }
      }
      
      // Add or update score for this month
      if (!dummyUsers[driverIndex].skorBulanan) {
        dummyUsers[driverIndex].skorBulanan = []
      }
      
      const existingScoreIndex = dummyUsers[driverIndex].skorBulanan!.findIndex(
        s => s.bulan === selectedMonth
      )
      
      if (existingScoreIndex >= 0) {
        dummyUsers[driverIndex].skorBulanan![existingScoreIndex] = newScore
      } else {
        dummyUsers[driverIndex].skorBulanan!.push(newScore)
      }
    }
    
    console.log('Submit data:', formData)
    alert(`Data untuk ${selectedDriver?.nama} bulan ${selectedMonth} berhasil disubmit!\nStatus: Menunggu approval admin.`)
    setShowInputForm(false)
    setShowPreview(false)
    setSelectedDriver(null)
    
    // Trigger re-render to update status
    setRefreshKey(prev => prev + 1)
  }

  const handleSaveDraft = () => {
    console.log('Save draft:', formData)
    alert('Draft berhasil disimpan!')
  }

  const handleViewDetail = (driver: DriverInputStatus) => {
    setSelectedDriver(driver)
    setShowDetailModal(true)
  }

  const getDriverScoreForMonth = (driver: User, month: string) => {
    return driver.skorBulanan?.find(sb => sb.bulan === month)
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Input & Validasi Data</h1>
            <p className="page-subtitle">Input penilaian driver dan kirim untuk persetujuan admin</p>
          </div>
        </div>

        {/* Summary & Controls */}
        <div className="input-controls">
          <div className="input-summary">
            <div className="summary-item approved">
              <span className="summary-icon">✓</span>
              <div>
                <p className="summary-label">Disetujui</p>
                <p className="summary-value">{driversWithStatus.filter(d => d.statusInput === 'approved').length}</p>
              </div>
            </div>
            <div className="summary-item pending">
              <span className="summary-icon">⏳</span>
              <div>
                <p className="summary-label">Pending</p>
                <p className="summary-value">{driversWithStatus.filter(d => d.statusInput === 'pending').length}</p>
              </div>
            </div>
            <div className="summary-item not-filled">
              <span className="summary-icon">⚠️</span>
              <div>
                <p className="summary-label">Belum Diisi</p>
                <p className="summary-value">{driversWithStatus.filter(d => d.statusInput === 'belum-diisi').length}</p>
              </div>
            </div>
          </div>

          <div className="input-filters">
            <select
              className="filter-select month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>

            <input
              className="search-input"
              placeholder="🔍 Cari driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Semua Status</option>
              <option value="approved">Disetujui</option>
              <option value="pending">Pending</option>
              <option value="belum-diisi">Belum Diisi</option>
            </select>
          </div>
        </div>

        {/* Driver Cards Grid */}
        <div className="driver-grid">
          {filteredDrivers.map((driver) => {
            const statusBadge = getStatusBadge(driver.statusInput)
            return (
              <div key={driver.id} className="driver-card input-card">
                <div className="driver-card-header">
                  <div>
                    <h3 className="driver-name">{driver.nama}</h3>
                    <p className="muted small">Kernet: {driver.namaKernet || '-'}</p>
                  </div>
                  <div className="driver-right">
                    <span className="armada-badge">Armada {driver.namaArmada}</span>
                  </div>
                </div>

                <div className="driver-card-body">
                  <div className="status-row">
                    <span className={statusBadge.className}>{statusBadge.text}</span>
                  </div>

                  <p className="muted small">Bulan: <strong>{selectedMonth}</strong></p>

                  <div className="card-actions">
                    {driver.statusInput === 'belum-diisi' && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleOpenInputForm(driver)}
                      >
                        📝 Input Data
                      </button>
                    )}
                    {driver.statusInput === 'pending' && (
                      <>
                        <button className="btn btn-secondary" onClick={() => handleOpenInputForm(driver)}>
                          ✏️ Edit
                        </button>
                        <button className="btn btn-outline" onClick={() => handleViewDetail(driver)}>👁️ Lihat</button>
                      </>
                    )}
                    {driver.statusInput === 'approved' && (
                      <button className="btn btn-outline" onClick={() => handleViewDetail(driver)}>👁️ Lihat Detail</button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredDrivers.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Tidak ada data ditemukan</h3>
            <p>Coba ubah filter atau pencarian</p>
          </div>
        )}

        {/* Input Form Modal */}
        {showInputForm && selectedDriver && !showPreview && (
          <div className="modal-overlay" onClick={() => setShowInputForm(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">Input Penilaian Driver</h2>
                  <p className="modal-subtitle">{selectedDriver.nama} - {selectedMonth}</p>
                </div>
                <button className="modal-close" onClick={() => setShowInputForm(false)}>✕</button>
              </div>

              <div className="modal-body">
                <form className="input-form">
                  {/* Scoring inputs */}
                  <div className="form-section">
                    <h3 className="form-section-title">Penilaian Kinerja</h3>
                    <div className="form-grid">
                      {[
                        { key: 'etikaAdab', label: 'Etika & Adab', bobot: 25 },
                        { key: 'disiplin', label: 'Disiplin', bobot: 20 },
                        { key: 'loyalitas', label: 'Loyalitas', bobot: 20 },
                        { key: 'skillMengemudi', label: 'Skill Mengemudi', bobot: 15 },
                        { key: 'perawatanKendaraan', label: 'Perawatan Kendaraan', bobot: 10 },
                        { key: 'performa', label: 'Performa', bobot: 10 }
                      ].map(item => (
                        <div key={item.key} className="form-group">
                          <label className="form-label">
                            {item.label} <span className="badge-bobot">{item.bobot}%</span>
                          </label>
                          <input
                            type="number"
                            className="form-input"
                            min="0"
                            max="100"
                            value={(formData as any)[item.key]}
                            onChange={(e) => handleFormChange(item.key as keyof FormData, e.target.value)}
                            placeholder="0-100"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="total-score-preview">
                      <span>Total Skor Tertimbang:</span>
                      <strong className="total-value">{calculateTotal()}</strong>
                    </div>
                  </div>

                  {/* Upload bukti */}
                  <div className="form-section">
                    <h3 className="form-section-title">
                      Bukti Pendukung <span style={{ color: '#ef4444', fontSize: '0.9em' }}>*opsional</span>
                    </h3>
                    <div className="upload-area">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="file-upload" className="upload-label">
                        <span className="upload-icon">📎</span>
                        <span>Klik untuk upload foto/dokumen</span>
                        <span className="upload-hint">PNG, JPG, PDF (Max 5MB per file)</span>
                      </label>
                    </div>

                    {formData.buktiFiles.length > 0 && (
                      <div className="uploaded-files">
                        {formData.buktiFiles.map((file, idx) => (
                          <div key={idx} className="file-item">
                            <span className="file-name">📄 {file.name}</span>
                            <button
                              type="button"
                              className="btn-remove"
                              onClick={() => handleRemoveFile(idx)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Catatan */}
                  <div className="form-section">
                    <h3 className="form-section-title">
                      Catatan Tambahan <span style={{ color: '#ef4444', fontSize: '0.9em' }}>*opsional</span>
                    </h3>
                    <textarea
                      className="form-textarea"
                      rows={4}
                      placeholder="Tambahkan catatan atau keterangan tambahan..."
                      value={formData.catatan}
                      onChange={(e) => handleFormChange('catatan', e.target.value)}
                    />
                  </div>
                </form>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={handleSaveDraft}>
                  💾 Simpan Draft
                </button>
                <button className="btn btn-primary" onClick={handlePreview}>
                  👁️ Preview & Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedDriver && (
          <div className="modal-overlay" onClick={() => setShowPreview(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Preview Data Sebelum Submit</h2>
                <button className="modal-close" onClick={() => setShowPreview(false)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="preview-section">
                  <h3>Informasi Driver</h3>
                  <table className="preview-table">
                    <tbody>
                      <tr>
                        <td><strong>Nama Driver:</strong></td>
                        <td>{selectedDriver.nama}</td>
                      </tr>
                      <tr>
                        <td><strong>Kernet:</strong></td>
                        <td>{selectedDriver.namaKernet || '-'}</td>
                      </tr>
                      <tr>
                        <td><strong>Armada:</strong></td>
                        <td>Armada {selectedDriver.namaArmada}</td>
                      </tr>
                      <tr>
                        <td><strong>Bulan:</strong></td>
                        <td>{formData.bulan}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="preview-section">
                  <h3>Hasil Penilaian</h3>
                  <table className="preview-table">
                    <tbody>
                      <tr>
                        <td><strong>Etika & Adab (25%):</strong></td>
                        <td>{formData.etikaAdab}</td>
                      </tr>
                      <tr>
                        <td><strong>Disiplin (20%):</strong></td>
                        <td>{formData.disiplin}</td>
                      </tr>
                      <tr>
                        <td><strong>Loyalitas (20%):</strong></td>
                        <td>{formData.loyalitas}</td>
                      </tr>
                      <tr>
                        <td><strong>Skill Mengemudi (15%):</strong></td>
                        <td>{formData.skillMengemudi}</td>
                      </tr>
                      <tr>
                        <td><strong>Perawatan Kendaraan (10%):</strong></td>
                        <td>{formData.perawatanKendaraan}</td>
                      </tr>
                      <tr>
                        <td><strong>Performa (10%):</strong></td>
                        <td>{formData.performa}</td>
                      </tr>
                      <tr className="total-row">
                        <td><strong>Total Skor Tertimbang:</strong></td>
                        <td><strong className="total-score">{calculateTotal()}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {formData.buktiFiles.length > 0 && (
                  <div className="preview-section">
                    <h3>Bukti Pendukung</h3>
                    <ul className="file-list">
                      {formData.buktiFiles.map((file, idx) => (
                        <li key={idx}>📄 {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {formData.catatan && (
                  <div className="preview-section">
                    <h3>Catatan</h3>
                    <p className="preview-note">{formData.catatan}</p>
                  </div>
                )}

                <div className="preview-warning">
                  <strong>⚠️ Perhatian:</strong> Data yang sudah disubmit akan menunggu persetujuan dari Admin.
                  Pastikan semua data sudah benar sebelum submit.
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setShowPreview(false)}>
                  ← Kembali Edit
                </button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  ✓ Submit ke Admin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal - View approved/pending data */}
        {showDetailModal && selectedDriver && (
          <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">Detail Penilaian Driver</h2>
                  <p className="modal-subtitle">{selectedDriver.nama} - {selectedMonth}</p>
                </div>
                <button className="modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
              </div>

              <div className="modal-body">
                {(() => {
                  const scoreData = getDriverScoreForMonth(selectedDriver, selectedMonth)
                  
                  if (!scoreData) {
                    return (
                      <div className="empty-state">
                        <p>Tidak ada data untuk bulan ini</p>
                      </div>
                    )
                  }

                  return (
                    <>
                      <div className="preview-section">
                        <h3>Data Penilaian</h3>
                        <table className="preview-table">
                          <tbody>
                            <tr>
                              <td><strong>Etika & Adab (25%):</strong></td>
                              <td>{scoreData.skor.etikaAdab}</td>
                            </tr>
                            <tr>
                              <td><strong>Disiplin (20%):</strong></td>
                              <td>{scoreData.skor.disiplin}</td>
                            </tr>
                            <tr>
                              <td><strong>Loyalitas (20%):</strong></td>
                              <td>{scoreData.skor.loyalitas}</td>
                            </tr>
                            <tr>
                              <td><strong>Skill Mengemudi (15%):</strong></td>
                              <td>{scoreData.skor.skillMengemudi}</td>
                            </tr>
                            <tr>
                              <td><strong>Perawatan Kendaraan (10%):</strong></td>
                              <td>{scoreData.skor.perawatanKendaraan}</td>
                            </tr>
                            <tr>
                              <td><strong>Performa (10%):</strong></td>
                              <td>{scoreData.skor.performa}</td>
                            </tr>
                            <tr className="total-row">
                              <td><strong>Total Skor Tertimbang:</strong></td>
                              <td><strong className="total-score">{
                                Math.round((
                                  (scoreData.skor.etikaAdab * bobotPenilaian.etikaAdab) / 100 +
                                  (scoreData.skor.disiplin * bobotPenilaian.disiplin) / 100 +
                                  (scoreData.skor.loyalitas * bobotPenilaian.loyalitas) / 100 +
                                  (scoreData.skor.skillMengemudi * bobotPenilaian.skillMengemudi) / 100 +
                                  (scoreData.skor.perawatanKendaraan * bobotPenilaian.perawatanKendaraan) / 100 +
                                  (scoreData.skor.performa * bobotPenilaian.performa) / 100
                                ) * 10) / 10
                              }</strong></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="preview-section">
                        <h3>Status</h3>
                        <p>
                          {selectedDriver.statusInput === 'approved' && (
                            <span className="status-badge approved">✓ Disetujui Admin</span>
                          )}
                          {selectedDriver.statusInput === 'pending' && (
                            <span className="status-badge pending">⏳ Menunggu Persetujuan</span>
                          )}
                        </p>
                      </div>
                    </>
                  )
                })()}
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setShowDetailModal(false)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
