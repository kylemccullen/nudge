import { api } from './client';

export const dataApi = {
  exportData: () => api.get<string>('/api/data/export'),
  importData: (json: string) => api.post<void>('/api/data/import', JSON.parse(json)),
};
