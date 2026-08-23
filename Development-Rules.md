# Development Rules — Aplikasi Inventaris Kantor

Dokumen ini adalah aturan main teknis selama development, supaya konsisten dan gampang dijelasin lagi pas interview/review portofolio.

---

## 1. Struktur Folder

```
project-root/
├── client/                 # React (Vite)
│   ├── src/
│   │   ├── components/     # UI reusable (Button, Table, Modal, dll)
│   │   ├── pages/          # Halaman (BarangPage, KendaraanPage, TransaksiPage, dll)
│   │   ├── hooks/          # Custom hooks (useBarang, useAuth, dll)
│   │   ├── services/       # API call wrapper (axios instance + fungsi per resource)
│   │   ├── utils/          # Helper murni (format tanggal, format angka, dll)
│   │   └── context/        # Auth context (kalau tidak pakai React Query untuk auth state)
│   └── .env                # VITE_API_URL, dll
│
├── server/                  # Node.js + Express
│   ├── src/
│   │   ├── routes/          # Definisi endpoint per resource
│   │   ├── controllers/     # Terima request, panggil service, kirim response
│   │   ├── services/        # Business logic (auto-update stok, computed status, dll)
│   │   ├── models/          # Query ke Supabase/Postgres (atau Prisma schema)
│   │   ├── middlewares/     # authMiddleware, errorHandler, rateLimiter
│   │   └── utils/           # Helper (generate PDF, generate Excel, dll)
│   └── .env                 # DATABASE_URL, JWT_SECRET, dll
│
└── README.md
```

**Aturan:** Controller **tidak boleh** langsung berisi query database atau logic kompleks. Alur wajib: `route → controller → service → model/database`. Ini supaya business logic (misal auto-update stok) bisa di-testing terpisah dan gampang dijelasin.

---

## 2. Aturan Backend

### 2.1 Layer Separation (Wajib)
- **Controller**: hanya handle request/response, validasi input dasar, panggil service
- **Service**: berisi business logic — misal `pinjamBarangService()` yang cek `jumlah_tersedia`, kurangi stok, insert transaksi, insert activity log — semua dalam satu unit logic
- **Model/DB layer**: hanya berurusan dengan query, tidak berisi keputusan bisnis

### 2.2 Field Computed Tidak Boleh Ditulis Langsung dari Endpoint CRUD
`jumlah_tersedia`, `jumlah_digunakan`, `status_pajak` **tidak muncul sebagai field yang bisa di-PUT/PATCH langsung** dari endpoint update barang/kendaraan. Field-field ini hanya berubah lewat:
- Service transaksi (pinjam/kembali) untuk stok barang
- Dihitung on-the-fly (bukan disimpan) atau lewat scheduled job untuk status pajak — pilih salah satu, tapi jangan biarkan admin mengetik manual

### 2.3 Transaksi Database untuk Operasi yang Mengubah Banyak Tabel Sekaligus
Setiap kali 1 aksi user memicu perubahan di lebih dari 1 tabel (contoh: pinjam barang = insert ke `transaksi` + update `jumlah_digunakan` di `barang` + insert ke `activity_log`), gunakan **database transaction** (`BEGIN...COMMIT...ROLLBACK` di Postgres, atau helper transaction dari ORM yang dipakai). Ini mencegah data setengah-update kalau salah satu langkah gagal di tengah jalan.

### 2.4 Validasi Selalu di Backend, Tidak Cukup di Frontend
Validasi seperti "tidak bisa pinjam barang melebihi stok tersedia" atau "kendaraan yang sedang dipinjam tidak bisa dipinjam lagi" **harus dicek ulang di backend**, meskipun sudah divalidasi di form frontend. Validasi frontend hanya untuk UX, bukan satu-satunya lapisan keamanan.

### 2.5 Error Handling Konsisten
Semua endpoint mengembalikan format error yang seragam, misal:
```json
{ "success": false, "message": "Stok tidak mencukupi", "code": "INSUFFICIENT_STOCK" }
```
Gunakan satu `errorHandler` middleware terpusat, jangan `try-catch` yang responsenya beda-beda tiap controller.

### 2.6 Environment Variables
- Jangan pernah hardcode connection string, JWT secret, atau kredensial apapun di kode
- `.env` wajib masuk `.gitignore`
- Sediakan `.env.example` di repo (tanpa nilai asli) supaya orang lain (atau kamu sendiri di masa depan) tahu variable apa saja yang dibutuhkan

