import api from './api'

export const slopesService = {
  async getAll() {
    const response = await api.get('/admin/slopes')
    return response.data.data || []
  },

  async getById(slopeId) {
    const response = await api.get(`/admin/slopes/${slopeId}`)
    return response.data.data
  },

  async create(slopeData) {
    const response = await api.post('/admin/slopes', slopeData)
    return response.data.data
  },

  async update(slopeId, slopeData) {
    const response = await api.patch(`/admin/slopes/${slopeId}`, slopeData)
    return response.data.data
  },

  async updateRisk(slopeId, riskLevel) {
    const response = await api.patch(`/admin/slopes/${slopeId}/risk`, { riskLevel })
    return response.data.data
  },

  async delete(slopeId) {
    const response = await api.delete(`/admin/slopes/${slopeId}`)
    return response.data.data
  },
}

