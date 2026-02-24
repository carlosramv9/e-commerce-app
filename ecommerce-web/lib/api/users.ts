import apiClient from './client';
import { User, PaginatedResponse, CreateUserDto, UpdateUserDto } from '../types';

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
};

export default usersApi;
