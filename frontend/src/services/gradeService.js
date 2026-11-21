import { apiClient } from '../config/api.js'

const gradeService = {
  getAll: () => apiClient.get('/api/grades'),
}

export default gradeService
