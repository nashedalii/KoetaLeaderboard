'use client'

import { useState, useEffect, useCallback } from 'react'

interface PenilaianItem {
  penilaian_id: number
  status_validasi: 'pending' | 'approved' | 'rejected'
  skor_total: number
  catatan_petugas: string | null
  note_validasi: string | null
  created_at: string
  updated_at: string
  nama_driver: string
  kode_bus: string
  nopol: string
  nama_armada: string
  nama_periode: string
  bulan: string
  tahun: number
  nama_petugas_input: string
  nama_admin_validasi: string | null
}

interface DetailItem {
  penilaian_detail_id: number
  nilai: number
  bobot_id: number
  nama_bobot: string
  persentase_bobot: number
}

interface FotoItem {
  bukti_id: number
  file_path: string
  nama_file: string | null
  uploaded_at: string
}

interface LogItem {
  validasi_log_id: number
  aksi: string
  alasan: string | null
  created_at: string
  nama_admin: string
}

interface DetailData {
  penilaian: PenilaianItem
  details: DetailItem[]
  foto: FotoItem[]
  log: LogItem[]
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || ''

const getToken = () => {
  try { return JSON.parse(localStorage.getItem('auth') || '{}').token || '' }
  catch { return '' }
}

const authHeader = () => ({ Authorization: `Bearer ${getToken()}` })

export default function ValidasiDataPetugas() {
  const [list, setList]               = useState<PenilaianItem[]>([])
  const [isLoading, setIsLoading]     = useState(true)
  const [error, setError]             = useState<string | null>(null)

  // Filter state
  const [filterStatus, setFilterStatus]   = useState<string>('all')
  const [filterArmada, setFilterArmada]   = useState<string>('all')
  const [searchQuery, setSearchQuery]     = useState('')

  // Detail modal
  const [detailData, setDetailData]         = useState<DetailData | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [showDetail, setShowDetail]         = useState(false)

  // Reject modal
  const [showReject, setShowReject]     = useState(false)
  const [rejectAlasan, setRejectAlasan] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionMsg, setActionMsg]       = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // ── Fetch list ───────────────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.set('status_validasi', filterStatus)
      if (filterArmada !== 'all') params.set('armada_id', filterArmada) // armada_id filter by name below

