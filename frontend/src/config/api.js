import axios from 'axios'

// ---------------------------------------------------------------------------
// Base URL dibaca dari .env (VITE_API_BASE_URL).
// Kosong saat development lokal: request /api/... diteruskan proxy Vite ke
// backend di localhost:3000. Saat production, isi dengan URL backend Vercel.
// ---------------------------------------------------------------------------
const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 detik
})

// Response interceptor: ambil langsung response.data dan rapikan error
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Terjadi kesalahan yang tidak terduga'
    let status = null
    if (error.response) {
      status = error.response.status
      message =
        error.response.data?.error ||
        error.response.data?.message ||
        `Kesalahan server (${status})`
    } else if (error.request) {
      message =
        'Tidak bisa terhubung ke server. Cek koneksi atau pastikan backend berjalan.'
    } else {
      message = error.message || message
    }
    return Promise.reject({ message, status })
  },
)

export { apiClient, BASE_URL }
