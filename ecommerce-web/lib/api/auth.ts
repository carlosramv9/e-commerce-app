import apiClient from './client';
import { AuthResponse, LoginDto, User } from '../types';

export const authApi = {
  login: (credentials: LoginDto) =>
    apiClient.post<AuthResponse>('/auth/login', credentials),

  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  me: () => apiClient.get<User>('/auth/me'),
};

export default authApi;
