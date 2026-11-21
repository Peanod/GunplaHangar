import { apiClient } from '../config/api.js'

const uploadService = {
  upload: (file) => {
    const form = new FormData()
    form.append('image', file)
    return apiClient.post('/api/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default uploadService
