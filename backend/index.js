import express from "express";
import cors from "cors";
import pool from "./db.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Backend berjalan dengan baik!", 
    timestamp: new Date().toISOString() 
  });
});

// Test database connection
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as current_time, version() as postgres_version");
    res.json({ 
      success: true, 
      message: "Koneksi ke Supabase berhasil!",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("DB connection error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Koneksi ke database gagal",
      error: err.message 
    });
  }
});

// Login endpoint untuk frontend
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simulasi validasi (ganti dengan logic sebenarnya)
    if (username && password) {
      res.json({
        success: true,
        message: "Login berhasil!",
        user: { username },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Username dan password harus diisi"
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: err.message
    });
  }
});

// Test endpoint untuk melihat semua tables di database
app.get("/test-tables", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    res.json({
      success: true,
      message: "Berhasil mengambil daftar tabel",
      tables: result.rows
    });
  } catch (err) {
    console.error("Tables query error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar tabel",
      error: err.message
    });
  }
});

app.listen(5000, () => console.log("✅ Server running on port 5000"));
