import { api } from './client';
import type { MatchDto } from './types';

export const getMatches = (disciplineId?: string, gender?: string): Promise<MatchDto[]> => {
    const params = new URLSearchParams();
    if (disciplineId) params.append('disciplineId', disciplineId);
    if (gender) params.append('gender', gender);
    return api.get(`/matches?${params}`);
};

export const generateMatches = (disciplineId: string, gender: string): Promise<MatchDto[]> =>
    api.post('/matches/generate', { disciplineId, gender });

export const updateMatch = (id: string, data: {
    teamAScore?: number | null;
    teamBScore?: number | null;
    winnerTeamId?: string | null;
}): Promise<MatchDto> =>
    api.put(`/matches/${id}`, data);