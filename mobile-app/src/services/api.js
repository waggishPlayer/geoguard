import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../utils/constants'

const DEV_BYPASS_TOKEN = 'DEV_BYPASS'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// List of public endpoints that don't require authentication
const publicEndpoints = [
  '/auth/login',
  '/auth/register/worker',
  '/auth/register/site-admin',
  '/auth/register/gov',
  '/auth/slopes',
  '/auth/roles'
]

// Request interceptor - attach token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('sih_token')
      const isPublic = publicEndpoints.some(ep => config.url?.startsWith(ep))
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('[api] Request to', config.url, '- Authorization: Bearer token attached')
      } else if (!isPublic) {
        console.warn('[api] No token found for protected request to', config.url, '- using dev bypass token')
        config.headers['x-dev-bypass'] = DEV_BYPASS_TOKEN
      }
    } catch (error) {
      console.error('[api] Error getting token:', error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('sih_token')
      await AsyncStorage.removeItem('sih_user')
    }
    return Promise.reject(error)
  }
)

export const setAuthToken = async (token) => {
  if (token) {
    await AsyncStorage.setItem('sih_token', token)
  }
}

export const clearAuthToken = async () => {
  await AsyncStorage.removeItem('sih_token')
  await AsyncStorage.removeItem('sih_user')
}

export default api
