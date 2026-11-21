# GunplaHangar

Katalog koleksi model kit Gundam + pelacak progres perakitan (PWA).

- **Frontend**: React + Vite + Axios + vite-plugin-pwa (folder `frontend/`)
- **Backend**: Node.js + Express + Supabase, pola Model - Controller - Routes seperti Modul 1 (folder `backend/`)

## Struktur
```
backend/
  src/config/supabaseClient.js
  src/models/        gradeModel, kitModel, logModel
  src/controllers/   grade, kit, log, upload
  src/routes/        gradeRoutes, kitRoutes, logRoutes, uploadRoutes
  src/index.js       entry server
  schema.sql         skema + data contoh Supabase
  vercel.json
  GunplaHangar_Postman_Collection.json / _Environment.json
frontend/
  src/config/api.js  instance Axios + interceptor
  src/services/      kitService, logService, gradeService, uploadService
  src/hooks/         useKits, useLogs, useGrades (+ useAsync)
  src/pages/         Hangar, KitDetail, BuildLog, LogDetail, Add, Profile
  src/components/    BottomNav, ConfirmModal, PWABadge, Bits
```

## 1. Siapkan Supabase (sekali saja)
1. Buat project di https://supabase.com
2. Buka **SQL Editor**, tempel seluruh isi `backend/schema.sql`, lalu **Run**.
   Ini membuat 3 tabel, data grade, bucket `kit-images`, dan 3 kit contoh.
3. Buka **Project Settings > Data API** untuk menyalin *Project URL*, lalu **API Keys**
   (tab *Legacy*) untuk menyalin *anon public key*, sama seperti Modul 1.

## 2. Jalankan backend
```bash
cd backend
cp .env.example .env      # isi SUPABASE_URL dan SUPABASE_KEY
npm install
npm run dev               # Server running on port 3000
```
Cek di browser: http://localhost:3000/api/kits harus menampilkan JSON.
Untuk tes di Postman, import dua file `GunplaHangar_Postman_*.json` di folder `backend/`.

## 3. Jalankan frontend (terminal lain)
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```
Saat dev, request `/api/...` otomatis diteruskan ke `localhost:3000` lewat proxy Vite.

## 4. Upload ke GitHub
```bash
git init
git add .
git commit -m "GunplaHangar tugas akhir PPB 2026"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```
`.env` sudah masuk `.gitignore`, jadi key tidak ikut terunggah.

## 5. Deploy ke Vercel (dua project dari repo yang sama)
**Backend**
- New Project > pilih repo > **Root Directory: `backend`** > Preset: Express
- Environment Variables: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_BUCKET=kit-images`
- Deploy, lalu catat URL-nya, misalnya `https://gunplahangar-api.vercel.app`

**Frontend**
- New Project > pilih repo yang sama > **Root Directory: `frontend`** > Preset: Vite
- Environment Variables: `VITE_API_BASE_URL=https://gunplahangar-api.vercel.app` (tanpa `/api` dan tanpa garis miring di akhir)
- Deploy

## 6. Uji PWA
```bash
cd frontend && npm run build && npm run preview -- --host
```
Buka link Network di HP (satu jaringan), atau buka URL Vercel di HP lalu pilih **Add to Home Screen**.
Cek Service Worker di DevTools > Application.

## Endpoint
| Method | Path | Keterangan |
|---|---|---|
| GET | /api/grades | daftar grade |
| GET, POST | /api/kits | list / tambah kit |
| GET, PUT, DELETE | /api/kits/:id | detail / update checklist / hapus |
| GET, POST | /api/logs | list / tambah build log |
| GET, DELETE | /api/logs/:id | detail / hapus |
| POST | /api/upload | unggah foto (field `image`, maks 4 MB) ke Supabase Storage |

Progres dan status dihitung otomatis di server dari **4 tahap utama** (Head & Torso, Arms & Shoulders, Waist & Legs, Backpack & Weapons):
`progress = (tahap utama tercentang / 4) x 100`. 0 = Backlog, 1-3 = On Progress, 4 = Completed.
Panel Lining & Decals dan Topcoat & Finishing bersifat **opsional** (tidak memengaruhi progres).

Tiap tahap bisa diberi **foto progres** (opsional). Foto disimpan di kolom `kits.progress_photos` (jsonb) dengan bentuk
`{ "check_head_torso": { "url": "https://...jpg", "at": "2026-11-19T..." } }` (tanggal terisi otomatis oleh server) lewat `PUT /api/kits/:id`.

Saat 4 tahap utama selesai, halaman detail kit mengajak mengambil **foto hasil akhir** (disimpan dengan kunci `final`).
Halaman **Hangar** hanya menampilkan foto hasil jadi (besar) dan riwayat foto progres. Daftar kit, filter status, dan checklist ada di halaman **Progres**. Semua foto progres sebuah kit juga muncul di detail Build Log.

Tampilan responsif: di HP satu kolom, di PC melebar dengan grid dan halaman detail dua kolom (bottom navigation tetap ada di semua ukuran layar).

## Catatan
- Kalau database sudah dibuat sebelum fitur foto progres, jalankan ulang `schema.sql` (aman diulang) atau cukup baris
  `alter table kits add column if not exists progress_photos jsonb not null default '{}'::jsonb;`
  lalu perbarui progres kit lama dengan membuka dan menyimpan checklist-nya.
- Tabel dibuat tanpa RLS agar bisa diakses dengan anon key (sama seperti Modul 1). Jangan aktifkan
  *automatic RLS* saat membuat project, atau nonaktifkan lewat `schema.sql`.
- Unggah foto memakai policy `anon upload kit-images` di `schema.sql`. Kalau unggah gagal,
  jalankan ulang bagian policy itu di SQL Editor.
- Kalau API mengembalikan `column ... does not exist` atau tabel tidak ditemukan, pastikan `schema.sql` sudah dijalankan penuh.
