import Constants from 'expo-constants'
import { Platform } from 'react-native'

const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {}

export const API_URL = 'http://10.0.2.2:4000/api'
export const SOCKET_URL = 'ws://10.0.2.2:4000'

export const MEDIA_MAX_SIZE_MB = 12
export const DEVICE_PLATFORM = Platform.OS

export const COLORS = {
  primary: '#0f172a',
  accent: '#38bdf8',
  danger: '#ef4444',
  warning: '#facc15',
  success: '#22c55e',
  surface: '#1e293b',
  background: '#0a0e1a',
  text: '#ffffff',
  textSecondary: '#94a3b8',
  border: '#1e293b',
}

export const RISK_LEVELS = {
  low: { label: 'Low', color: '#22c55e', threshold: 0.35 },
  medium: { label: 'Medium', color: '#facc15', threshold: 0.6 },
  high: { label: 'High', color: '#f97316', threshold: 0.75 },
  imminent: { label: 'Imminent', color: '#ef4444', threshold: 1.0 },
}

export const ROLES = {
  FIELD_WORKER: 'field_worker',
  SITE_ADMIN: 'site_admin',
  GOV_AUTHORITY: 'gov_authority',
  SUPER_ADMIN: 'super_admin',
}

export const getRiskLevel = (score) => {
  if (score >= RISK_LEVELS.imminent.threshold) return RISK_LEVELS.imminent
  if (score >= RISK_LEVELS.high.threshold) return RISK_LEVELS.high
  if (score >= RISK_LEVELS.medium.threshold) return RISK_LEVELS.medium
  return RISK_LEVELS.low
}

