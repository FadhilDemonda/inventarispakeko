-- Extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabel Users (Admin)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Barang (Peralatan Kantor dengan Stok)
CREATE TABLE IF NOT EXISTS barang (
    id SERIAL PRIMARY KEY,
    nama_barang VARCHAR(255) NOT NULL,
    kondisi VARCHAR(50) DEFAULT 'Baik', -- 'Baik', 'Rusak Ringan', 'Rusak Berat'
    total_jumlah INTEGER NOT NULL DEFAULT 0,
    jumlah_tersedia INTEGER NOT NULL DEFAULT 0,
    jumlah_digunakan INTEGER NOT NULL DEFAULT 0,
    tanggal_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_jumlah_tersedia_non_negative CHECK (jumlah_tersedia >= 0),
    CONSTRAINT check_total_jumlah_positive CHECK (total_jumlah >= 0)
);

-- Index pencarian barang
CREATE INDEX IF NOT EXISTS idx_barang_nama ON barang(nama_barang);

-- 3. Tabel Kendaraan (Aset dengan Plat Nomor & Pajak)
CREATE TABLE IF NOT EXISTS kendaraan (
    id SERIAL PRIMARY KEY,
    nama_kendaraan VARCHAR(255) NOT NULL,
    nomor_plat VARCHAR(50) UNIQUE NOT NULL,
    satker VARCHAR(100) NOT NULL,
    tanggal_pajak DATE NOT NULL,
    keterangan TEXT,
    peminjam VARCHAR(255) DEFAULT NULL, -- Nama peminjam aktif jika sedang dipinjam
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pencarian kendaraan
CREATE INDEX IF NOT EXISTS idx_kendaraan_nama ON kendaraan(nama_kendaraan);
CREATE INDEX IF NOT EXISTS idx_kendaraan_plat ON kendaraan(nomor_plat);
CREATE INDEX IF NOT EXISTS idx_kendaraan_pajak ON kendaraan(tanggal_pajak);

-- 4. Tabel Transaksi (Peminjaman & Pengembalian)
CREATE TABLE IF NOT EXISTS transaksi (
    id SERIAL PRIMARY KEY,
    nomor_surat VARCHAR(100) DEFAULT NULL, -- Nomor surat dinas / permohonan peminjaman (opsional)
    item_type VARCHAR(20) NOT NULL, -- 'barang' | 'kendaraan'
    item_id INTEGER NOT NULL,
    nama_item VARCHAR(255) NOT NULL,
    peminjam VARCHAR(255) NOT NULL,
    jumlah INTEGER NOT NULL DEFAULT 1,
    tanggal_pinjam TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tanggal_kembali TIMESTAMP DEFAULT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Dipinjam', -- 'Dipinjam' | 'Dikembalikan' | 'Terlambat'
    keterangan TEXT
);

-- Index transaksi untuk filtering cepat
CREATE INDEX IF NOT EXISTS idx_transaksi_tanggal ON transaksi(tanggal_pinjam);
CREATE INDEX IF NOT EXISTS idx_transaksi_status ON transaksi(status);
CREATE INDEX IF NOT EXISTS idx_transaksi_item ON transaksi(item_type, item_id);

-- 5. Tabel Activity Log (Audit Trail)
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL, -- 'create' | 'update' | 'delete' | 'pinjam' | 'kembali' | 'login'
    entity_type VARCHAR(50) NOT NULL, -- 'barang' | 'kendaraan' | 'transaksi' | 'auth'
    entity_id INTEGER,
    detail TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index activity log
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp DESC);
