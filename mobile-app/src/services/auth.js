import api from './api'
import AsyncStorage from '@react-native-async-storage/async-storage'

const authService = {
  async login(email, password, phone = null) {
    try {
      const payload = { password }
      if (email) payload.email = email
      if (phone) payload.phone = phone

      console.log('[authService] Logging in with:', { email, phone })
      console.log('[authService] Payload:', payload)
      console.log('[authService] Making POST to /auth/login')
      
      const response = await api.post('/auth/login', payload)

      console.log('[authService] Response received:', JSON.stringify(response?.data, null, 2))
      console.log('[authService] Login response success:', response?.data?.success)
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Invalid credentials')
      }

      const user = response.data.data
      const token = response.data.token
      
      console.log('[authService] Token received:', !!token, 'Length:', token?.length)
      console.log('[authService] User received:', user?.id, user?.email, 'Role:', user?.role_name)

      if (!user.role_name && user.role_id) {
        const roleNameMap = {
          1: 'field_worker',
          2: 'site_admin',
          3: 'gov_authority',
          4: 'super_admin',
        }
        user.role_name = roleNameMap[user.role_id] || user.role_name
      }

      // Save token and user
      if (token) {
        console.log('[authService] Saving token to AsyncStorage')
        await AsyncStorage.setItem('sih_token', token)
        await AsyncStorage.setItem('sih_user', JSON.stringify(user))
        console.log('[authService] Token and user saved successfully')
      } else {
        console.error('[authService] No token in response:', response.data)
      }

      return { success: true, data: user, token }
    } catch (error) {
      console.error('[authService] Login error:', error.message)
      if (error.response) {
        throw new Error(error.response.data?.message || 'Login failed')
      }
      throw new Error('Unable to connect to server')
    }
  },

  async register(userData) {
    const roleValue = userData.role || userData.roleName || userData.role_name || userData.roleId || userData.role_id
    const roleNameMap = {
      1: 'field_worker',
      2: 'site_admin',
      3: 'gov_authority',
      4: 'super_admin',
    }

    const normalizedRole = typeof roleValue === 'number'
      ? roleNameMap[roleValue]
      : (roleValue || '').toString().toLowerCase()

    const endpointByRole = {
      field_worker: '/auth/register/worker',
      site_admin: '/auth/register/site-admin',
      gov_authority: '/auth/register/gov',
    }

    const endpoint = endpointByRole[normalizedRole]

    if (!endpoint) {
      throw new Error('Unsupported role for registration. Please choose Worker, Site Admin, or Govt Authority.')
    }

    try {
      const response = await api.post(endpoint, userData)
      return response.data
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Registration failed')
      }
      throw new Error('Unable to connect to server')
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/me')
      const user = response.data.data
      await AsyncStorage.setItem('sih_user', JSON.stringify(user))
      return user
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get profile')
    }
  },

  async getRoles() {
    try {
      const response = await api.get('/auth/roles')
      return response.data.data
    } catch (error) {
      console.warn('Failed to fetch roles', error)
      return []
    }
  },

  async updateProfile(payload) {
    try {
      const response = await api.put('/auth/me', payload)
      const user = response.data.data
      await AsyncStorage.setItem('sih_user', JSON.stringify(user))
      return user
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile')
    }
  },

  async logout() {
    await AsyncStorage.removeItem('sih_token')
    await AsyncStorage.removeItem('sih_user')
  },

  async getCurrentUser() {
    try {
      const userStr = await AsyncStorage.getItem('sih_user')
      console.log('[authService] getCurrentUser - stored user data present:', !!userStr)
      if (userStr) {
        const user = JSON.parse(userStr)
        console.log('[authService] getCurrentUser returning:', user?.id, user?.role_name)
        return user
      }
      console.log('[authService] getCurrentUser - no stored user')
      return null
    } catch (error) {
      console.error('[authService] getCurrentUser error:', error)
      return null
    }
  },

  async getToken() {
    try {
      const token = await AsyncStorage.getItem('sih_token')
      if (token) {
        console.log('[authService] getToken - token found, length:', token.length)
      } else {
        console.log('[authService] getToken - NO token in AsyncStorage')
      }
      return token
    } catch (error) {
      console.error('[authService] getToken error:', error)
      return null
    }
  },
}

export default authService
