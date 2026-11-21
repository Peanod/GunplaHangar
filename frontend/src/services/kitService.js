import { apiClient } from '../config/api.js'

const kitService = {
  getAll: () => apiClient.get('/api/kits'),
  getById: (id) => apiClient.get(`/api/kits/${id}`),
  create: (data) => apiClient.post('/api/kits', data),
  update: (id, data) => apiClient.put(`/api/kits/${id}`, data),
  remove: (id) => apiClient.delete(`/api/kits/${id}`),
}

export default kitService
