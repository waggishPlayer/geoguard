import api from './api'

export const adminService = {
  async getUsers() {
    const response = await api.get('/admin/users')
    return response.data.data || []
  },

  async updateUserRole(userId, roleId) {
    const response = await api.patch(`/admin/users/${userId}/role`, { roleId })
    return response.data
  },

  async getRoles() {
    const response = await api.get('/roles')
    return response.data.data || []
  },

  async getTasks(status) {
    const response = await api.get('/admin/tasks', {
      params: status ? { status } : {},
    })
    return response.data.data || []
  },

  async createTask(task) {
    const response = await api.post('/admin/tasks', task)
    return response.data.data
  },

  async updateTaskStatus(taskId, status) {
    const response = await api.patch(`/admin/tasks/${taskId}/status`, { status })
    return response.data.data
  },

  async createSuperAdmin(payload) {
    const response = await api.post('/admin/create-super-admin', payload)
    return response.data.data
  },
}
