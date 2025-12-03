import api from './api'

export const notificationsService = {
  async list(limit = 50) {
    const response = await api.get('/notifications', {
      params: { limit },
    })
    return response.data.data || []
  },

  async markAll() {
    return api.post('/notifications/mark-all')
  },

  async markOne(notificationId) {
    return api.post(`/notifications/${notificationId}/read`)
  },
}

