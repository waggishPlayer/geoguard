import api from './api'

export const authService = {
  async login(email, password) {
    try {
      const res = await api.post('/auth/login', { email, password })
  
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Invalid credentials')
      }
  
      const user = res.data.data
      if (!user.role_name && user.role_id) {
        const roleNameMap = {
          1: 'field_worker',
          2: 'site_admin',
          3: 'gov_authority',
          4: 'super_admin',
        }
        user.role_name = roleNameMap[user.role_id] || user.role_name
      }
  
      // Save token
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(user))
      }
  
      return { success: true, data: user, token: res.data.token }
  
    } catch (err) {
      if (err.response) {
        throw new Error(err.response.data?.message || 'Login failed')
      }
      throw new Error('Unable to connect to server')
    }
  }
  ,

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async updateProfile(payload) {
    const response = await api.put('/auth/me', payload)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data.data))
    }
    return response.data
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  },

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }
}
