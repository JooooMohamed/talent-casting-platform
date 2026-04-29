import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface AuthUser {
  _id: string;
  email: string;
  role: 'talent' | 'casting' | 'admin';
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  hydrate: async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('accessToken');
      if (userStr && token) {
        set({ user: JSON.parse(userStr), isAuthenticated: true });
      }
    } catch {}
    set({ isLoading: false });
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = data.data;
    await Promise.all([
      AsyncStorage.setItem('accessToken', accessToken),
      AsyncStorage.setItem('refreshToken', refreshToken),
      AsyncStorage.setItem('userId', user._id),
      AsyncStorage.setItem('user', JSON.stringify(user)),
    ]);
    set({ user, isAuthenticated: true });
  },

  register: async (email, password, role) => {
    const { data } = await api.post('/auth/register', { email, password, role });
    const { user, accessToken, refreshToken } = data.data;
    await Promise.all([
      AsyncStorage.setItem('accessToken', accessToken),
      AsyncStorage.setItem('refreshToken', refreshToken),
      AsyncStorage.setItem('userId', user._id),
      AsyncStorage.setItem('user', JSON.stringify(user)),
    ]);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch {}
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userId', 'user']);
    set({ user: null, isAuthenticated: false });
  },
}));
