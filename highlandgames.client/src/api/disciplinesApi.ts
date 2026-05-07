import { api } from './client';
import type { DisciplineDto } from './types';

export const disciplinesApi = {
    getAll: () => api.get<DisciplineDto[]>('/disciplines'),
    getById: (id: string) => api.get<DisciplineDto>(`/disciplines/${id}`),
    updateStatus: (id: string, status: string) => api.put<void>(`/disciplines/${id}/status`, { status }),
    create: (name: string, number: number, description: string | undefined, measurementType: string, image: File | null) => {
        const form = new FormData();
        form.append('name', name);
        form.append('number', String(number));
        form.append('measurementType', measurementType);
        if (description) form.append('description', description);
        if (image) form.append('image', image);
        return api.postForm<DisciplineDto>('/disciplines', form);
    },
    delete: (id: string) => api.delete<void>(`/disciplines/${id}`),
};