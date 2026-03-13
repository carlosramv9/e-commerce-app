import apiClient from './client';
import { Permission, PermissionGroup } from '../types';

export const permissionsApi = {
  getGrouped: () => apiClient.get<PermissionGroup[]>('/permissions'),
  getFlat: () => apiClient.get<Permission[]>('/permissions/flat'),
};

export default permissionsApi;
