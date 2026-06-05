import { api } from './client';
import type { InviteCodeDto, UserDto } from '../types';

export const adminApi = {
  getUsers:       () => api.get<UserDto[]>('/api/admin/users'),
  getInvites:     () => api.get<InviteCodeDto[]>('/api/admin/invites'),
  generateInvite: () => api.post<InviteCodeDto>('/api/admin/invites'),
};
