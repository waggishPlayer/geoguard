import api from './api'

export const alertsService = {
  async getAll() {
    try {
      // Note: Backend doesn't have GET /api/alerts endpoint
      // Return empty array or implement slope-based fetching
      // To get alerts, use getBySlope(slopeId) instead
      return []
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch alerts')
    }
  },

  async getById(alertId) {
    try {
      const response = await api.get(`/alerts/${alertId}`)
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch alert')
    }
  },

  async getBySlope(slopeId) {
    try {
      const response = await api.get(`/alerts/slope/${slopeId}`)
      return response.data.data || []
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch alerts')
    }
  },

  async create(alertData) {
    try {
      const response = await api.post('/alerts', alertData)
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create alert')
    }
  },

  async acknowledge(alertId) {
    try {
      const response = await api.post(`/alerts/${alertId}/acknowledge`)
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to acknowledge alert')
    }
  },

  async sendSOS(payload) {
    try {
      const response = await api.post('/alerts/sos', payload)
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send SOS')
    }
  },
}

