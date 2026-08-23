require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { pool } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with Credentials (for httpOnly cookies)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    service: 'Aplikasi Inventaris Kantor API'
  });
});

// API Routes (mendukung akses lokal /api dan serverless function Netlify /)
app.use('/api', routes);
app.use('/', routes);

// Centralized Error Handler (Development Rules §2.5)
app.use(errorHandler);

// Start Server only in standalone mode
if (require.main === module) {
  const startServer = async () => {
    try {
      const client = await pool.connect();
      console.log('✅ Terhubung ke database PostgreSQL.');
      client.release();

      app.listen(PORT, () => {
        console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error('❌ Gagal terhubung ke database:', err.message);
      console.log('⚠️ Server tetap berjalan untuk menerima request...');
      app.listen(PORT, () => {
        console.log(`🚀 Server berjalan di http://localhost:${PORT} (Database pending)`);
      });
    }
  };

  startServer();
}

module.exports = app;
