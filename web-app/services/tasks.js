import api from './api'

export const tasksService = {
  async myTasks(status) {
    const response = await api.get('/tasks/mine', {
      params: { status },
    })
    return response.data.data || []
  },

  async getById(taskId) {
    const response = await api.get(`/tasks/${taskId}`)
    return response.data.data
  },

  async updateStatus(taskId, payload) {
    const response = await api.post(`/tasks/${taskId}/status`, payload)
    return response.data.data
  },

  async uploadAttachment(taskId, file) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },
}