---

## 3. Aturan Frontend

### 3.1 Data Fetching Lewat React Query, Bukan useEffect Manual
Semua pengambilan data dari API (list barang, list kendaraan, dll) menggunakan React Query (`useQuery`/`useMutation`), bukan kombinasi manual `useEffect` + `useState` + `fetch`. Ini otomatis menangani loading state, error state, caching, dan refetch — dan jadi nilai tambah skill yang relevan di 2026.

### 3.2 Pemisahan Presentational vs Logic
- Komponen di `components/` sebisa mungkin "dumb" — cuma nerima props dan render, tidak fetch data sendiri
- Logic fetching dan state management ada di `pages/` atau custom hooks di `hooks/`

### 3.3 Form Validation
Gunakan library validasi (misal `react-hook-form` + `zod`) untuk form Barang/Kendaraan/Transaksi, jangan validasi manual berantakan dengan banyak `if` di dalam handler submit.

### 3.4 Token Auth Tidak Disimpan di localStorage
Simpan token di **httpOnly cookie** (di-set dari backend), bukan localStorage, untuk mengurangi risiko XSS. Kalau tetap terpaksa pakai localStorage (misal keterbatasan setup CORS/cookie), catat sebagai known trade-off di README, jangan diam-diam.

---

## 4. Aturan Database (Supabase/Postgres)

### 4.1 Migration, Bukan Ubah Schema Manual di Dashboard
Idealnya semua perubahan schema (tabel, kolom, index) didefinisikan lewat migration file (misal pakai Prisma Migrate atau SQL migration manual), bukan cuma klak-klik di Supabase Studio tanpa jejak. Ini penting supaya schema history bisa dilacak dan direplikasi.

### 4.2 Constraint di Level Database
- `nomor_plat` di tabel `kendaraan`: `UNIQUE`
- Foreign key `item_id` di `transaksi` mengarah ke `barang.id` atau `kendaraan.id` sesuai `item_type` — karena Postgres tidak native mendukung polymorphic FK, gunakan salah satu pendekatan: (a) dua kolom nullable (`barang_id`, `kendaraan_id`, salah satu diisi), atau (b) validasi di level aplikasi. Tulis alasan pemilihan pendekatan ini di README.
- `jumlah_tersedia >= 0` sebagai CHECK constraint, supaya tidak mungkin stok minus meski ada bug di service layer

### 4.3 Index untuk Query yang Sering Dipakai
Tambahkan index pada kolom yang sering di-filter/search: `nama_barang`, `nama_kendaraan`, `tanggal_pinjam`, `status`.

---

## 5. Aturan Git & Commit

- Commit kecil dan sering, bukan 1 commit raksasa di akhir
- Format commit message: `feat: tambah endpoint pinjam barang`, `fix: validasi stok minus`, `refactor: pisah logic transaksi ke service`
- Branch per fitur (`feature/crud-barang`, `feature/transaksi`, dst), merge ke `main` setelah fitur selesai dan ditest manual
- Jangan commit `.env`, `node_modules`, atau file build

---

## 6. Aturan Dokumentasi

README wajib berisi:
1. Deskripsi singkat aplikasi & tujuan (termasuk konteks bahwa ini juga untuk portofolio)
2. Tech stack & alasan pemilihan (terutama keputusan yang didiskusikan: kenapa tabel terpisah, kenapa computed field, kenapa custom JWT vs Supabase Auth)
3. Cara setup lokal (clone, install, `.env.example`, run)
4. Struktur database (bisa tempel diagram/tabel dari PRD)
5. Screenshot atau demo GIF tiap fitur utama
6. Known limitations / trade-offs yang disadari (misal: single-user, belum real-time, dst) — ini justru menunjukkan kamu paham scope dan bukan cuma "ga sempet ngerjain"

---

## 7. Definition of Done (per fitur)

Sebuah fitur dianggap selesai kalau:
- [ ] Endpoint backend sudah divalidasi (input salah tidak bikin crash / data korup)
- [ ] Sudah dites manual dari UI, bukan cuma lewat Postman
- [ ] Error state di frontend ditangani (bukan cuma happy path)
- [ ] Perubahan data yang relevan tercatat di `activity_log`
- [ ] Tidak ada field computed yang bisa di-override manual dari form
