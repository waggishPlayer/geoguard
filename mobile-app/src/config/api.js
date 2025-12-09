import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }

  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:4000/api';
    }
    return 'http://localhost:4000/api';
  }

  return 'https://your-render-app-name.onrender.com/api';
};

const getSocketUrl = () => {
  if (Constants.expoConfig?.extra?.socketUrl) {
    return Constants.expoConfig.extra.socketUrl;
  }

  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'ws://10.0.2.2:4000';
    }
    return 'ws://localhost:4000';
  }

  return 'wss://your-render-app-name.onrender.com';
};

export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();
export const ROLES = ['field_worker', 'site_admin', 'gov_authority', 'super_admin'];
