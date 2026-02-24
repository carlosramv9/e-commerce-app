import apiClient from './client';
import { Order, PaginatedResponse, CreateOrderDto } from '../types';

interface QueryParams {
  page?: number;
  limit?: number;
  status?: string;
  customerId?: string;
}

export const ordersApi = {
  getAll: (params?: QueryParams) =>
    apiClient.get<PaginatedResponse<Order>>('/orders', { params }),

  getOne: (id: string) => apiClient.get<Order>(`/orders/${id}`),

  create: (data: CreateOrderDto) => apiClient.post<Order>('/orders', data),

  updateStatus: (id: string, status: string) =>
    apiClient.patch<Order>(`/orders/${id}/status`, { status }),

  sendReceipt: (id: string, email: string) =>
    apiClient.post(`/orders/${id}/send-receipt`, { email }),

  getStats: () =>
    apiClient.get<{ totalOrders: number; totalRevenue: number; pendingOrders: number }>('/orders/stats'),
};

export default ordersApi;
