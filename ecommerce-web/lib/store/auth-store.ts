'use client';

import { create } from 'zustand';
import { User, LoginDto, AuthResponse, TenantSummary } from '../types';
import apiClient from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentTenant: TenantSummary | null;
  availableTenants: TenantSummary[];
  currentBranchId: string | null;

  login: (credentials: LoginDto) => Promise<AuthResponse>;
  /** Saves tenant selection to DB — no new JWT */
  selectTenant: (slug: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  currentTenant: null,
  availableTenants: [],
  currentBranchId: null,

  login: async (credentials: LoginDto) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    const { user, accessToken, tenant, availableTenants } = response.data;

    localStorage.setItem('token', accessToken);

    set({
      user,
      token: accessToken,
      isAuthenticated: true,
      isLoading: false,
      currentTenant: tenant ?? null,
      availableTenants: availableTenants ?? [],
    });

    return response.data;
  },

  selectTenant: async (slug: string) => {
    const response = await apiClient.patch<{ tenant: TenantSummary }>(
      `/auth/select-tenant/${slug}`,
    );
    const { tenant } = response.data;

    set((state) => ({
      currentTenant: tenant,
      availableTenants: state.availableTenants,
      currentBranchId: null, // reset branch when changing tenant
    }));
  },

  logout: () => {
    localStorage.removeItem('token');

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      currentTenant: null,
      availableTenants: [],
      currentBranchId: null,
    });
  },

  initialize: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const response = await apiClient.get<{
        user: User;
        currentTenant?: TenantSummary;
        currentBranchId?: string;
      }>('/auth/me');

      const { user, currentTenant, currentBranchId } = response.data;

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        currentTenant: currentTenant ?? null,
        currentBranchId: currentBranchId ?? null,
      });
    } catch {
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        currentTenant: null,
        availableTenants: [],
        currentBranchId: null,
      });
    }
  },

  setUser: (user: User) => {
    set({ user });
  },
}));

// ── Role helpers ──────────────────────────────────────────────────────────────

export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
};

export const isSuperAdmin = (user: User | null): boolean => {
  return user?.role === 'SUPER_ADMIN';
};

export const canManageUsers = (user: User | null): boolean => isAdmin(user);

export const canManageProducts = (user: User | null): boolean => {
  if (!user) return false;
  return ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role);
};

export const canAccessPOS = (user: User | null): boolean => {
  if (!user) return false;
  return ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'CASHIER'].includes(user.role);
};
