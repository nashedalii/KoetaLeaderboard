'use client'

import { useState } from 'react'

interface KriteriaPoin {
  id: number
  teks: string
}

interface KategoriPenilaian {
  id: number
  nama: string
  bobot: number
  warna: string
  deskripsi: string
  kriteria: KriteriaPoin[]
}

export default function KategoriPenilaianAdmin() {
  const [kategoris, setKategoris] = useState<KategoriPenilaian[]>([
    {
      id: 1,
      nama: 'Etika & Adab',
      bobot: 25,
      warna: '#ef4444',
      deskripsi: 'Mengacu pada perilaku dan tata krama sopan santun pramudi saat bekerja',
      kriteria: [
        { id: 1, teks: 'Cara berinteraksi dengan penumpang (ramah, sopan, tidak kasar)' },
        { id: 2, teks: 'Etika dalam berbicara, dan bersikap' },
        { id: 3, teks: 'Menghormati sesama petugas, atasan, dan penumpang' },
        { id: 4, teks: 'Tidak menunjukkan sikap arogan atau tidak profesional' },
        { id: 5, teks: 'Sapaan & komunikasi: menyapa, nada suara tenang, tidak membentak' },
        { id: 6, teks: 'Membantu penumpang rentan: difabel, lansia, ibu hamil, anak-anak' },
        { id: 7, teks: 'Tidak diskriminatif: layanan setara tanpa memandang latar belakang' },
        { id: 8, teks: 'Mengelola konflik: menenangkan situasi, tidak terpancing emosi' },
        { id: 9, teks: 'Kepatuhan etika layanan: tidak merokok, tidak makan/minum saat mengemudi, tidak memutar musik keras' }
      ]
    },
    {
      id: 2,
      nama: 'Kedisiplinan',
      bobot: 20,
      warna: '#f59e0b',
      deskripsi: 'Menilai kedisiplinan pramudi dalam hal waktu dan aturan',
      kriteria: [
        { id: 1, teks: 'Datang tepat waktu sesuai jadwal kerja' },
        { id: 2, teks: 'Menaati jam operasional yang ditentukan' },
        { id: 3, teks: 'Tidak boleh absen tanpa keterangan yang jelas' },
        { id: 4, teks: 'Ketepatan hadir/berangkat (on-time start/finish, headway)' },
        { id: 5, teks: 'Kepatuhan SOP: pemeriksaan pra-berangkat, prosedur berhenti/naik-turun' },
        { id: 6, teks: 'Kepatuhan jadwal istirahat & pergantian kru' },
        { id: 7, teks: 'Administrasi: isi logbook, serah terima unit' }
      ]
    },
    {
      id: 3,
      nama: 'Loyalitas',
      bobot: 20,
      warna: '#10b981',
      deskripsi: 'Mengukur komitmen dan tanggung jawab terhadap pekerjaan',
      kriteria: [
        { id: 1, teks: 'Kesetiaan terhadap perusahaan/operator' },
        { id: 2, teks: 'Tidak terlibat dalam pelanggaran yang merugikan instansi' },
        { id: 3, teks: 'Tidak berpindah-pindah armada tanpa prosedur resmi' },
        { id: 4, teks: 'Ketersediaan membantu saat kekurangan kru/shift darurat (terukur jam/kali)' },
        { id: 5, teks: 'Kepatuhan kebijakan: tidak menyalahgunakan fasilitas, tidak menyebar citra buruk' },
        { id: 6, teks: 'Partisipasi pelatihan/briefing & memberi masukan perbaikan' },
        { id: 7, teks: 'Stabilitas: tidak sering cuti mendadak/bolos' },
        { id: 8, teks: 'Membantu pihak dinas dalam kegiatan-kegiatan tertentu' }
      ]
    },
    {
      id: 4,
      nama: 'Skill Mengemudi',
      bobot: 15,
      warna: '#3b82f6',
      deskripsi: 'Menilai kemampuan teknis dalam mengemudikan bus',
      kriteria: [
        { id: 1, teks: 'Mengemudi dengan aman dan lancar' },
        { id: 2, teks: 'Mampu mengatasi situasi lalu lintas yang sulit' },
        { id: 3, teks: 'Tidak melakukan pelanggaran lalu lintas' },
        { id: 4, teks: 'Mampu menjaga kenyamanan penumpang selama perjalanan' },
        { id: 5, teks: 'Defensive driving: antisipasi bahaya, jaga jarak' },
        { id: 6, teks: 'Halus: akselerasi & pengereman tidak mendadak; manuver stabil' },
        { id: 7, teks: 'Kepatuhan lalu lintas: marka, batas kecepatan, lampu isyarat' },
        { id: 8, teks: 'Teknik khusus: parkir & berhenti di halte ketika naik turun penumpang, putar balik, medan sempit/menanjak' },
        { id: 9, teks: 'Manajemen risiko: tidak memakai HP saat berkendara, fokus' },
        { id: 10, teks: 'Mematuhi seluruh peraturan lalu lintas yang berlaku' }
      ]
    },
    {
      id: 5,
      nama: 'Perawatan Kendaraan',
      bobot: 10,
      warna: '#8b5cf6',
      deskripsi: 'Penilaian ini berfokus pada tanggung jawab super crew terhadap kondisi armada',
      kriteria: [
        { id: 1, teks: 'Melaporkan jika ada kerusakan kendaraan' },
        { id: 2, teks: 'Tidak sembarangan memperlakukan kendaraan' },
        { id: 3, teks: 'Checklist pra-jalan & pasca-jalan: lampu, rem, wiper, pintu, ban, kaca, P3K, APAR' },
        { id: 4, teks: 'Pelaporan kerusakan cepat & jelas (form/aplikasi)' },
        { id: 5, teks: 'Kebersihan kabin & eksterior sepanjang operasi' },
        { id: 6, teks: 'Penggunaan peralatan (mis. AC, ramp difabel) sesuai SOP' },
        { id: 7, teks: 'Kepedulian: mencegah kerusakan berulang, tidak kasar memakai unit' },
        { id: 8, teks: 'Pengisian logbook terhadap perawatan berkala (form terlampir)' }
      ]
    },
    {
      id: 6,
      nama: 'Performa',
      bobot: 10,
      warna: '#ec4899',
      deskripsi: 'Menilai kinerja keseluruhan selama menjalankan tugas',
      kriteria: [
        { id: 1, teks: 'Ketepatan waktu tiba dan berangkat' },
        { id: 2, teks: 'Jumlah trip yang berhasil diselesaikan' },
        { id: 3, teks: 'Konsistensi kualitas layanan' },
        { id: 4, teks: 'Tidak ada keluhan dari penumpang terkait performa' },
        { id: 5, teks: 'Kualitas perjalanan: berhenti di halte yang benar, time table terkendali' },
        { id: 6, teks: 'Efisiensi: konsumsi BBM wajar (indikasi eco-driving), minim idle' },
        { id: 7, teks: 'Penanganan situasi: hujan, macet, gangguan rute tetap aman & lancar' },
        { id: 8, teks: 'Zero accident: bebas insiden karena kelalaian' },
        { id: 9, teks: 'Berpakaian sesuai SOP' }
      ]
    }
  ])

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [selectedKategori, setSelectedKategori] = useState<KategoriPenilaian | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    nama: '',
    warna: '#667eea',
    deskripsi: '',
    kriteria: [{ id: 1, teks: '' }]
  })

  // Handle Add Kategori
  const handleAddKategori = () => {
    setModalMode('add')
    setFormData({
      nama: '',
      warna: '#667eea',
      deskripsi: '',
      kriteria: [{ id: 1, teks: '' }]
    })
    setShowModal(true)
  }

  // Handle Edit Kategori
  const handleEditKategori = (kategori: KategoriPenilaian) => {
    setModalMode('edit')
    setSelectedKategori(kategori)
    setFormData({
      nama: kategori.nama,
      warna: kategori.warna,
      deskripsi: kategori.deskripsi,
      kriteria: [...kategori.kriteria] // Copy kriteria yang ada
    })
    setShowModal(true)
  }

  // Handle Delete Kategori
  const handleDeleteKategori = (kategori: KategoriPenilaian) => {
    setSelectedKategori(kategori)
    setShowDeleteModal(true)
  }

  // Confirm Delete
  const confirmDelete = () => {
    if (selectedKategori) {
      setKategoris(kategoris.filter(k => k.id !== selectedKategori.id))
      setShowDeleteModal(false)
      setSelectedKategori(null)
    }
  }

  // Handle Save
  const handleSave = () => {
    if (!formData.nama || !formData.deskripsi) {
      alert('Nama dan Deskripsi harus diisi!')
      return
    }

    const validKriteria = formData.kriteria.filter(k => k.teks.trim() !== '')
    if (validKriteria.length === 0) {
      alert('Minimal harus ada 1 kriteria penilaian!')
      return
    }

    if (modalMode === 'add') {
      const newKategori: KategoriPenilaian = {
        id: Math.max(...kategoris.map(k => k.id), 0) + 1,
        nama: formData.nama,
        bobot: 0, // Default 0, diatur di Konfigurasi Penilaian
        warna: formData.warna,
        deskripsi: formData.deskripsi,
        kriteria: validKriteria
      }
      setKategoris([...kategoris, newKategori])
    } else {
      setKategoris(kategoris.map(k =>
        k.id === selectedKategori?.id
          ? {
              ...k,
              nama: formData.nama,
              warna: formData.warna,
              deskripsi: formData.deskripsi,
              kriteria: validKriteria
            }
          : k
      ))
    }

    setShowModal(false)
    setSelectedKategori(null)
  }

  // Add Kriteria Point
  const addKriteriaPoint = () => {
    const newId = Math.max(...formData.kriteria.map(k => k.id), 0) + 1
    setFormData({
      ...formData,
      kriteria: [...formData.kriteria, { id: newId, teks: '' }]
    })
  }

  // Remove Kriteria Point
  const removeKriteriaPoint = (id: number) => {
    if (formData.kriteria.length > 1) {
      setFormData({
        ...formData,
        kriteria: formData.kriteria.filter(k => k.id !== id)
      })
    }
  }

  // Update Kriteria Point
  const updateKriteriaPoint = (id: number, teks: string) => {
    setFormData({
      ...formData,
      kriteria: formData.kriteria.map(k =>
        k.id === id ? { ...k, teks } : k
      )
    })
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Kategori Penilaian</h1>
            <p className="page-subtitle">Kelola indikator dan kriteria penilaian driver. Bobot diatur di Konfigurasi Penilaian.</p>
          </div>
          <button onClick={handleAddKategori} className="btn-primary">
            ➕ Tambah Kategori
          </button>
        </div>

        {/* Kategori Cards */}
        <div className="kategori-admin-grid">
          {kategoris.map((kategori) => (
            <div key={kategori.id} className="kategori-admin-card" style={{ borderLeftColor: kategori.warna }}>
              <div className="kategori-admin-header">
                <div className="kategori-admin-icon" style={{ backgroundColor: kategori.warna }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="kategori-admin-info">
                  <h3>{kategori.nama}</h3>
                  <span className="kategori-bobot-badge" style={{ backgroundColor: kategori.warna }}>
                    {kategori.bobot}%
                  </span>
                </div>
              </div>
              
              <p className="kategori-admin-desc">{kategori.deskripsi}</p>
              
              <div className="kategori-admin-kriteria">
                <strong>{kategori.kriteria.length} Kriteria Penilaian</strong>
                <ul>
                  {kategori.kriteria.slice(0, 3).map((k) => (
                    <li key={k.id}>• {k.teks}</li>
                  ))}
                  {kategori.kriteria.length > 3 && (
                    <li className="more-items">... dan {kategori.kriteria.length - 3} lainnya</li>
                  )}
                </ul>
              </div>

              <div className="kategori-admin-actions">
                <button onClick={() => handleEditKategori(kategori)} className="btn-edit-small">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Edit
                </button>
                <button onClick={() => handleDeleteKategori(kategori)} className="btn-delete-small">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{modalMode === 'add' ? '➕ Tambah Kategori Baru' : '✏️ Edit Kategori'}</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">✕</button>
              </div>

              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nama Kategori *</label>
                    <input
                      type="text"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      placeholder="Contoh: Etika & Adab"
                    />
                  </div>

                  <div className="form-group form-group-small">
                    <label>Warna</label>
                    <input
                      type="color"
                      value={formData.warna}
                      onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                      className="color-picker"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Deskripsi Singkat *</label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Jelaskan secara singkat apa yang dinilai dalam kategori ini..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <div className="kriteria-header">
                    <label>Kriteria Penilaian *</label>
                    <button onClick={addKriteriaPoint} className="btn-add-kriteria">
                      ➕ Tambah Poin
                    </button>
                  </div>
                  
                  <div className="kriteria-list">
                    {formData.kriteria.map((kriteria, index) => (
                      <div key={kriteria.id} className="kriteria-item">
                        <span className="kriteria-number">{index + 1}</span>
                        <input
                          type="text"
                          value={kriteria.teks}
                          onChange={(e) => updateKriteriaPoint(kriteria.id, e.target.value)}
                          placeholder="Masukkan kriteria penilaian..."
                          className="kriteria-input"
                        />
                        {formData.kriteria.length > 1 && (
                          <button
                            onClick={() => removeKriteriaPoint(kriteria.id)}
                            className="btn-remove-kriteria"
                            title="Hapus poin"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={() => setShowModal(false)} className="btn-secondary">
                  Batal
                </button>
                <button onClick={handleSave} className="btn-primary">
                  {modalMode === 'add' ? '➕ Tambah' : '💾 Simpan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedKategori && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🗑️ Hapus Kategori</h2>
                <button onClick={() => setShowDeleteModal(false)} className="modal-close">✕</button>
              </div>

              <div className="modal-body">
                <p>Apakah Anda yakin ingin menghapus kategori <strong>{selectedKategori.nama}</strong>?</p>
                <p className="warning-text">⚠️ Tindakan ini tidak dapat dibatalkan!</p>
              </div>

              <div className="modal-footer">
                <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">
                  Batal
                </button>
                <button onClick={confirmDelete} className="btn-danger">
                  🗑️ Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
