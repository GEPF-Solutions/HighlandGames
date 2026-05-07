import { api } from './client';
import type { MatchDto } from './types';

export const getMatches = (disciplineId?: string, gender?: string): Promise<MatchDto[]> => {
    const params = new URLSearchParams();
    if (disciplineId) params.append('disciplineId', disciplineId);
    if (gender) params.append('gender', gender);
    return api.get(`/matches?${params}`);
};

export const createMatch = (disciplineId: string, gender: string, teamAId: string, teamBId: string | null): Promise<MatchDto> =>
    api.post('/matches', { disciplineId, gender, teamAId, teamBId });

export const updateMatch = (id: string, data: {
    teamAScore?: number | null;
    teamBScore?: number | null;
    winnerTeamId?: string | null;
}): Promise<MatchDto> =>
    api.put(`/matches/${id}`, data);

export const deleteMatch = (id: string): Promise<void> =>
    api.delete(`/matches/${id}`);

export const deleteMatchesByDiscipline = (disciplineId: string, gender: string): Promise<void> =>
    api.delete(`/matches/${disciplineId}/${gender}`);

export const reorderMatches = (disciplineId: string, gender: string, ids: string[]): Promise<void> =>
    api.put(`/matches/${disciplineId}/${gender}/reorder`, { ids });
