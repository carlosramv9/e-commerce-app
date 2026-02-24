import apiClient from './client';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types';

export const categoriesApi = {
  getAll: () => apiClient.get<Category[]>('/categories'),

  getTree: () => apiClient.get<Category[]>('/categories/tree'),

  getOne: (id: string) => apiClient.get<Category>(`/categories/${id}`),

  create: (data: CreateCategoryDto) => apiClient.post<Category>('/categories', data),

  update: (id: string, data: UpdateCategoryDto) =>
    apiClient.patch<Category>(`/categories/${id}`, data),

  delete: (id: string) => apiClient.delete(`/categories/${id}`),
};

export default categoriesApi;
