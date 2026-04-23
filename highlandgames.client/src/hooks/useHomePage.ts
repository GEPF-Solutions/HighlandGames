import { useState, useEffect } from 'react';
import type { DisciplineDto, LeaderboardEntryDto } from '../api/types';
import { disciplinesApi } from '../api/disciplinesApi';
import { resultsApi } from '../api/resultsApi';
import { useSignalR } from './useSignalR';

export function useHomePage() {
    const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
    const [mLeaderboard, setMLeaderboard] = useState<LeaderboardEntryDto[]>([]);
    const [fLeaderboard, setFLeaderboard] = useState<LeaderboardEntryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const { on, off, joinGroup } = useSignalR();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [discs, mBoard, fBoard] = await Promise.all([
                    disciplinesApi.getAll(),
                    resultsApi.getLeaderboard('m'),
                    resultsApi.getLeaderboard('f'),
                ]);
                setDisciplines(discs);
                setMLeaderboard(mBoard);
                setFLeaderboard(fBoard);           
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        joinGroup('JoinLeaderboard', 'm');
        joinGroup('JoinLeaderboard', 'f');

        on('LeaderboardUpdated', (data: unknown) => {
            const leaderboard = data as LeaderboardEntryDto[];
            if (leaderboard[0]?.gender === 'm') setMLeaderboard(leaderboard);
            else setFLeaderboard(leaderboard);
        });

        return () => {
            off('LeaderboardUpdated');
        };
    }, []);

    const liveDisc = disciplines.find(d => d.status === 'live');
    const nextDisc = disciplines.find(d => d.status === 'next');

    return { disciplines, mLeaderboard, fLeaderboard, liveDisc, nextDisc, loading };
}