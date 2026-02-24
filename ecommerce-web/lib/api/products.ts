import apiClient from './client';
import { Product, PaginatedResponse, CreateProductDto, UpdateProductDto } from '../types';

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: string;
}

export const productsApi = {
  getAll: (params?: QueryParams) =>
    apiClient.get<PaginatedResponse<Product>>('/products', { params }),

  getOne: (id: string) => apiClient.get<Product>(`/products/${id}`),

  create: (data: CreateProductDto) => apiClient.post<Product>('/products', data),

  update: (id: string, data: UpdateProductDto) =>
    apiClient.patch<Product>(`/products/${id}`, data),

  delete: (id: string) => apiClient.delete(`/products/${id}`),

  getLowStock: () => apiClient.get<Product[]>('/products/low-stock'),

  addImage: (id: string, data: { url: string; alt?: string; isPrimary?: boolean }) =>
    apiClient.post(`/products/${id}/images`, data),

  deleteImage: (id: string, imageId: string) =>
    apiClient.delete(`/products/${id}/images/${imageId}`),

  updateStock: (id: string, data: { stock: number }) =>
    apiClient.patch(`/products/${id}/stock`, data),
};

export default productsApi;
