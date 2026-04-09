'use client'

import { useState } from 'react'

interface KategoriItem {
  id: number
  nama: string
  bobot: number
  warna: string
  deskripsi: string
  poin: string[]
}

export default function KategoriPenilaian() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const kategoriData: KategoriItem[] = [
    {
      id: 1,
      nama: 'Etika & Adab',
      bobot: 25,
      warna: '#ef4444',
      deskripsi: 'Mengacu pada perilaku dan tata krama sopan santun pramudi saat bekerja, seperti:',
      poin: [
        'Cara berinteraksi dengan penumpang (ramah, sopan, tidak kasar)',
        'Etika dalam berbicara, dan bersikap',
        'Menghormati sesama petugas, atasan, dan penumpang',
        'Tidak menunjukkan sikap arogan atau tidak profesional',
        'Sapaan & komunikasi: menyapa, nada suara tenang, tidak membentak',
        'Membantu penumpang rentan: difabel, lansia, ibu hamil, anak-anak',
        'Tidak diskriminatif: layanan setara tanpa memandang latar belakang',
        'Mengelola konflik: menenangkan situasi, tidak terpancing emosi',
        'Kepatuhan etika layanan: tidak merokok, tidak makan/minum saat mengemudi, tidak memutar musik keras'
      ]
    },
    {
      id: 2,
      nama: 'Kedisiplinan',
      bobot: 20,
      warna: '#f59e0b',
      deskripsi: 'Menilai kedisiplinan pramudi dalam hal:',
      poin: [
        'Datang tepat waktu sesuai jadwal kerja',
        'Menaati jam operasional yang ditentukan',
        'Tidak boleh absen tanpa keterangan yang jelas',
        'Ketepatan hadir/berangkat (on-time start/finish, headway)',
        'Kepatuhan SOP: pemeriksaan pra-berangkat, prosedur berhenti/naik-turun',
        'Kepatuhan jadwal istirahat & pergantian kru',
        'Administrasi: isi logbook, serah terima unit'
      ]
    },
    {
      id: 3,
      nama: 'Loyalitas',
      bobot: 20,
      warna: '#10b981',
      deskripsi: 'Mengukur seberapa besar komitmen dan rasa tanggung jawab super crew terhadap pekerjaannya:',
      poin: [
        'Kesetiaan terhadap perusahaan/operator',
        'Tidak terlibat dalam pelanggaran yang merugikan instansi',
        'Tidak berpindah-pindah armada tanpa prosedur resmi',
        'Ketersediaan membantu saat kekurangan kru/shift darurat (terukur jam/kali)',
        'Kepatuhan kebijakan: tidak menyalahgunakan fasilitas, tidak menyebar citra buruk',
        'Partisipasi pelatihan/briefing & memberi masukan perbaikan',
        'Stabilitas: tidak sering cuti mendadak/bolos',
        'Membantu pihak dinas dalam kegiatan-kegiatan tertentu'
      ]
    },
    {
      id: 4,
      nama: 'Skill Mengemudi',
      bobot: 15,
      warna: '#3b82f6',
      deskripsi: 'Menilai kemampuan teknis dalam mengemudikan bus:',
      poin: [
        'Mengemudi dengan aman dan lancar',
        'Mampu mengatasi situasi lalu lintas yang sulit',
        'Tidak melakukan pelanggaran lalu lintas',
        'Mampu menjaga kenyamanan penumpang selama perjalanan',
        'Defensive driving: antisipasi bahaya, jaga jarak',
        'Halus: akselerasi & pengereman tidak mendadak; manuver stabil',
        'Kepatuhan lalu lintas: marka, batas kecepatan, lampu isyarat',
        'Teknik khusus: parkir & berhenti di halte ketika naik turun penumpang, putar balik, medan sempit/menanjak',
        'Manajemen risiko: tidak memakai HP saat berkendara, fokus',
        'Mematuhi seluruh peraturan lalu lintas yang berlaku'
      ]
    },
    {
      id: 5,
      nama: 'Perawatan Kendaraan',
      bobot: 10,
      warna: '#8b5cf6',
      deskripsi: 'Penilaian ini berfokus pada tanggung jawab super crew terhadap kondisi armada:',
      poin: [
        'Melaporkan jika ada kerusakan kendaraan',
        'Tidak sembarangan memperlakukan kendaraan',
        'Checklist pra-jalan & pasca-jalan: lampu, rem, wiper, pintu, ban, kaca, P3K, APAR',
        'Pelaporan kerusakan cepat & jelas (form/aplikasi)',
        'Kebersihan kabin & eksterior sepanjang operasi',
        'Penggunaan peralatan (mis. AC, ramp difabel) sesuai SOP',
        'Kepedulian: mencegah kerusakan berulang, tidak kasar memakai unit',
        'Pengisian logbook terhadap perawatan berkala (form terlampir)'
      ]
    },
    {
      id: 6,
      nama: 'Performa',
      bobot: 10,
      warna: '#ec4899',
      deskripsi: 'Menilai kinerja keseluruhan selama menjalankan tugas, termasuk:',
      poin: [
        'Ketepatan waktu tiba dan berangkat',
        'Jumlah trip yang berhasil diselesaikan',
        'Konsistensi kualitas layanan',
        'Tidak ada keluhan dari penumpang terkait performa',
        'Kualitas perjalanan: berhenti di halte yang benar, time table terkendali',
        'Efisiensi: konsumsi BBM wajar (indikasi eco-driving), minim idle (meminimalkan waktu mesin kendaraan menyala tanpa bergerak)',
        'Penanganan situasi: hujan, macet, gangguan rute tetap aman & lancar',
        'Zero accident: bebas insiden karena kelalaian',
        'Berpakaian sesuai SOP'
      ]
    }
  ]

  const toggleExpand = (id: number) => {
    console.log('Clicked ID:', id, 'Current expandedId:', expandedId)
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">Kategori Penilaian Driver</h1>
          <p className="page-subtitle">Indikator dan kriteria penilaian performa driver</p>
        </div>

        <div className="kategori-penilaian-container">
          {/* Info Box */}
          <div className="kategori-info-box">
            <svg 
              className="kategori-info-icon" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <div className="kategori-info-content">
              <h3>Sistem Penilaian Berbobot</h3>
              <p>Penilaian driver menggunakan 6 kategori dengan total bobot 100%. Klik setiap kategori untuk melihat detail kriteria penilaian.</p>
            </div>
          </div>

          {/* Kategori Cards Grid */}
          <div className="kategori-grid">
            {kategoriData.map((kategori) => (
              <div 
                key={kategori.id} 
                data-kategori-id={kategori.id}
                className={`kategori-card ${expandedId === kategori.id ? 'expanded' : ''}`}
                style={{ borderColor: expandedId === kategori.id ? kategori.warna : 'transparent' }}
              >
                <div 
                  className="kategori-header"
                  onClick={() => toggleExpand(kategori.id)}
                >
                  <div className="kategori-header-left">
                    <div 
                      className="kategori-icon-wrapper" 
                      style={{ backgroundColor: kategori.warna }}
                    >
                      <svg 
                        className="kategori-icon" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={2} 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="kategori-header-text">
                      <h3>{kategori.nama}</h3>
                      <p>{kategori.poin.length} kriteria penilaian</p>
                    </div>
                  </div>
                  <div className="kategori-header-right">
                    <span 
                      className="kategori-bobot-badge"
                      style={{ backgroundColor: kategori.warna }}
                    >
                      {kategori.bobot}%
                    </span>
                    <svg 
                      className="kategori-toggle-icon" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={2.5} 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                <div className="kategori-content">
                  <div className="kategori-content-inner">
                    <p 
                      className="kategori-deskripsi"
                      style={{ borderLeftColor: kategori.warna }}
                    >
                      {kategori.deskripsi}
                    </p>
                    <h4 className="kategori-poin-title">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={2} 
                        stroke="currentColor"
                        style={{ width: '20px', height: '20px' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Kriteria Penilaian
                    </h4>
                    <ul className="kategori-poin-list">
                      {kategori.poin.map((poin, index) => (
                        <li key={index} className="kategori-poin-item">
                          <span 
                            className="kategori-poin-bullet" 
                            style={{ backgroundColor: kategori.warna }}
                          ></span>
                          {poin}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Section */}
          <div className="kategori-summary">
            <h3 className="kategori-summary-title">Distribusi Bobot Penilaian</h3>
            <div className="kategori-summary-grid">
              {kategoriData.map((kategori) => (
                <div key={kategori.id} className="kategori-summary-item">
                  <div className="kategori-summary-label">
                    <span 
                      className="kategori-summary-color" 
                      style={{ backgroundColor: kategori.warna }}
                    ></span>
                    {kategori.nama}
                  </div>
                  <div className="kategori-progress-bar">
                    <div 
                      className="kategori-progress-fill" 
                      style={{ 
                        width: `${kategori.bobot}%`,
                        backgroundColor: kategori.warna 
                      }}
                    >
                      {kategori.bobot}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
