import { api } from './client';
import type { DisciplineDto } from './types';

export const disciplinesApi = {
    getAll: () => api.get<DisciplineDto[]>('/disciplines'),
    getById: (id: string) => api.get<DisciplineDto>(`/disciplines/${id}`),
    updateStatus: (id: string, status: string) => api.put<void>(`/disciplines/${id}/status`, { status }),
};