import { api } from './client';
import type { TeamDto, CreateTeamDto } from './types';

export const teamsApi = {
    getAll: () => api.get<TeamDto[]>('/teams'),
    getByGender: (gender: string) => api.get<TeamDto[]>(`/teams/${gender}`),
    create: (dto: CreateTeamDto) => api.post<TeamDto>('/teams', dto),
    delete: (id: string) => api.delete<void>(`/teams/${id}`),
};