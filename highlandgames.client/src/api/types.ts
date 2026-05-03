export type Gender = 'm' | 'f';
export type DisciplineStatus = 'upcoming' | 'next' | 'live' | 'done';

export interface TeamDto {
    id: string;
    name: string;
    gender: Gender;
}

export interface DisciplineDto {
    id: string;
    number: number;
    name: string;
    icon?: string;
    description?: string;
    status: DisciplineStatus;
}

export interface ResultDto {
    id: string;
    teamId: string;
    teamName: string;
    gender: Gender;
    disciplineId: string;
    points: number;
    rawValue?: string;
    updatedAt: string;
}

export interface LeaderboardEntryDto {
    teamId: string;
    teamName: string;
    gender: Gender;
    totalPoints: number;
}

export interface CreateTeamDto {
    name: string;
    gender: Gender;
}

export interface UpsertResultDto {
    teamId: string;
    disciplineId: string;
    points: number;
    rawValue?: string;
}

export interface MatchDto {
    id: string;
    disciplineId: string;
    gender: Gender;
    teamAId: string;
    teamAName: string;
    teamBId: string;
    teamBName: string;
    teamAScore: number | null;
    teamBScore: number | null;
    winnerTeamId: string | null;
    isManualOverride: boolean;
}