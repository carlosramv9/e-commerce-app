import apiClient from './client';
import { Customer, PaginatedResponse } from '../types';

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
};

export default customersApi;
