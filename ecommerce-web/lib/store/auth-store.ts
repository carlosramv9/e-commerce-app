import { create } from 'zustand';
import { User, LoginDto, AuthResponse } from '../types';
import apiClient from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials: LoginDto) => {
    try {
      console.log('Auth store - login called with:', credentials);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');

      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      console.log('Auth store - API response:', response.data);

      const { user, accessToken } = response.data;

      // Save to localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('Auth store - login successful');
    } catch (error) {
      console.error('Auth store - login error:', error);

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initialize: async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        set({ isLoading: false });
        return;
      }

      // Verify token is still valid by fetching current user
      const response = await apiClient.get<User>('/auth/me');
      const user = response.data;

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // Token is invalid, clear everything
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));

// Helper functions for role-based access
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
};

export const isSuperAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'SUPER_ADMIN';
};

export const canManageUsers = (user: User | null): boolean => {
  return isAdmin(user);
};

export const canManageProducts = (user: User | null): boolean => {
  if (!user) return false;
  return ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role);
};

export const canAccessPOS = (user: User | null): boolean => {
  if (!user) return false;
  return ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'CASHIER'].includes(user.role);
};
