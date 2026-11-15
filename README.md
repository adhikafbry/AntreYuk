# 🎟️ AntreYuk - Real-Time Digital Queue Management System

> *"Antre tanpa harus menunggu di tempat!"*

**AntreYuk** adalah platform manajemen antrean digital *single-store* modern yang memungkinkan pelanggan mengambil nomor antrean secara mandiri dan memantau perkembangan nomor antrean secara *real-time* dari mana saja melalui smartphone atau komputer tanpa harus menunggu secara fisik di lokasi toko.

---

## 🌟 Fitur Utama

### A. Sisi Pelanggan (Customer Website)
1. **Homepage Interaktif**:
   - Status operasional toko (*Buka/Tutup*).
   - Indikator nomor yang sedang dilayani saat ini.
   - Jumlah pelanggan yang sedang menunggu & perkiraan waktu tunggu dinamis.
   - Panduan cara kerja antrean digital & manfaat bagi pelanggan.
2. **Pengambilan Antrean Mandiri (`/ambil-antrean`)**:
   - Formulir cepat hanya memerlukan Nama dan Nomor WhatsApp aktif.
   - Validasi nomor telepon Indonesia otomatis.
   - Proteksi anti double-submit dan pemeriksaan kuota harian.
   - Penomoran atomik berurutan (`A-001`, `A-002`, dst.) yang di-reset per hari operasional.
3. **Tiket Digital Unik (`/tiket/:token`)**:
   - Desain tiket digital modern dengan nomor antrean ekstra besar.
   - Dilengkapi *access token* unik sehingga pelanggan dapat membuka kembali tiketnya tanpa registrasi atau login.
   - Tombol bagikan tiket & salin tautan.
   - Opsi pembatalan antrean mandiri jika pelanggan berhalangan hadir.
4. **Pemantau Antrean Real-Time (`/antrean/:token`)**:
   - Pembaruan status seketika melalui **Supabase Realtime** (atau *Reactive BroadcastChannel Engine* saat offline).
   - Tampilan nomor yang sedang dilayani vs nomor antrean saya.
   - Posisi antrean aktif (berapa orang lagi di depanmu).
   - Estimasi waktu tunggu otomatis yang dihitung dari rata-rata durasi pelayanan.
   - *Progress bar* visual perkembangan antrean.
   - Notifikasi suara (*audio chime*) dan *confetti* saat nomor antrean dipanggil.
   - Peringatan dini (*early warning alert*) saat sisa 3 nomor sebelum giliran.

---

### B. Sisi Pengelola (Admin Dashboard)
1. **Keamanan & Autentikasi (`/admin/login`)**:
   - Terintegrasi dengan **Supabase Auth**.
   - Verifikasi ganda peran (*role-based access control*) di tabel basis data `admins`.
   - Mode demo cepat dengan akun: `admin@antreyuk.com` / `admin123`.
2. **Dashboard Overview (`/admin`)**:
   - Statistik harian: Total antrean, Menunggu, Sedang dilayani, Selesai, dan Dibatalkan.
   - Kartu status loket aktif dan antrean berikutnya yang siap dipanggil.
   - Tombol panggilan cepat *Panggil Berikutnya*.
3. **Kelola Antrean Real-Time (`/admin/antrean`)**:
   - Tabel responsif (desktop) dan kartu interaktif (mobile).
   - Aksi lengkap: **Panggil Berikutnya**, **Panggil Ulang**, **Mulai Pelayanan**, **Selesaikan**, **Lewati**, dan **Batalkan**.
   - Dialog konfirmasi untuk aksi penting guna mencegah kesalahan klik.
   - Proteksi loket tunggal (*Single-Serving Enforcement*): sistem memastikan tidak ada 2 nomor yang berstatus *Serving* secara bersamaan.
   - Tautan langsung ke chat WhatsApp pelanggan.
4. **Riwayat Antrean (`/admin/riwayat`)**:
   - Filter antrean berdasarkan tanggal operasional.
   - Pencarian nomor antrean dan nama pelanggan.
   - Filter berdasarkan status antrean (*completed*, *waiting*, *skipped*, *cancelled*).
   - Statistik tingkat penyelesaian (*completion rate*) per hari.
