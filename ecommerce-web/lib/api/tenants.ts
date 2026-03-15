import apiClient from './client';
import { Tenant, TenantMember } from '../types';

export const tenantsApi = {
  /** Super-admin: list all tenants */
  getAll: () => apiClient.get<Tenant[]>('/tenants'),

  /** Super-admin: get one tenant by id */
  getOne: (id: string) => apiClient.get<Tenant>(`/tenants/${id}`),

  /** Super-admin: create tenant (optionally with owner) */
  create: (data: {
    name: string;
    slug: string;
    plan?: string;
    settings?: Record<string, any>;
    ownerEmail?: string;
    ownerFirstName?: string;
    ownerLastName?: string;
    ownerPassword?: string;
  }) => apiClient.post<Tenant>('/tenants', data),

  /** Super-admin: update tenant */
  update: (id: string, data: Partial<{ name: string; slug: string; plan: string; status: string; settings: Record<string, any> }>) =>
    apiClient.patch<Tenant>(`/tenants/${id}`, data),

  /** Super-admin: delete tenant */
  remove: (id: string) => apiClient.delete(`/tenants/${id}`),

  /** Current tenant: list members */
  listMembers: () => apiClient.get<TenantMember[]>('/tenants/current/members'),

  /** Current tenant: add member */
  addMember: (userId: string, role?: string) =>
    apiClient.post(`/tenants/current/members/${userId}`, { role }),

  /** Current tenant: remove member */
  removeMember: (userId: string) =>
    apiClient.delete(`/tenants/current/members/${userId}`),

  /** Select a tenant — saves to user record, no new JWT needed */
  switchTenant: (slug: string) =>
    apiClient.patch<{ tenant: { id: string; name: string; slug: string; memberRole: string; plan: string } }>(
      `/auth/select-tenant/${slug}`,
    ),
};
