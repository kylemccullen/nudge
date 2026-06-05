import { api } from './client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export const authApi = {
  login:    (body: LoginRequest)    => api.post<AuthResponse>('/api/auth/login', body),
  register: (body: RegisterRequest) => api.post<AuthResponse>('/api/auth/register', body),
};
