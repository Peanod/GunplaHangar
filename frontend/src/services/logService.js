import { apiClient } from '../config/api.js'

const logService = {
  getAll: () => apiClient.get('/api/logs'),
  getById: (id) => apiClient.get(`/api/logs/${id}`),
  create: (data) => apiClient.post('/api/logs', data),
  remove: (id) => apiClient.delete(`/api/logs/${id}`),
}

export default logService
