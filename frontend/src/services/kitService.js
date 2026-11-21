import { apiClient } from '../config/api.js'

const kitService = {
  getAll: () => apiClient.get('/api/kits'),

  // Saat offline dan detail belum pernah dibuka, ambil dari daftar kit yang sudah ter-cache.
  getById: async (id) => {
    try {
      return await apiClient.get(`/api/kits/${id}`)
    } catch (err) {
      if (err.status) throw err // error dari server (404 dll), bukan masalah koneksi
      const list = await apiClient.get('/api/kits')
      const found = Array.isArray(list) ? list.find((k) => String(k.id) === String(id)) : null
      if (found) return found
      throw err
    }
  },

  create: (data) => apiClient.post('/api/kits', data),
  update: (id, data) => apiClient.put(`/api/kits/${id}`, data),
  remove: (id) => apiClient.delete(`/api/kits/${id}`),
}

export default kitService
