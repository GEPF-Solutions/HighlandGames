import { api } from './client';
import type { ResultDto, LeaderboardEntryDto, UpsertResultDto } from './types';

export const resultsApi = {
    getAll: () => api.get<ResultDto[]>('/results'),
    getByDiscipline: (disciplineId: string) => api.get<ResultDto[]>(`/results/discipline/${disciplineId}`),
    getByTeam: (teamId: string) => api.get<ResultDto[]>(`/results/team/${teamId}`),
    getLeaderboard: (gender: string) => api.get<LeaderboardEntryDto[]>(`/results/leaderboard/${gender}`),
    upsert: (dto: UpsertResultDto) => api.post<ResultDto>('/results', dto),
    delete: (id: string) => api.delete<void>(`/results/${id}`),
};