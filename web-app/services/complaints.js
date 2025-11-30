import api from './api'

export const complaintsService = {
  async uploadEvidence(file) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/complaints/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  async create(complaintData) {
    const payload = {
      ...complaintData,
      mediaUrls: complaintData.mediaUrls || (complaintData.mediaUrl ? [complaintData.mediaUrl] : []),
    }
    const response = await api.post('/complaints', payload)
    return response.data.data
  },

  async getAll() {
    const response = await api.get('/complaints')
    return response.data.data || []
  },

  async getByUser() {
    const response = await api.get('/complaints')
    return response.data.data || []
  },

  async updateStatus(complaintId, status) {
    const response = await api.patch(`/complaints/${complaintId}/status`, { status })
    return response.data.data
  },

  async getDetail(complaintId) {
    const response = await api.get(`/complaints/${complaintId}`)
    return response.data.data
  },

  async sendFeedback(complaintId, message) {
    const response = await api.post(`/complaints/${complaintId}/feedback`, { message })
    return response.data.data
  },
}
