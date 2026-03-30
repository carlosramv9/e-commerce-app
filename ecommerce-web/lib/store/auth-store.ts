'use client';

import { create } from 'zustand';
import { User, LoginDto, AuthResponse, TenantSummary, SelectTenantResponse } from '../types';
import apiClient from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentTenant: TenantSummary | null;
  availableTenants: TenantSummary[];
  currentBranchId: string | null;
  posOnly: boolean;

  login: (credentials: LoginDto) => Promise<AuthResponse>;
  /** Selects tenant — returns new JWT with tenantId + posOnly flag */
  selectTenant: (slug: string) => Promise<{ posOnly: boolean }>;
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
  posOnly: false,

  login: async (credentials: LoginDto) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    const { user, accessToken, availableTenants } = response.data;

    localStorage.setItem('token', accessToken);

    set({
      user,
      token: accessToken,
      isAuthenticated: true,
      isLoading: false,
      currentTenant: null,
      availableTenants: availableTenants ?? [],
    });

    return response.data;
  },

  selectTenant: async (slug: string) => {
    const response = await apiClient.patch<SelectTenantResponse>(
      `/auth/select-tenant/${slug}`,
    );
    const { tenant, accessToken, posOnly } = response.data;

    localStorage.setItem('token', accessToken);
    localStorage.setItem('posOnly', String(posOnly ?? false));

    set((state) => ({
      token: accessToken,
      currentTenant: tenant,
      availableTenants: state.availableTenants,
      currentBranchId: null,
      posOnly: posOnly ?? false,
    }));

    return { posOnly: posOnly ?? false };
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('posOnly');

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      currentTenant: null,
      availableTenants: [],
      currentBranchId: null,
      posOnly: false,
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
      const posOnly = localStorage.getItem('posOnly') === 'true';

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        currentTenant: currentTenant ?? null,
        currentBranchId: currentBranchId ?? null,
        posOnly,
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
