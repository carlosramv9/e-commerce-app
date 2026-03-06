import apiClient from './client';
import { Customer, PaginatedResponse, CreateCustomerDto, UpdateCustomerDto } from '../types';

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
}

export const customersApi = {
  getAll: (params?: QueryParams) =>
    apiClient.get<PaginatedResponse<Customer>>('/customers', { params }),

  getOne: (id: string) => apiClient.get<Customer>(`/customers/${id}`),

  create: (data: CreateCustomerDto) =>
    apiClient.post<Customer>('/customers', data),

  update: (id: string, data: UpdateCustomerDto) =>
    apiClient.patch<Customer>(`/customers/${id}`, data),
};

export default customersApi;
