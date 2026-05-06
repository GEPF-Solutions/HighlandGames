import { api } from './client';
import type { TeamDto, CreateTeamDto } from './types';

export const teamsApi = {
    getAll: () => api.get<TeamDto[]>('/teams'),
    getByGender: (gender: string) => api.get<TeamDto[]>(`/teams/${gender}`),
    create: (dto: CreateTeamDto) => api.post<TeamDto>('/teams', dto),
    delete: (id: string) => api.delete<void>(`/teams/${id}`),
    setTiebreakerRank: (id: string, rank: number | null) => api.put<void>(`/teams/${id}/tiebreaker`, { rank }),
    setTiebreakerRanksBulk: (ranks: { id: string; rank: number }[]) => api.put<void>('/teams/tiebreaker/bulk', { ranks }),
};