import api from './api'

export const sensorsService = {
  async getAll(slopeId = null) {
    const params = slopeId ? { slopeId } : {}
    const response = await api.get('/sensors', { params })
    return response.data.data || []
  },

  async getById(sensorId) {
    const response = await api.get(`/sensors/${sensorId}`)
    return response.data.data
  },

  async create(sensorData) {
    const response = await api.post('/sensors', sensorData)
    return response.data.data
  },

  async addReading(sensorId, readingData) {
    const response = await api.post(`/sensors/${sensorId}/readings`, readingData)
    return response.data.data
  },

  async getReadings(sensorId, limit = 100) {
    const response = await api.get(`/sensors/${sensorId}/readings`, {
      params: { limit },
    })
    return response.data.data || []
  },
}

