'use client'

export default function AdminDashboard() {
  return (
    <div className="dashboard-container">
      {/* Main Content */}
      <div className="dashboard-content">
        <h1 className="page-title">Dashboard Admin</h1>
        
        <div className="stats-grid">
          {/* Jumlah Driver Aktif */}
          <div className="stat-card driver-card">
            <div className="stat-header">
              <h3>Jumlah Driver Aktif</h3>
              <div className="stat-icon driver-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </div>
            <div className="stat-number">93</div>
            <div className="stat-trend positive">
              <span>+12% dari bulan lalu</span>
            </div>
          </div>

          {/* Jumlah Armada Aktif */}
          <div className="stat-card armada-card">
            <div className="stat-header">
              <h3>Jumlah Armada Aktif</h3>
              <div className="stat-icon armada-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0V7.875c0-1.036.84-1.875 1.875-1.875h3.75c1.035 0 1.875.84 1.875 1.875v10.875a1.5 1.5 0 01-3 0M3.75 18.75h16.5M12 11.25h.008v.008H12V11.25zm0 0V9a1.5 1.5 0 011.5-1.5h1.5V9M3.75 18.75V9h1.5v9.75M12 9v2.25" />
                </svg>
              </div>
            </div>
            <div className="stat-number">45</div>
            <div className="stat-trend positive">
              <span>+8% dari bulan lalu</span>
            </div>
          </div>

          {/* Data Pending Validasi (menggantikan Keluhan Masuk) */}
          <div className="stat-card validation-card">
            <div className="stat-header">
              <h3>Data Pending Validasi</h3>
              <div className="stat-icon validation-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="stat-number">
              <span className="main-number">8</span>
              <span className="pending-text">Pending</span>
            </div>
            <div className="stat-trend negative">
              <span>Perlu review & approval</span>
            </div>
          </div>

          {/* Top 10 Driver */}
          <div className="stat-card leaderboard-card">
            <div className="stat-header">
              <h3>Top 10 Driver</h3>
              <div className="stat-icon leaderboard-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-2.125m0 0a9.003 9.003 0 01-9.006 0m0 0a7.456 7.456 0 00-.982 2.125M15.75 9.75M15.75 9.75a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0zm0 0c0 1.677-.357 3.276-1.006 4.72M9.75 9.75c0 1.677.357 3.276 1.006 4.72" />
                </svg>
              </div>
            </div>
            <div className="leaderboard-content">
              <div className="leaderboard-action">
                <span className="action-text">Lihat Detail</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="arrow-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
            <div className="stat-trend neutral">
              <span>Ranking berdasarkan performa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
