import apiClient from './client';
import { User, PaginatedResponse, CreateUserDto, UpdateUserDto, UserWithRoles } from '../types';

interface QueryParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
}

export const usersApi = {
  getAll: (params?: QueryParams) =>
    apiClient.get<PaginatedResponse<User>>('/users', { params }),

  getOne: (id: string) => apiClient.get<User>(`/users/${id}`),

  create: (data: CreateUserDto) => apiClient.post<User>('/users', data),

  update: (id: string, data: UpdateUserDto) => apiClient.patch<User>(`/users/${id}`, data),

  delete: (id: string) => apiClient.delete(`/users/${id}`),

  // Roles & permissions
  getRoles: (id: string) => apiClient.get<UserWithRoles>(`/users/${id}/roles`),
  setRoles: (id: string, roleIds: string[]) =>
    apiClient.put(`/users/${id}/roles`, { roleIds }),
  setPermissions: (
    id: string,
    grants: { permissionId: string; granted: boolean }[],
  ) => apiClient.put(`/users/${id}/permissions`, { grants }),
  getEffectivePermissions: (id: string) =>
    apiClient.get<string[]>(`/users/${id}/effective-permissions`),
};

export default usersApi;
