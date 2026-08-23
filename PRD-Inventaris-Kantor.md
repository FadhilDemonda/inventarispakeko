# PRD — Aplikasi Inventaris Kantor

**Versi:** 1.0
**Tanggal:** 23 Agustus 2026
**Status:** Draft — Development Phase 1 (Local)

---

## 1. Ringkasan Project

### 1.1 Latar Belakang
Kantor membutuhkan sistem digital untuk mencatat dan melacak inventaris berupa **Barang** (peralatan kantor dengan stok/kuantitas) dan **Kendaraan** (aset dengan identitas unik, plat nomor, dan status pajak). Saat ini pencatatan diasumsikan masih manual/spreadsheet, sehingga rawan human error, sulit dilacak riwayatnya, dan tidak ada alert otomatis untuk hal-hal seperti pajak kendaraan yang mendekati expired.

### 1.2 Tujuan
1. Mendigitalkan proses pencatatan inventaris barang dan kendaraan kantor
2. Menyediakan tracking peminjaman & pengembalian yang akurat dan auditable
3. Menyediakan laporan (stok & histori peminjaman) yang bisa diekspor
4. **[Sekunder]** Menjadi portofolio teknis yang menunjukkan kemampuan full-stack development

### 1.3 Target Pengguna
- **Single user (admin/petugas gudang)** — satu-satunya pihak yang login dan mengoperasikan sistem
- Peminjam **bukan** pengguna sistem — hanya dicatat sebagai data teks oleh admin

### 1.4 Non-Goals (Eksplisit di luar scope Fase 1)
- Tidak ada multi-role / role-based access control
- Tidak ada akun terpisah untuk peminjam
- Tidak ada notifikasi real-time multi-user (WebSocket) — dipertimbangkan lagi di Fase 2 jika kebutuhan berubah jadi multi-user
- Tidak ada mobile app native (web-responsive cukup)

---

## 2. Tech Stack

| Layer | Teknologi | Catatan |
|---|---|---|
| Frontend | React (Vite) + TailwindCSS | SPA, konsumsi REST API dari backend |
| Backend | Node.js + Express | Custom REST API, bukan langsung akses Supabase dari frontend |
| Database | Supabase (PostgreSQL) | Dipakai **sebagai database Postgres**, opsional pakai Supabase Auth untuk mempercepat auth |
| Auth | Supabase Auth (email/password) **atau** custom JWT — lihat §5.1 | Keputusan akhir dibuat sebelum mulai coding |
| Data fetching | React Query (TanStack Query) | Caching, auto-refetch, loading/error state |
| Export PDF | `pdfkit` atau `puppeteer` | Generate dari template |
| Export Excel | `exceljs` | |
| Environment | Lokal dulu (development), deployment cloud menyusul di Fase 2 | Lihat §9 |

**Kenapa Node.js/Express tetap dipertahankan (bukan langsung Supabase client dari frontend):**
Karena tujuan sekunder project ini adalah portofolio, business logic penting (auto-update stok, computed status pajak, validasi transaksi) sengaja ditulis eksplisit di backend layer, bukan diserahkan ke Supabase auto-generated API. Ini membuat skill backend development tetap terlihat, sementara Supabase dimanfaatkan sebagai managed Postgres yang gratis dan mudah display.

---

## 3. Data Model

### 3.1 Tabel: `barang`

| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID / Serial | Primary key |
| nama_barang | Text | |
| status_barang | Enum/Text | **⚠️ Perlu klarifikasi:** kondisi fisik (Baik/Rusak) atau ketersediaan? (lihat §7) |
| total_jumlah | Integer | |
| jumlah_tersedia | Integer | **Computed**, bukan input manual — lihat §5.2 |
| jumlah_digunakan | Integer | **Computed** dari transaksi aktif |
| tanggal_update | Timestamp | Auto-update tiap ada perubahan |

### 3.2 Tabel: `kendaraan`

| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID / Serial | Primary key |
| nama_kendaraan | Text | |
| nomor_plat | Text (unique) | |
| satker | Text | |
| tanggal_pajak | Date | |
| status_pajak | Enum/Text | **Computed**: Aktif / Akan Habis (≤30 hari) / Expired — lihat §5.3 |
| keterangan | Text | Nullable |
| peminjam | Text | Nullable — field teks manual, bukan reference ke user |

### 3.3 Tabel: `transaksi` (peminjaman & pengembalian)

| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID / Serial | Primary key |
| item_type | Enum | `barang` \| `kendaraan` |
| item_id | UUID/FK | Reference ke `barang.id` atau `kendaraan.id` |
| nama_item | Text | Denormalized, agar query laporan tidak perlu join berat |
| peminjam | Text | |
| jumlah | Integer | Untuk barang; default 1 untuk kendaraan |
| tanggal_pinjam | Timestamp | |
| tanggal_kembali | Timestamp | Nullable — null berarti masih dipinjam |
| status | Enum | `Dipinjam` \| `Dikembalikan` \| `Terlambat` |
| keterangan | Text | Nullable |

### 3.4 Tabel: `activity_log`

| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID / Serial | Primary key |
| action | Enum | `create` \| `update` \| `delete` \| `pinjam` \| `kembali` |
| entity_type | Enum | `barang` \| `kendaraan` \| `transaksi` |
| entity_id | UUID/FK | |
| detail | Text | Human-readable, misal: "Stok Kabel LAN diubah dari 20 jadi 15" |
| timestamp | Timestamp | |

---

## 4. Functional Requirements

### 4.1 Autentikasi (Core)
- FR-1.1: Sistem menyediakan 1 akun admin, login via email/password
- FR-1.2: Password di-hash (bcrypt jika custom JWT, atau otomatis jika Supabase Auth)
- FR-1.3: Session/token memiliki masa berlaku (expiry), tidak permanen
- FR-1.4: Rate limiting pada endpoint login untuk mencegah brute force

### 4.2 CRUD Barang (Core)
- FR-2.1: Admin dapat menambah, melihat, mengubah, menghapus data barang
- FR-2.2: `jumlah_tersedia` dan `jumlah_digunakan` tidak dapat diedit manual — hanya berubah lewat transaksi
- FR-2.3: `tanggal_update` otomatis terisi setiap ada perubahan data

### 4.3 CRUD Kendaraan (Core)
- FR-3.1: Admin dapat menambah, melihat, mengubah, menghapus data kendaraan
- FR-3.2: `nomor_plat` harus unik
- FR-3.3: `status_pajak` dihitung otomatis dari `tanggal_pajak` vs tanggal hari ini

### 4.4 Peminjaman & Pengembalian (Core)
- FR-4.1: Admin dapat mencatat transaksi peminjaman (pilih item, isi nama peminjam, jumlah [khusus barang])
- FR-4.2: Sistem otomatis mengurangi `jumlah_tersedia` barang saat peminjaman dibuat
- FR-4.3: Sistem otomatis menambah kembali `jumlah_tersedia` saat pengembalian dicatat
- FR-4.4: Kendaraan yang sedang berstatus "Dipinjam" tidak dapat dipinjamkan lagi sampai dikembalikan (1 unit = 1 waktu) — **perlu konfirmasi ke §7**
- FR-4.5: Barang tidak dapat dipinjam melebihi `jumlah_tersedia`

### 4.5 Search & Filter (Core)
- FR-5.1: Pencarian barang/kendaraan berdasarkan nama
- FR-5.2: Filter barang berdasarkan status ketersediaan
- FR-5.3: Filter kendaraan berdasarkan status pajak dan satker

### 4.6 Activity Log (Standout)
- FR-6.1: Setiap aksi create/update/delete/pinjam/kembali otomatis tercatat di activity log
- FR-6.2: Admin dapat melihat log terurut berdasarkan waktu terbaru

### 4.7 Alert Pajak Kendaraan (Standout)
- FR-7.1: Dashboard menampilkan daftar kendaraan dengan status pajak "Akan Habis" (≤30 hari) dan "Expired"
- FR-7.2: **[Opsional]** Notifikasi (email/in-app) untuk kendaraan yang mendekati jatuh tempo pajak

### 4.8 Export Laporan (Standout)
- FR-8.1: Export laporan stok barang saat ini (snapshot) ke PDF dan Excel
- FR-8.2: Export laporan histori peminjaman dengan filter rentang tanggal ke PDF dan Excel

---

## 5. Keputusan Teknis Kunci

### 5.1 Auth: Supabase Auth vs Custom JWT
**Belum final — pilih salah satu sebelum mulai coding:**
- **Supabase Auth**: lebih cepat setup, tapi sebagian logic auth "tersembunyi" di platform
- **Custom JWT + bcrypt** di Express: lebih banyak kerja, tapi lebih menunjukkan pemahaman auth dari nol — lebih kuat untuk portofolio

> Rekomendasi: karena tujuan sekunder project ini portofolio, custom JWT lebih disarankan. Tapi jika waktu terbatas, Supabase Auth adalah pilihan valid dan tetap dijelaskan reasoning-nya di README.

### 5.2 Stok Barang = Computed, Bukan Input Manual
`jumlah_tersedia = total_jumlah - jumlah_digunakan`. Nilai ini **tidak boleh diedit langsung** oleh admin di form — hanya berubah otomatis lewat proses transaksi pinjam/kembali. Ini mencegah inkonsistensi data (misal total 10, tersedia 8, digunakan 5 — tidak match).

