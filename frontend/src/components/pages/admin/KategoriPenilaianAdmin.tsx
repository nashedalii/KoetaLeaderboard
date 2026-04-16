'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@/utils/api'

interface RubricItem {
  range: string
  deskripsi: string
}

interface Bobot {
  bobot_id: number
  nama_bobot: string
  persentase_bobot: number | string
  deskripsi: string | null
}

interface Siklus {
  siklus_id: number
  nama_siklus: string
  status_display: string
}

const WARNA_LIST = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
]

const DEFAULT_RUBRIC: RubricItem[] = [
  { range: '', deskripsi: '' },
  { range: '', deskripsi: '' },
  { range: '', deskripsi: '' },
  { range: '', deskripsi: '' },
  { range: '', deskripsi: '' },
]

export default function KategoriPenilaianAdmin() {
  const [siklusList, setSiklusList]           = useState<Siklus[]>([])
  const [selectedSiklusId, setSelectedSiklusId] = useState<number | null>(null)
  const [bobotList, setBobotList]             = useState<Bobot[]>([])
  const [isLoadingSiklus, setIsLoadingSiklus] = useState(true)
  const [isLoadingBobot, setIsLoadingBobot]   = useState(false)
  const [isSaving, setIsSaving]               = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const [successMsg, setSuccessMsg]           = useState<string | null>(null)

  // Modal state
  const [showModal, setShowModal]             = useState(false)
  const [selectedBobot, setSelectedBobot]     = useState<Bobot | null>(null)
  const [rubricForm, setRubricForm]           = useState<RubricItem[]>(DEFAULT_RUBRIC)

  // Fetch daftar siklus
  useEffect(() => {
    const fetchSiklus = async () => {
      try {
        const data = await apiFetch('/api/siklus')
        setSiklusList(data || [])
        if (data && data.length > 0) {
          setSelectedSiklusId(data[0].siklus_id)
        }
      } catch {
        setError('Gagal memuat daftar siklus')
      } finally {
        setIsLoadingSiklus(false)
      }
    }
    fetchSiklus()
  }, [])

  // Fetch bobot saat siklus berubah
  const fetchBobot = useCallback(async () => {
    if (!selectedSiklusId) return
    setIsLoadingBobot(true)
    setError(null)
    try {
      const data = await apiFetch(`/api/bobot?siklus_id=${selectedSiklusId}`)
      setBobotList(data?.bobots || [])
    } catch {
      setError('Gagal memuat data bobot')
    } finally {
      setIsLoadingBobot(false)
    }
  }, [selectedSiklusId])

  useEffect(() => {
    fetchBobot()
  }, [fetchBobot])

  // Buka modal edit rubric
  const handleEditRubric = (bobot: Bobot) => {
    setSelectedBobot(bobot)
    setSuccessMsg(null)

    // Parse deskripsi JSON jika ada
    let parsed: RubricItem[] = DEFAULT_RUBRIC.map(() => ({ range: '', deskripsi: '' }))
    if (bobot.deskripsi) {
      try {
        const arr = JSON.parse(bobot.deskripsi)
        if (Array.isArray(arr) && arr.length > 0) {
          parsed = arr
        }
      } catch { /* biarkan default */ }
    }
    setRubricForm(parsed)
    setShowModal(true)
  }

  // Tambah baris rubric
  const addRow = () => {
    setRubricForm(prev => [...prev, { range: '', deskripsi: '' }])
  }

  // Hapus baris rubric
  const removeRow = (index: number) => {
    if (rubricForm.length <= 1) return
    setRubricForm(prev => prev.filter((_, i) => i !== index))
  }

  // Update nilai baris rubric
  const updateRow = (index: number, field: 'range' | 'deskripsi', value: string) => {
    setRubricForm(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  // Simpan rubric ke backend
  const handleSave = async () => {
    if (!selectedBobot) return

    const valid = rubricForm.filter(r => r.range.trim() !== '' || r.deskripsi.trim() !== '')
    if (valid.length === 0) {
      alert('Minimal isi satu baris rubric')
      return
    }
    const incomplete = valid.find(r => r.range.trim() === '' || r.deskripsi.trim() === '')
    if (incomplete) {
      alert('Setiap baris harus diisi Range dan Deskripsi')
      return
    }

    setIsSaving(true)
    try {
      await apiFetch(`/api/bobot/${selectedBobot.bobot_id}/deskripsi`, {
        method: 'PUT',
        body: JSON.stringify({ deskripsi: valid }),
      })
      setSuccessMsg(`Rubric "${selectedBobot.nama_bobot}" berhasil disimpan`)
      setShowModal(false)
      fetchBobot()
    } catch (err: any) {
      alert(err?.message || 'Gagal menyimpan rubric')
    } finally {
      setIsSaving(false)
    }
  }

  const getRubricCount = (bobot: Bobot): number => {
    if (!bobot.deskripsi) return 0
    try {
      const arr = JSON.parse(bobot.deskripsi)
      return Array.isArray(arr) ? arr.length : 0
    } catch { return 0 }
  }

  if (isLoadingSiklus) {
    return (
      <div className="dashboard-container">
        <div className="loading-message">Memuat data siklus...</div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Kategori Penilaian</h1>
            <p className="page-subtitle">Kelola rubric penilaian per indikator. Nama & bobot diatur di Konfigurasi Penilaian.</p>
          </div>
        </div>

        {/* Pilih Siklus */}
        <div className="filter-bar">
          <div className="filter-group">
            <label>Siklus Penilaian</label>
            <select
              value={selectedSiklusId ?? ''}
              onChange={e => setSelectedSiklusId(Number(e.target.value))}
            >
              {siklusList.map(s => (
                <option key={s.siklus_id} value={s.siklus_id}>
                  {s.nama_siklus}
                </option>
              ))}
            </select>
          </div>
        </div>

        {successMsg && (
          <div className="alert-success">{successMsg}</div>
        )}
        {error && (
          <div className="alert-error">{error}</div>
        )}

        {isLoadingBobot ? (
          <div className="loading-message">Memuat data bobot...</div>
        ) : bobotList.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada bobot untuk siklus ini. Tambahkan di Konfigurasi Penilaian.</p>
          </div>
        ) : (
          <div className="kategori-admin-grid">
            {bobotList.map((bobot, index) => {
              const warna = WARNA_LIST[index % WARNA_LIST.length]
              const rubricCount = getRubricCount(bobot)
              return (
                <div key={bobot.bobot_id} className="kategori-admin-card" style={{ borderLeftColor: warna }}>
                  <div className="kategori-admin-header">
                    <div className="kategori-admin-icon" style={{ backgroundColor: warna }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="kategori-admin-info">
                      <h3>{bobot.nama_bobot}</h3>
                      <span className="kategori-bobot-badge" style={{ backgroundColor: warna }}>
                        {parseFloat(String(bobot.persentase_bobot))}%
                      </span>
                    </div>
                  </div>

                  <div className="kategori-admin-kriteria">
                    {rubricCount > 0 ? (
                      <span className="rubric-status filled">
                        {rubricCount} range rubric tersedia
                      </span>
                    ) : (
                      <span className="rubric-status empty">
                        Belum ada rubric
                      </span>
                    )}
                  </div>

                  <div className="kategori-admin-actions">
                    <button onClick={() => handleEditRubric(bobot)} className="btn-edit-small">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                      Edit Rubric
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal Edit Rubric */}
        {showModal && selectedBobot && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Edit Rubric — {selectedBobot.nama_bobot}</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Bobot: {parseFloat(String(selectedBobot.persentase_bobot))}%
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="modal-close">✕</button>
              </div>

              <div className="modal-body">
                {/* Header kolom */}
                <div className="rubric-table-header">
                  <div className="rubric-col-range">Rentang Nilai</div>
                  <div className="rubric-col-desc">Deskripsi Kriteria</div>
                  <div className="rubric-col-action"></div>
                </div>

                {/* Baris rubric */}
                <div className="rubric-rows">
                  {rubricForm.map((row, index) => (
                    <div key={index} className="rubric-row">
                      <div className="rubric-col-range">
                        <input
                          type="text"
                          value={row.range}
                          onChange={e => updateRow(index, 'range', e.target.value)}
                          placeholder="cth: 86–100"
                          className="rubric-input-range"
                        />
                      </div>
                      <div className="rubric-col-desc">
                        <textarea
                          value={row.deskripsi}
                          onChange={e => updateRow(index, 'deskripsi', e.target.value)}
                          placeholder="Deskripsi kriteria untuk rentang nilai ini..."
                          className="rubric-input-desc"
                          rows={2}
                        />
                      </div>
                      <div className="rubric-col-action">
                        {rubricForm.length > 1 && (
                          <button
                            onClick={() => removeRow(index)}
                            className="btn-remove-kriteria"
                            title="Hapus baris"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={addRow} className="btn-add-kriteria" style={{ marginTop: '12px' }}>
                  ➕ Tambah Range
                </button>
              </div>

              <div className="modal-footer">
                <button onClick={() => setShowModal(false)} className="btn-secondary">
                  Batal
                </button>
                <button onClick={handleSave} className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Menyimpan...' : '💾 Simpan Rubric'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
