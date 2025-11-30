import api from './api'

export const alertsService = {
  // async getAll(slopeId = null) {
  //   const params = slopeId ? { slopeId } : {}
  //   const response = await api.get('/alerts', { params })
  //   return response.data.data || []
  // },

  async getBySlope(slopeId) {
    const response = await api.get(`/alerts/slope/${slopeId}`)
    return response.data.data || []
  },

  async create(alertData) {
    const response = await api.post('/alerts', alertData)
    return response.data.data
  },

  async acknowledge(alertId) {
    const response = await api.post(`/alerts/${alertId}/acknowledge`)
    return response.data.data
  },

  async sendSOS(payload) {
    const response = await api.post('/alerts/sos', payload)
    return response.data.data
  },
}

