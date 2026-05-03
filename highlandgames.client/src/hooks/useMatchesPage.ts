import { useState, useEffect } from 'react';
import { disciplinesApi } from '../api/disciplinesApi';
import { getMatches } from '../api/matches';
import { resultsApi } from '../api/resultsApi';
import { useSignalR } from './useSignalR';
import type { DisciplineDto, MatchDto, LeaderboardEntryDto } from '../api/types';

export function useMatchesPage() {
    const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
    const [matches, setMatches] = useState<MatchDto[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntryDto[]>([]);
    const { on, off, joinGroup } = useSignalR();

    const loadMatches = () => getMatches().then(setMatches);

    const loadLeaderboard = () =>
        Promise.all([resultsApi.getLeaderboard('m'), resultsApi.getLeaderboard('f')])
            .then(([m, f]) => setLeaderboard([...m, ...f]));

    useEffect(() => {
        disciplinesApi.getAll().then(setDisciplines);
        loadMatches();
        loadLeaderboard();
    }, []);

    useEffect(() => {
        disciplines.forEach(d => joinGroup('JoinMatchesGroup', d.id));
    }, [disciplines]);

    useEffect(() => {
        joinGroup('JoinLeaderboard', 'm');
        joinGroup('JoinLeaderboard', 'f');

        on('MatchesUpdated', loadMatches);
        on('LeaderboardUpdated', loadLeaderboard);
        on('DisciplineStatusChanged', (data: unknown) => {
            const updated = data as DisciplineDto;
            setDisciplines(prev => prev.map(d => d.id === updated.id ? updated : d));
        });

        return () => {
            off('MatchesUpdated');
            off('LeaderboardUpdated');
            off('DisciplineStatusChanged');
        };
    }, []);

    const pointsMap = new Map(leaderboard.map(e => [e.teamId, e.totalPoints]));

    return { disciplines, matches, pointsMap };
}
