import { apiClient } from '../config/api.js'
import { applyPendingProgress } from '../outbox.js'

const kitService = {
  getAll: async () => {
    const list = await apiClient.get('/api/kits')
    if (!Array.isArray(list)) return list
    return Promise.all(list.map((k) => applyPendingProgress(k)))
  },

  // Saat offline dan detail belum pernah dibuka, ambil dari daftar kit yang sudah ter-cache.
  getById: async (id) => {
    try {
      const kit = await apiClient.get(`/api/kits/${id}`)
      return applyPendingProgress(kit)
    } catch (err) {
      if (err.status) throw err // error dari server (404 dll), bukan masalah koneksi
      const list = await apiClient.get('/api/kits')
      const found = Array.isArray(list) ? list.find((k) => String(k.id) === String(id)) : null
      if (found) return applyPendingProgress(found)
      throw err
    }
  },

  create: (data) => apiClient.post('/api/kits', data),
  update: (id, data) => apiClient.put(`/api/kits/${id}`, data),
  remove: (id) => apiClient.delete(`/api/kits/${id}`),
}

export default kitService
