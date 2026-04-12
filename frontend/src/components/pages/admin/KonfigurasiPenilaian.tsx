'use client'

import { useState } from 'react'

interface Indikator {
  id: number
  nama: string
  bobot: number
}

export default function KonfigurasiPenilaian() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [indikators, setIndikators] = useState<Indikator[]>([
    { id: 1, nama: 'Etika & Adab', bobot: 25 },
    { id: 2, nama: 'Disiplin', bobot: 20 },
    { id: 3, nama: 'Loyalitas', bobot: 20 },
    { id: 4, nama: 'Skill Mengemudi', bobot: 15 },
    { id: 5, nama: 'Perawatan Kendaraan', bobot: 10 },
    { id: 6, nama: 'Performa', bobot: 10 }
  ])

  const totalBobot = indikators.reduce((sum, ind) => sum + ind.bobot, 0)
  const hasLowBobot = indikators.some(ind => ind.bobot > 0 && ind.bobot < 5)
  const hasEmptyNames = indikators.some(ind => !ind.nama.trim())

  const getStatusMessage = () => {
    if (hasEmptyNames) return '⚠️ Ada nama indikator yang kosong'
    if (hasLowBobot) return '⚠️ Ada bobot kurang dari 5%'
    if (totalBobot === 100) return '✅ Siap disimpan'
    if (totalBobot > 100) return '❌ Melebihi 100%'
    return '⚠️ Belum mencapai 100%'
  }

  const getStatusClass = () => {
    if (hasEmptyNames || hasLowBobot || totalBobot !== 100) return 'invalid'
    return 'valid'
  }

  const getProgressColor = () => {
    if (totalBobot === 100) return '#10b981'
    if (totalBobot >= 80 && totalBobot < 100) return '#10b981'
    if (totalBobot >= 40 && totalBobot < 80) return '#f59e0b'
    return '#ef4444'
  }

  const getProgressWidth = () => Math.min(totalBobot, 100)

  const handleBobotChange = (id: number, newBobot: string) => {
    const sanitized = newBobot.replace(/\D/g, '')
    let value = sanitized === '' ? 0 : parseInt(sanitized, 10)
    value = Math.max(0, Math.min(100, value))
    setIndikators(indikators.map(ind => ind.id === id ? { ...ind, bobot: value } : ind))
  }

  const handleAddIndicator = () => {
    const newId = Math.max(...indikators.map(ind => ind.id)) + 1
    setIndikators([...indikators, { id: newId, nama: '', bobot: 0 }])
  }

  const handleDeleteIndicator = (id: number) => {
    if (indikators.length > 1) {
      setIndikators(indikators.filter(ind => ind.id !== id))
    }
  }

  const handleNameChange = (id: number, newName: string) => {
    setIndikators(indikators.map(ind => ind.id === id ? { ...ind, nama: newName } : ind))
  }

  const handleSave = () => {
    if (totalBobot !== 100) {
      alert('Total bobot harus 100% untuk menyimpan konfigurasi!')
      return
    }
    if (indikators.some(ind => !ind.nama.trim())) {
      alert('Semua indikator harus memiliki nama!')
      return
    }
    if (indikators.some(ind => ind.bobot > 0 && ind.bobot < 5)) {
      alert('Setiap indikator harus memiliki bobot minimal 5%!')
      return
    }
    alert('Konfigurasi penilaian berhasil disimpan!')
    setIsEditMode(false)
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">Konfigurasi Bobot</h1>
          <p className="page-subtitle">Atur bobot penilaian untuk setiap indikator performa driver</p>
        </div>

      {!isEditMode ? (
        <div className="table-container">
          <table className="config-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>No</th>
                <th>Indikator</th>
                <th style={{ width: '150px' }}>Bobot (%)</th>
                <th style={{ width: '180px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {indikators.map((indikator, index) => (
                <tr key={indikator.id}>
                  <td className="text-center">{index + 1}</td>
                  <td className="font-semibold">{indikator.nama}</td>
                  <td className="text-center">{indikator.bobot}%</td>
                  <td className="text-center">
                    {index === 0 && (
                      <button onClick={() => setIsEditMode(true)} className="btn-edit-config">
                        ✏️ Edit Bobot
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="edit-config-container">
          <div className="table-container">
            <div className="table-header-actions">
              <h3 className="table-title">Edit Indikator Penilaian</h3>
              <button onClick={handleAddIndicator} className="btn-add-indicator">
                ➕ Tambah Indikator Baru
              </button>
            </div>

            <table className="config-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>No</th>
                  <th>Indikator</th>
                  <th style={{ width: '150px' }}>Bobot (%)</th>
                  <th style={{ width: '100px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {indikators.map((indikator, index) => (
                  <tr key={indikator.id}>
                    <td className="text-center">{index + 1}</td>
                    <td>
                      <div className="input-wrapper-name">
                        <input
                          type="text"
                          value={indikator.nama}
                          onChange={(e) => handleNameChange(indikator.id, e.target.value)}
                          className={`input-indikator-name ${!indikator.nama.trim() ? 'invalid-name' : ''}`}
                          placeholder="Nama indikator"
                        />
                        {!indikator.nama.trim() && (
                          <span className="name-warning">⚠️ Wajib diisi</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={indikator.bobot}
                          onChange={(e) => handleBobotChange(indikator.id, e.target.value)}
                          className={`input-bobot ${indikator.bobot > 0 && indikator.bobot < 5 ? 'invalid-bobot' : ''}`}
                          placeholder="0"
                        />
                        {indikator.bobot > 0 && indikator.bobot < 5 && (
                          <span className="bobot-warning">⚠️ Min 5%</span>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      {indikators.length > 1 && (
                        <button
                          onClick={() => handleDeleteIndicator(indikator.id)}
                          className="btn-delete-indicator"
                          title="Hapus indikator"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan={2} className="text-right font-bold">Total Bobot</td>
                  <td className="text-center font-bold">
                    <span className={`total-badge ${totalBobot === 100 ? 'valid' : 'invalid'}`}>
                      {totalBobot}% {totalBobot === 100 ? '✅' : '⚠️'}
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">Total Bobot: {totalBobot}%</span>
              <span className={`progress-status ${getStatusClass()}`}>
                {getStatusMessage()}
              </span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${getProgressWidth()}%`, backgroundColor: getProgressColor() }}
              >
                <span className="progress-text">{totalBobot}%</span>
              </div>
            </div>
            <div className="progress-legend">
              <span className="legend-item"><span className="legend-dot green"></span> 80-100%: Optimal</span>
              <span className="legend-item"><span className="legend-dot orange"></span> 40-79%: Perlu Penyesuaian</span>
              <span className="legend-item"><span className="legend-dot red"></span> &lt;40% atau &gt;100%: Tidak Valid</span>
            </div>
          </div>

          <div className="config-actions">
            <button onClick={() => setIsEditMode(false)} className="btn-cancel">Batal</button>
            <button onClick={handleSave} className="btn-save-config" disabled={totalBobot !== 100}>
              💾 Simpan Konfigurasi
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
