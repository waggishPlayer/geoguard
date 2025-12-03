import api from './api'

export const govtService = {
  async postAdvisory(data) {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('message', data.message)
    formData.append('severity', data.severity || 'info')
    if (data.slopeId) formData.append('slopeId', data.slopeId)
    if (data.targetSiteAdminId) formData.append('targetSiteAdminId', data.targetSiteAdminId)
    if (Array.isArray(data.attachments)) {
      data.attachments.forEach((file) => formData.append('attachments', file))
    }
    const response = await api.post('/govt/advisories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },

  async getAdvisories(params = {}) {
    const response = await api.get('/govt/advisories', { params })
    return response.data.data || []
  },
}
