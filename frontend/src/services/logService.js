import { apiClient } from '../config/api.js'

const logService = {
  getAll: () => apiClient.get('/api/logs'),

  // Saat offline dan detail belum pernah dibuka, ambil dari daftar log yang sudah ter-cache.
  getById: async (id) => {
    try {
      return await apiClient.get(`/api/logs/${id}`)
    } catch (err) {
      if (err.status) throw err
      const list = await apiClient.get('/api/logs')
      const found = Array.isArray(list) ? list.find((l) => String(l.id) === String(id)) : null
      if (found) return found
      throw err
    }
  },

  create: (data) => apiClient.post('/api/logs', data),
  remove: (id) => apiClient.delete(`/api/logs/${id}`),
}

export default logService
