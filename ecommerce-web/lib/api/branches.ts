import apiClient from './client';
import { Branch, BranchInventoryItem, BranchMember } from '../types';

export const branchesApi = {
  getAll: () => apiClient.get<Branch[]>('/branches'),

  getOne: (id: string) => apiClient.get<Branch>(`/branches/${id}`),

  create: (data: {
    name: string;
    code: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    email?: string;
    managerId?: string;
    isMain?: boolean;
    settings?: Record<string, any>;
  }) => apiClient.post<Branch>('/branches', data),

  update: (id: string, data: Partial<{
    name: string;
    code: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
    managerId: string;
    isMain: boolean;
    status: string;
    settings: Record<string, any>;
  }>) => apiClient.patch<Branch>(`/branches/${id}`, data),

  remove: (id: string) => apiClient.delete(`/branches/${id}`),

  setMain: (id: string) => apiClient.patch<Branch>(`/branches/${id}/set-main`),

  // Members
  addMember: (branchId: string, userId: string, isPrimary?: boolean) =>
    apiClient.post(`/branches/${branchId}/members/${userId}`, { isPrimary }),

  removeMember: (branchId: string, userId: string) =>
    apiClient.delete(`/branches/${branchId}/members/${userId}`),

  // Inventory
  getInventory: (branchId: string) =>
    apiClient.get<BranchInventoryItem[]>(`/branches/${branchId}/inventory`),

  updateInventoryItem: (branchId: string, productId: string, stock: number) =>
    apiClient.patch<BranchInventoryItem>(`/branches/${branchId}/inventory/${productId}`, { stock }),

  bulkUpdateInventory: (branchId: string, items: Array<{ productId: string; stock: number }>) =>
    apiClient.post(`/branches/${branchId}/inventory/bulk`, { items }),

  transferStock: (fromBranchId: string, data: { toBranchId: string; productId: string; quantity: number }) =>
    apiClient.post(`/branches/${fromBranchId}/inventory/transfer`, data),
};
