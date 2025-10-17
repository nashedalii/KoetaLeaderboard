// Data dummy untuk users (Driver & Petugas)

export interface SkorBulanan {
  bulan: string // Format: "Januari/2025"
  skor: {
    etikaAdab: number
    disiplin: number
    loyalitas: number
    skillMengemudi: number
    perawatanKendaraan: number
    performa: number
  }
}

export interface User {
  id: number
  nama: string
  email: string
  role: 'Admin' | 'Petugas' | 'Supir'
  status: 'Aktif' | 'Nonaktif'
  password?: string
  
  // Data khusus untuk Supir
  namaKernet?: string
  namaArmada?: 'A' | 'B' | 'C'
  skor?: {
    etikaAdab: number
    disiplin: number
    loyalitas: number
    skillMengemudi: number
    perawatanKendaraan: number
    performa: number
  }
  skorBulanan?: SkorBulanan[]
}

export const dummyUsers: User[] = [
  // Admin (dari login credentials)
  {
    id: 1,
    nama: 'Admin Dishub',
    email: 'admin@dishub.aceh.go.id',
    role: 'Admin',
    status: 'Aktif',
    password: 'admin123'
  },
  
  // Petugas (2 orang)
  {
    id: 2,
    nama: 'Suryadi',
    email: 'suryadi@dishub.aceh.go.id',
    role: 'Petugas',
    status: 'Aktif',
    password: 'petugas123'
  },
  {
    id: 3,
    nama: 'Cut Nyak Dien',
    email: 'cutnyak@dishub.aceh.go.id',
    role: 'Petugas',
    status: 'Aktif',
    password: 'petugas123'
  },
  
  // Supir/Driver (10 orang)
  {
    id: 4,
    nama: 'Ridho Saputra',
    email: 'ridho.saputra@dishub.aceh.go.id',
    role: 'Supir',
    status: 'Aktif',
    password: 'supir123',
    namaKernet: 'Ahmad Fauzi',
    namaArmada: 'A',
    skor: {
      etikaAdab: 85,
      disiplin: 90,
      loyalitas: 88,
      skillMengemudi: 92,
      perawatanKendaraan: 87,
      performa: 89
    },
    skorBulanan: [
      {
        bulan: 'Januari/2025',
        skor: {
          etikaAdab: 83,
          disiplin: 88,
          loyalitas: 86,
          skillMengemudi: 90,
          perawatanKendaraan: 85,
          performa: 87
        }
      },
      {
        bulan: 'Februari/2025',
        skor: {
          etikaAdab: 85,
          disiplin: 89,
          loyalitas: 87,
          skillMengemudi: 91,
          perawatanKendaraan: 86,
          performa: 88
        }
      },
      {
        bulan: 'Maret/2025',
        skor: {
          etikaAdab: 87,
          disiplin: 91,
          loyalitas: 89,
          skillMengemudi: 93,
          perawatanKendaraan: 88,
          performa: 90
        }
      }
    ]
  },
  {
    id: 5,
    nama: 'Muhammad Yusuf',
    email: 'm.yusuf@dishub.aceh.go.id',
    role: 'Supir',
    status: 'Aktif',
    password: 'supir123',
    namaKernet: 'Syahrul Ramadhan',
    namaArmada: 'A',
    skor: {
      etikaAdab: 88,
      disiplin: 85,
      loyalitas: 90,
      skillMengemudi: 87,
      perawatanKendaraan: 89,
      performa: 91
    },
    skorBulanan: [
      {
        bulan: 'Januari/2025',
        skor: {
          etikaAdab: 86,
          disiplin: 83,
          loyalitas: 88,
          skillMengemudi: 85,
          perawatanKendaraan: 87,
          performa: 89
        }
      },
      {
        bulan: 'Februari/2025',
        skor: {
          etikaAdab: 87,
          disiplin: 84,
          loyalitas: 89,
          skillMengemudi: 86,
          perawatanKendaraan: 88,
          performa: 90
        }
      },
      {
        bulan: 'Maret/2025',
        skor: {
          etikaAdab: 89,
          disiplin: 86,
          loyalitas: 91,
          skillMengemudi: 88,
          perawatanKendaraan: 90,
          performa: 92
        }
      }
    ]
  },
  {
    id: 6,
    nama: 'Teuku Umar',
    email: 'teuku.umar@dishub.aceh.go.id',
    role: 'Supir',
    status: 'Aktif',
    password: 'supir123',
    namaKernet: 'Dedi Kurniawan',
    namaArmada: 'B',
    skor: {
      etikaAdab: 90,
      disiplin: 88,
      loyalitas: 92,
      skillMengemudi: 89,
      perawatanKendaraan: 85,
      performa: 88
    },
    skorBulanan: [
      {
        bulan: 'Januari/2025',
        skor: {
          etikaAdab: 88,
          disiplin: 86,
          loyalitas: 90,
          skillMengemudi: 87,
          perawatanKendaraan: 83,
          performa: 86
        }
      },
      {
        bulan: 'Februari/2025',
        skor: {
          etikaAdab: 89,
          disiplin: 87,
          loyalitas: 91,
          skillMengemudi: 88,
          perawatanKendaraan: 84,
          performa: 87
        }
      },
      {
        bulan: 'Maret/2025',
        skor: {
          etikaAdab: 91,
          disiplin: 89,
          loyalitas: 93,
          skillMengemudi: 90,
          perawatanKendaraan: 86,
          performa: 89
        }
      }
    ]
  },
  {
    id: 7,
    nama: 'Zulfikar Achmad',
    email: 'zulfikar.a@dishub.aceh.go.id',
    role: 'Supir',
    status: 'Aktif',
    password: 'supir123',
    namaKernet: 'Rahmat Hidayat',
    namaArmada: 'B',
    skor: {
      etikaAdab: 87,
      disiplin: 90,
      loyalitas: 86,
      skillMengemudi: 91,
      perawatanKendaraan: 88,
      performa: 90
    }
  },
  {
    id: 8,
    nama: 'Iskandar Muda',
    email: 'iskandar.m@dishub.aceh.go.id',
    role: 'Supir',
    status: 'Aktif',
    password: 'supir123',
    namaKernet: '',
    namaArmada: 'C',
    skor: {
      etikaAdab: 92,
      disiplin: 89,
      loyalitas: 91,
      skillMengemudi: 90,
      perawatanKendaraan: 87,
      performa: 89
    },
    skorBulanan: [
      {
        bulan: 'Januari/2025',
        skor: {
          etikaAdab: 90,
          disiplin: 87,
          loyalitas: 89,
          skillMengemudi: 88,
          perawatanKendaraan: 85,
          performa: 87
        }
      },
      {
        bulan: 'Februari/2025',
        skor: {
          etikaAdab: 91,
          disiplin: 88,
          loyalitas: 90,
          skillMengemudi: 89,
          perawatanKendaraan: 86,
          performa: 88
        }
      },
      {
        bulan: 'Maret/2025',
        skor: {
          etikaAdab: 93,
          disiplin: 90,
          loyalitas: 92,
          skillMengemudi: 91,
          perawatanKendaraan: 88,
          performa: 90
        }
      }
    ]
  },
  {
    id: 9,
    nama: 'Faisal Rahman',
    email: 'faisal.r@dishub.aceh.go.id',
    role: 'Supir',
    status: 'Nonaktif',
    password: 'supir123',
    namaKernet: '',
    namaArmada: 'C',
    skor: {
      etikaAdab: 78,
      disiplin: 75,
      loyalitas: 80,
      skillMengemudi: 82,
      perawatanKendaraan: 76,
      performa: 79
    }
  },
  {
    id: 10,
    nama: 'Budiman Santoso',
    email: 'budiman.s@dishub.aceh.go.id',
    role: 'Supir',
    status: 'Aktif',
    password: 'supir123',
    namaKernet: 'Andi Wijaya',
    namaArmada: 'A',
    skor: {
      etikaAdab: 89,
      disiplin: 91,
      loyalitas: 88,
      skillMengemudi: 90,
      perawatanKendaraan: 92,
      performa: 91
    },
    skorBulanan: [
      {
        bulan: 'Januari/2025',
        skor: {
          etikaAdab: 87,
          disiplin: 89,
          loyalitas: 86,
          skillMengemudi: 88,
          perawatanKendaraan: 90,
          performa: 89
        }
      },
      {
        bulan: 'Februari/2025',
        skor: {
          etikaAdab: 88,
          disiplin: 90,
          loyalitas: 87,
          skillMengemudi: 89,
          perawatanKendaraan: 91,
          performa: 90
        }
      },
      {
        bulan: 'Maret/2025',
        skor: {
          etikaAdab: 90,
          disiplin: 92,
          loyalitas: 89,
          skillMengemudi: 91,
          perawatanKendaraan: 93,
          performa: 92
        }
      }
    ]
  },
  {
    id: 11,
    nama: 'Rizki Firmansyah',
    email: 'rizki.f@dishub.aceh.go.id',
    role: 'Supir',
    status: 'Aktif',
    password: 'supir123',
    namaKernet: 'Budi Santoso',
    namaArmada: 'B',
    skor: {
      etikaAdab: 86,
      disiplin: 88,
      loyalitas: 87,
      skillMengemudi: 89,
      perawatanKendaraan: 90,
      performa: 88
    }
  },
  {
    id: 12,
    nama: 'Harun Al-Rashid',
    email: 'harun.ar@dishub.aceh.go.id',
    role: 'Supir',
    status: 'Aktif',
    password: 'supir123',
    namaKernet: '',
    namaArmada: 'C',
    skor: {
      etikaAdab: 91,
      disiplin: 87,
      loyalitas: 89,
      skillMengemudi: 88,
      perawatanKendaraan: 86,
      performa: 90
    }
  },
  {
    id: 13,
    nama: 'Agus Setiawan',
    email: 'agus.s@dishub.aceh.go.id',
    role: 'Supir',
    status: 'Nonaktif',
    password: 'supir123',
    namaKernet: 'Chandra Kusuma',
    namaArmada: 'A',
    skor: {
      etikaAdab: 80,
      disiplin: 79,
      loyalitas: 81,
      skillMengemudi: 83,
      perawatanKendaraan: 78,
      performa: 80
    }
  }
]