5. **Pengaturan Toko (`/admin/pengaturan`)**:
   - Ubah nama, deskripsi, alamat, dan nomor kontak toko.
   - Atur jam buka dan jam tutup operasional.
   - Saklar (*toggle*) Buka/Tutup toko sewaktu-waktu.
   - Pengaturan rata-rata durasi pelayanan (menit/orang) untuk kalkulasi estimasi antrean.
   - Batas maksimal tiket antrean harian (*daily queue limit*).
   - Saklar (*toggle*) penerimaan antrean baru.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 dengan Vite
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS & PostCSS
- **Ikon**: Lucide React
- **Basis Data & Real-Time**: Supabase PostgreSQL + Supabase Realtime Channels
- **Autentikasi**: Supabase Auth + Database Table Verification
- **Routing**: React Router v7
- **Kesiapan Deployment**: Vercel / Netlify

---

## 🚀 Panduan Instalasi Lokal

### Prasyarat
- Node.js versi 20+
- npm atau pnpm

### Langkah Menjalankan:
1. **Clone atau buka repositori di terminal**:
   ```bash
   cd "TUGAS FARMASI AI"
   ```

2. **Instal dependensi**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Salin file environment**:
   ```bash
   cp .env.example .env
   ```

4. **Jalankan server pengembangan**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173`.

---

## 🗄️ Konfigurasi Supabase (Database & Realtime)

AntreYuk memiliki arsitektur **Dual-Engine**:
1. Jika konfigurasi Supabase di `.env` belum diisi, aplikasi **otomatis mengaktifkan Mode Lokal Reactive** (*Hybrid Storage + BroadcastChannel*) sehingga Anda dapat langsung menguji semua fitur secara instan antar-tab browser!
2. Untuk menghubungkan ke database cloud Supabase, ikuti langkah berikut:

### 1. Buat Project di Supabase
1. Masuk ke [supabase.com](https://supabase.com) dan buat project baru.
2. Buka menu **SQL Editor** pada sidebar Supabase.
3. Buka file `schema.sql` (atau `supabase/migrations/20261115_init_schema.sql`) yang ada di repositori ini, salin seluruh isinya, dan klik **Run**.

Query tersebut akan otomatis:
- Membuat tabel `stores`, `admins`, dan `queues`.
- Mengatur *Index* performa dan *Unique Constraints* per hari.
- Mengaktifkan fungsi PostgreSQL atomik `take_queue_number(...)` untuk mencegah *race condition* nomor antrean duplikat.
- Mengaktifkan fungsi analitik publik `get_public_store_stats(...)`.
- Menerapkan aturan **Row Level Security (RLS)** yang melindungi data pribadi pelanggan.
- Mendaftarkan tabel ke channel **Supabase Realtime**.
- Memasukkan data awal (*seed*) toko default.

### 2. Buat Akun Admin di Supabase
1. Buka menu **Authentication > Users** di Supabase, lalu klik **Add User**.
2. Masukkan email (misal: `admin@antreyuk.com`) dan kata sandi (misal: `admin123`).
3. Catat User UID yang dihasilkan, lalu jalankan perintah SQL berikut di **SQL Editor**:
   ```sql
   INSERT INTO public.admins (user_id, role)
   VALUES ('MASUKKAN_USER_UID_DISINI', 'admin');
   ```

### 3. Masukkan Kredensial ke `.env`
Buka file `.env` di proyek ini dan masukkan URL serta Anon Key:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STORE_ID=00000000-0000-0000-0000-000000000001
```

Restart server `npm run dev`. Banner di bagian atas aplikasi akan langsung menampilkan **"Supabase Cloud Terhubung"**.

---

## ☁️ Panduan Deployment ke Vercel

Proyek ini telah dikonfigurasi dan siap di-deploy langsung ke **Vercel**:

1. Pastikan Anda memiliki akun di [Vercel](https://vercel.com).
2. Hubungkan repositori GitHub/GitLab ke Vercel.
3. Di bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STORE_ID` (opsional, default: `00000000-0000-0000-0000-000000000001`)
4. Klik **Deploy**. Vercel akan otomatis mendeteksi konfigurasi Vite dan mempublikasikan situs Anda.

File `vercel.json` telah disediakan di root proyek untuk menangani Single Page Application (SPA) routing:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 👥 Akun Demo untuk Pengujian Cepat

- **URL Admin**: `/admin/login`
- **Email**: `admin@antreyuk.com`
- **Kata Sandi**: `admin123`

---

## 📄 Lisensi
Hak Cipta © 2026 AntreYuk. Seluruh hak cipta dilindungi.