### 5.3 Status Pajak Kendaraan = Computed
Dihitung dari `tanggal_pajak` dibanding tanggal hari ini, bukan input manual:
- `tanggal_pajak < today` → **Expired**
- `tanggal_pajak - today <= 30 hari` → **Akan Habis**
- Selain itu → **Aktif**

### 5.4 Barang vs Kendaraan = Tabel Terpisah
Dua entitas ini memiliki struktur data yang secara konsep berbeda (kuantitas vs aset unik), sehingga dipisah menjadi 2 tabel, bukan dipaksakan ke 1 skema generik. Trade-off: fitur gabungan (misal "semua item sedang dipinjam") memerlukan query gabungan dari `transaksi` (yang sudah didesain menyimpan `item_type` untuk mengakomodasi ini).

---

## 6. Non-Functional Requirements

- **NFR-1 (Security):** Password di-hash, token disimpan di httpOnly cookie (bukan localStorage), input divalidasi di backend (bukan hanya di frontend)
- **NFR-2 (Data Integrity):** Perubahan stok dan status hanya boleh terjadi melalui transaksi tercatat, tidak lewat write langsung ke field computed
- **NFR-3 (Auditability):** Semua perubahan data penting harus tercatat di `activity_log`
- **NFR-4 (Usability):** UI harus jelas membedakan alur "Barang" dan "Kendaraan" karena field dan logikanya berbeda
- **NFR-5 (Portability):** Environment variables (`DATABASE_URL`, `JWT_SECRET`, dll) tidak boleh hardcoded, disimpan di `.env` dan tidak di-commit ke repository

---

## 7. Open Questions — Perlu Dikonfirmasi Sebelum/Selama Development

| # | Pertanyaan | Dampak jika tidak dijawab |
|---|---|---|
| 1 | "Status Barang" itu maksudnya kondisi fisik (Baik/Rusak/Perlu Perbaikan) atau status ketersediaan? | Menentukan apakah field ini manual input atau computed |
| 2 | Kendaraan hanya bisa dipinjam 1 unit dalam satu waktu (karena 1 plat = 1 unit fisik)? | Menentukan validasi di FR-4.4 |
| 3 | Auth pakai Supabase Auth atau custom JWT? | Menentukan struktur backend §5.1 |
| 4 | Laporan histori peminjaman perlu breakdown per jenis (barang vs kendaraan terpisah) atau digabung? | Menentukan struktur query laporan |

---

## 8. Struktur Fitur (Prioritas Development)

**Fase 1 — Core (target: functional end-to-end)**
1. Setup project (React + Vite, Express, koneksi ke Supabase Postgres)
2. Auth (login single admin)
3. CRUD Barang
4. CRUD Kendaraan
5. Transaksi Pinjam & Kembali (dengan auto-update stok)
6. Search & Filter

**Fase 2 — Standout**
7. Activity Log
8. Alert Pajak Kendaraan (dashboard widget)
9. Export Laporan (PDF & Excel — snapshot stok + histori peminjaman)

**Fase 3 — Stretch (opsional, evaluasi ulang setelah Fase 1 & 2 selesai)**
10. Real-time update (WebSocket) — hanya jika kebutuhan berubah jadi multi-user
11. Deployment ke cloud (lihat §9)

---

## 9. Rencana Deployment (Fase Selanjutnya, Bukan Fase 1)

Fase 1 dijalankan **lokal saja** (localhost, database Supabase cloud tapi diakses dari environment development lokal). Deployment publik dipertimbangkan setelah Fase 1 & 2 stabil.

Kombinasi yang disarankan nanti:
- Frontend → Vercel
- Backend (Express) → Railway / Render
- Database → Tetap di Supabase (sudah cloud dari awal)

**Catatan penting:** Sebelum deploy publik, konfirmasi ke kantor apakah data inventaris (terutama data kendaraan dinas) boleh disimpan di infrastruktur pihak ketiga gratisan, atau harus di server internal — terutama jika ini instansi dengan kebijakan data yang ketat.

---

## 10. Metrik Keberhasilan (untuk konteks portofolio)

- Semua fitur Core (§8 Fase 1) berjalan tanpa bug kritikal
- Minimal 2 fitur Standout selesai (Activity Log + salah satu dari Alert Pajak / Export Laporan)
- Kode terstruktur rapi dengan pemisahan jelas: routes, controllers, services, models
- README lengkap: alasan keputusan teknis (kenapa tabel terpisah, kenapa computed field, kenapa pilih JWT/Supabase Auth, dll) — ini yang membedakan portofolio "asal jalan" vs portofolio yang menunjukkan cara berpikir