      const res = await fetch(`${apiBase}/api/validasi?${params}`, { headers: authHeader() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal memuat data')
      setList(data.penilaian || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [filterStatus, filterArmada])

  useEffect(() => { fetchList() }, [fetchList])

  // ── Derived unique armada list for filter ────────────────────────────────
  const armadaList = Array.from(new Set(list.map(p => p.nama_armada))).sort()

  // ── Client-side search + armada filter ──────────────────────────────────
  const filtered = list.filter(p => {
    const matchArmada = filterArmada === 'all' || p.nama_armada === filterArmada
    const matchSearch = p.nama_driver.toLowerCase().includes(searchQuery.toLowerCase())
    return matchArmada && matchSearch
  })

  // ── Summary counts (from full list) ─────────────────────────────────────
  const counts = {
    total:    list.length,
    pending:  list.filter(p => p.status_validasi === 'pending').length,
    approved: list.filter(p => p.status_validasi === 'approved').length,
    rejected: list.filter(p => p.status_validasi === 'rejected').length,
  }

  // ── Open detail ──────────────────────────────────────────────────────────
  const openDetail = async (id: number) => {
    setIsLoadingDetail(true)
    setShowDetail(true)
    setDetailData(null)
    setActionMsg(null)
    try {
      const res = await fetch(`${apiBase}/api/validasi/${id}`, { headers: authHeader() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setDetailData(data)
    } catch (err: any) {
      setShowDetail(false)
      setError(err.message)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const closeDetail = () => {
    setShowDetail(false)
    setDetailData(null)
    setActionMsg(null)
  }

  // ── Approve ──────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!detailData) return
    setIsSubmitting(true)
    try {
      const res = await fetch(
        `${apiBase}/api/validasi/${detailData.penilaian.penilaian_id}/approve`,
        { method: 'PUT', headers: authHeader() }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setActionMsg({ type: 'success', text: data.message })
      fetchList()
      // Refresh detail
      const res2 = await fetch(
        `${apiBase}/api/validasi/${detailData.penilaian.penilaian_id}`,
        { headers: authHeader() }
      )
      const data2 = await res2.json()
      if (res2.ok) setDetailData(data2)
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Reject ───────────────────────────────────────────────────────────────
  const openReject = () => {
    setRejectAlasan('')
    setShowReject(true)
  }

  const handleReject = async () => {
    if (!detailData || !rejectAlasan.trim()) return
    setIsSubmitting(true)
    try {
      const res = await fetch(
        `${apiBase}/api/validasi/${detailData.penilaian.penilaian_id}/reject`,
        {
          method: 'PUT',
          headers: { ...authHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ alasan: rejectAlasan.trim() })
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setShowReject(false)
      setActionMsg({ type: 'success', text: data.message })
      fetchList()
      const res2 = await fetch(
        `${apiBase}/api/validasi/${detailData.penilaian.penilaian_id}`,
        { headers: authHeader() }
      )
      const data2 = await res2.json()
      if (res2.ok) setDetailData(data2)
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending:  'status-badge pending',
      approved: 'status-badge approved',
      rejected: 'status-badge rejected',
    }
    const label: Record<string, string> = {
      pending:  'Menunggu',
      approved: 'Disetujui',
      rejected: 'Ditolak',
    }
    return <span className={map[status] || 'status-badge'}>{label[status] || status}</span>
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

  const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Validasi Data Petugas</h1>
            <p className="page-subtitle">Review dan validasi penilaian driver yang disubmit petugas</p>
          </div>
          <button className="btn btn-outline" onClick={fetchList} disabled={isLoading}>
            {isLoading ? 'Memuat...' : 'Refresh'}
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="error-banner" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="input-summary">
          <div className="summary-item total" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus('all')}>
            <span className="summary-icon">📋</span>
            <div>
              <p className="summary-label">Total Penilaian</p>
              <p className="summary-value">{counts.total}</p>
            </div>
          </div>
          <div className="summary-item pending" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus('pending')}>
            <span className="summary-icon">⏳</span>
            <div>
              <p className="summary-label">Menunggu Validasi</p>
              <p className="summary-value">{counts.pending}</p>
            </div>
          </div>
          <div className="summary-item approved" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus('approved')}>
            <span className="summary-icon">✓</span>
            <div>
              <p className="summary-label">Disetujui</p>
              <p className="summary-value">{counts.approved}</p>
            </div>
          </div>
          <div className="summary-item rejected" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus('rejected')}>
            <span className="summary-icon">✕</span>
            <div>
              <p className="summary-label">Ditolak</p>
              <p className="summary-value">{counts.rejected}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="input-controls">
          <div className="filter-group">
            <label className="filter-label">Status:</label>
            <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">Semua</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Armada:</label>
            <select className="filter-select" value={filterArmada} onChange={e => setFilterArmada(e.target.value)}>
              <option value="all">Semua Armada</option>
              {armadaList.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Cari nama driver..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Memuat data penilaian...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <h3>Tidak ada data</h3>
            <p>Tidak ada penilaian yang sesuai dengan filter yang dipilih</p>
          </div>
        ) : (
          <div className="validation-list">
            {filtered.map(p => (
              <div key={p.penilaian_id} className="validation-card">
                <div className="validation-header">
                  <div className="validation-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 className="validation-driver-name">{p.nama_driver}</h3>
                      {statusBadge(p.status_validasi)}
                    </div>
                    <p className="validation-meta">
                      <span className="badge-armada">{p.nama_armada}</span>
                      <span className="divider">•</span>
                      <span>{p.nama_periode}</span>
                      <span className="divider">•</span>
                      <span>{p.kode_bus} / {p.nopol}</span>
                    </p>
                    <p className="validation-petugas">
                      Diinput oleh: <strong>{p.nama_petugas_input}</strong>
                      {' '}&nbsp;•&nbsp; {fmtDate(p.created_at)}
                    </p>
                    {p.status_validasi === 'rejected' && p.note_validasi && (
                      <p className="rejected-note">Alasan tolak: {p.note_validasi}</p>
                    )}
                  </div>
                  <div className="validation-score">
                    <div className="score-label">Skor Total</div>
                    <div className="score-value">{Number(p.skor_total).toFixed(2)}</div>
                  </div>
                </div>
                <div className="validation-actions">
                  <button className="btn btn-outline" onClick={() => openDetail(p.penilaian_id)}>
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Detail Modal ──────────────────────────────────────────────── */}
        {showDetail && (
          <div className="modal-overlay" onClick={closeDetail}>
            <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">Detail Penilaian</h2>
                  {detailData && (
                    <p className="modal-subtitle">
                      {detailData.penilaian.nama_driver} — {detailData.penilaian.nama_periode}
                    </p>
                  )}
                </div>
                <button className="modal-close" onClick={closeDetail}>✕</button>
              </div>

              <div className="modal-body">
                {isLoadingDetail ? (
                  <div className="loading-state">
                    <div className="loading-spinner" />
                    <p>Memuat detail...</p>
                  </div>
                ) : detailData ? (
                  <>
                    {/* Action message */}
                    {actionMsg && (
                      <div className={actionMsg.type === 'success' ? 'success-banner' : 'error-banner'}
                           style={{ marginBottom: '1rem' }}>
                        {actionMsg.text}
                      </div>
                    )}

                    {/* Info Penilaian */}
                    <div className="preview-section">
                      <h3>Informasi Penilaian</h3>
                      <table className="preview-table">
                        <tbody>
                          <tr><td><strong>Driver</strong></td><td>{detailData.penilaian.nama_driver}</td></tr>
                          <tr><td><strong>Kernet</strong></td><td>{(detailData.penilaian as any).nama_kernet || '-'}</td></tr>
                          <tr><td><strong>Bus</strong></td><td>{detailData.penilaian.kode_bus} / {detailData.penilaian.nopol}</td></tr>
                          <tr><td><strong>Armada</strong></td><td>{detailData.penilaian.nama_armada}</td></tr>
                          <tr><td><strong>Periode</strong></td><td>{detailData.penilaian.nama_periode}</td></tr>
                          <tr><td><strong>Petugas Input</strong></td><td>{detailData.penilaian.nama_petugas_input}</td></tr>
                          <tr><td><strong>Tanggal Input</strong></td><td>{fmtDateTime(detailData.penilaian.created_at)}</td></tr>
                          <tr><td><strong>Status</strong></td><td>{statusBadge(detailData.penilaian.status_validasi)}</td></tr>
                          {detailData.penilaian.nama_admin_validasi && (
                            <tr><td><strong>Divalidasi oleh</strong></td><td>{detailData.penilaian.nama_admin_validasi}</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Indikator */}
                    <div className="preview-section">
                      <h3>Detail Indikator</h3>
                      <table className="preview-table">
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>Indikator</th>
                            <th style={{ textAlign: 'center' }}>Bobot</th>
                            <th style={{ textAlign: 'center' }}>Nilai</th>
                            <th style={{ textAlign: 'center' }}>Kontribusi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailData.details.map(d => (
                            <tr key={d.penilaian_detail_id}>
                              <td>{d.nama_bobot}</td>
                              <td style={{ textAlign: 'center' }}>{d.persentase_bobot}%</td>
                              <td style={{ textAlign: 'center' }}>{Number(d.nilai).toFixed(2)}</td>
                              <td style={{ textAlign: 'center' }}>
                                {((Number(d.nilai) * Number(d.persentase_bobot)) / 100).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                          <tr className="total-row">
                            <td colSpan={3}><strong>Skor Total</strong></td>
                            <td style={{ textAlign: 'center' }}>
                              <strong className="total-score">
                                {Number(detailData.penilaian.skor_total).toFixed(2)}
                              </strong>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Catatan Petugas */}
                    {detailData.penilaian.catatan_petugas && (
                      <div className="preview-section">
                        <h3>Catatan Petugas</h3>
                        <p className="preview-note">{detailData.penilaian.catatan_petugas}</p>
                      </div>
                    )}

                    {/* Note Validasi */}
                    {detailData.penilaian.note_validasi && (
                      <div className="preview-section">
                        <h3>Alasan Penolakan</h3>
                        <p className="rejected-note">{detailData.penilaian.note_validasi}</p>
                      </div>
                    )}

                    {/* Bukti Foto */}
                    {detailData.foto.length > 0 && (
                      <div className="preview-section">
                        <h3>Bukti Foto</h3>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {detailData.foto.map(f => (
                            <a key={f.bukti_id} href={f.file_path} target="_blank" rel="noreferrer">
                              <img
                                src={f.file_path}
                                alt={f.nama_file || 'Bukti foto'}
                                style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Riwayat Validasi */}
                    {detailData.log.length > 0 && (
                      <div className="preview-section">
                        <h3>Riwayat Validasi</h3>
                        <table className="preview-table">
                          <tbody>
                            {detailData.log.map(l => (
                              <tr key={l.validasi_log_id}>
                                <td>{fmtDateTime(l.created_at)}</td>
                                <td>{l.nama_admin}</td>
                                <td>{statusBadge(l.aksi)}</td>
                                <td>{l.alasan || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              {/* Footer actions — only show for pending */}
              {detailData && detailData.penilaian.status_validasi === 'pending' && (
                <div className="modal-footer">
                  <button
                    className="btn btn-danger-outline"
                    onClick={openReject}
                    disabled={isSubmitting}
                  >
                    Tolak
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleApprove}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Memproses...' : 'Setujui'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Reject Modal ─────────────────────────────────────────────── */}
        {showReject && detailData && (
          <div className="modal-overlay" onClick={() => setShowReject(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">Tolak Penilaian</h2>
                  <p className="modal-subtitle">{detailData.penilaian.nama_driver} — {detailData.penilaian.nama_periode}</p>
                </div>
                <button className="modal-close" onClick={() => setShowReject(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-section">
                  <h3 className="form-section-title">Alasan Penolakan</h3>
                  <p className="form-help-text">
                    Berikan penjelasan mengapa data ini ditolak. Catatan ini akan ditampilkan ke petugas.
                  </p>
                  <textarea
                    className="form-textarea"
                    rows={5}
                    placeholder="Contoh: Data tidak lengkap, bukti tidak valid, penilaian tidak sesuai..."
                    value={rejectAlasan}
                    onChange={e => setRejectAlasan(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-outline"
                  onClick={() => setShowReject(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleReject}
                  disabled={isSubmitting || !rejectAlasan.trim()}
                >
                  {isSubmitting ? 'Memproses...' : 'Konfirmasi Tolak'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
