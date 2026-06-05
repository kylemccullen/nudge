import { api } from './client';
import type { AssignMoreTasksRequest, CreateTaskRequest, ScheduledTasksResponse, UpdateTaskRequest } from '../types';

export const tasksApi = {
  getScheduled: () => api.get<ScheduledTasksResponse>('/api/tasks'),
  create:       (body: CreateTaskRequest)       => api.post<void>('/api/tasks', body),
  update:       (id: number, body: UpdateTaskRequest) => api.put<void>(`/api/tasks/${id}`, body),
  toggle:       (id: number)  => api.patch<void>(`/api/tasks/${id}/toggle`),
  delete:       (id: number)  => api.delete<void>(`/api/tasks/${id}`),
  assignMore:   (body: AssignMoreTasksRequest) => api.post<void>('/api/day-capacity', body),
};
