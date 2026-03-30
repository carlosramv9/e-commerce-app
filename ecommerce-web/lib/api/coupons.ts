import apiClient from './client';
import { Coupon, CreateCouponDto, UpdateCouponDto } from '../types';

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  scope?: string;
}

export const couponsApi = {
  getAll: (params?: QueryParams) =>
    apiClient.get<Coupon[]>('/coupons', { params }),

  getOne: (id: string) => apiClient.get<Coupon>(`/coupons/${id}`),

  create: (data: CreateCouponDto) => apiClient.post<Coupon>('/coupons', data),

  update: (id: string, data: UpdateCouponDto) =>
    apiClient.patch<Coupon>(`/coupons/${id}`, data),

  delete: (id: string) => apiClient.delete(`/coupons/${id}`),

  validate: (code: string, customerId?: string, totalAmount?: number) =>
    apiClient.post<{
      valid: boolean;
      message?: string;
      coupon?: Coupon;
      discountAmount?: number;
    }>('/coupons/validate', { code, customerId, totalAmount }),

  incrementUsage: (id: string) => apiClient.post(`/coupons/${id}/increment-usage`),
};

export default couponsApi;
