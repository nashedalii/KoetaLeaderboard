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
  etikaAdab: number
  disiplin: number
  loyalitas: number
  skillMengemudi: number
  perawatanKendaraan: number
  performa: number
  buktiFiles: File[]
  catatan: string
}

export default function InputValidasiData() {
  const [selectedDriver, setSelectedDriver] = useState<DriverInputStatus | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | StatusInput>('all')
  const [selectedMonth, setSelectedMonth] = useState('April/2025')
  const [petugasArmada] = useState<'A' | 'B' | 'C'>('A')
  
  // Form states
  const [showInputForm, setShowInputForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    driverId: 0,
    bulan: 'April/2025',
    etikaAdab: 0,
    disiplin: 0,
    loyalitas: 0,
    skillMengemudi: 0,
    perawatanKendaraan: 0,
    performa: 0,
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
  }, [petugasArmada, selectedMonth])

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
      etikaAdab: 0,
      disiplin: 0,
      loyalitas: 0,
      skillMengemudi: 0,
      perawatanKendaraan: 0,
      performa: 0,
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
      (formData.etikaAdab * bobotPenilaian.etikaAdab) / 100 +
      (formData.disiplin * bobotPenilaian.disiplin) / 100 +
      (formData.loyalitas * bobotPenilaian.loyalitas) / 100 +
      (formData.skillMengemudi * bobotPenilaian.skillMengemudi) / 100 +
      (formData.perawatanKendaraan * bobotPenilaian.perawatanKendaraan) / 100 +
      (formData.performa * bobotPenilaian.performa) / 100
    return Math.round(total * 10) / 10
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  const handleSubmit = () => {
    // In real app: send to backend/API
    console.log('Submit data:', formData)
    alert(`Data untuk ${selectedDriver?.nama} bulan ${selectedMonth} berhasil disubmit!\nStatus: Menunggu approval admin.`)
    setShowInputForm(false)
    setShowPreview(false)
    setSelectedDriver(null)
  }

  const handleSaveDraft = () => {
    console.log('Save draft:', formData)
    alert('Draft berhasil disimpan!')
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
                        <button className="btn btn-outline">👁️ Lihat</button>
                      </>
                    )}
                    {driver.statusInput === 'approved' && (
                      <button className="btn btn-outline">👁️ Lihat Detail</button>
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
                            onChange={(e) => handleFormChange(item.key as keyof FormData, parseInt(e.target.value) || 0)}
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
                    <h3 className="form-section-title">Bukti Pendukung</h3>
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
                    <h3 className="form-section-title">Catatan Tambahan</h3>
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
      </div>
    </div>
  )
}
