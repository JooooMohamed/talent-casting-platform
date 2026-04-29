import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:4000/api/v1'   // Android emulator → host localhost
    : 'http://localhost:4000/api/v1'   // iOS simulator → host localhost
  : 'https://talent-casting-api.vercel.app/api/v1';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const [userId, refreshToken] = await Promise.all([
          AsyncStorage.getItem('userId'),
          AsyncStorage.getItem('refreshToken'),
        ]);
        if (!userId || !refreshToken) throw new Error();

        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { userId, refreshToken });
        await Promise.all([
          AsyncStorage.setItem('accessToken', data.data.accessToken),
          AsyncStorage.setItem('refreshToken', data.data.refreshToken),
        ]);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userId', 'user']);
      }
    }
    return Promise.reject(error);
  },
);
