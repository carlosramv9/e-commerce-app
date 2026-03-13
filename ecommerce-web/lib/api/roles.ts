import apiClient from './client';
import { Role, RoleWithPermissions } from '../types';

export interface CreateRoleDto {
  name: string;
  description?: string;
  color?: string;
  permissionIds?: string[];
}

export type UpdateRoleDto = Partial<CreateRoleDto>;

export const rolesApi = {
  getAll: () => apiClient.get<Role[]>('/roles'),
  getOne: (id: string) => apiClient.get<RoleWithPermissions>(`/roles/${id}`),
  create: (data: CreateRoleDto) => apiClient.post<RoleWithPermissions>('/roles', data),
  update: (id: string, data: UpdateRoleDto) =>
    apiClient.patch<RoleWithPermissions>(`/roles/${id}`, data),
  delete: (id: string) => apiClient.delete(`/roles/${id}`),
  setPermissions: (id: string, permissionIds: string[]) =>
    apiClient.put(`/roles/${id}/permissions`, { permissionIds }),
};

export default rolesApi;
