import { useState, useEffect } from 'react';
import type { DisciplineDto, LeaderboardEntryDto, ResultDto } from '../api/types';
import { disciplinesApi } from '../api/disciplinesApi';
import { resultsApi } from '../api/resultsApi';
import { useSignalR } from './useSignalR';

export function useResultsPage() {
    const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
    const [activeTab, setActiveTab] = useState<string>('total');
    const [mLeaderboard, setMLeaderboard] = useState<LeaderboardEntryDto[]>([]);
    const [fLeaderboard, setFLeaderboard] = useState<LeaderboardEntryDto[]>([]);
    const [allDiscResults, setAllDiscResults] = useState<ResultDto[]>([]);
    const [loading, setLoading] = useState(true);
    const { on, off, joinGroup } = useSignalR();

    useEffect(() => {
        disciplinesApi.getAll().then(setDisciplines);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                if (activeTab === 'total') {
                    const [m, f] = await Promise.all([
                        resultsApi.getLeaderboard('m'),
                        resultsApi.getLeaderboard('f'),
                    ]);
                    setMLeaderboard(m);
                    setFLeaderboard(f);
                } else {
                    const data = await resultsApi.getByDiscipline(activeTab);
                    setAllDiscResults(data);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [activeTab]);

    useEffect(() => {
        joinGroup('JoinLeaderboard', 'm');
        joinGroup('JoinLeaderboard', 'f');

        on('LeaderboardUpdated', (data: unknown) => {
            const leaderboard = data as LeaderboardEntryDto[];
            if (leaderboard[0]?.gender === 'm') setMLeaderboard(leaderboard);
            else setFLeaderboard(leaderboard);
        });

        on('ResultUpdated', (data: unknown) => {
            const result = data as ResultDto;
            setAllDiscResults(prev => {
                const idx = prev.findIndex(r => r.id === result.id);
                if (idx >= 0) {
                    const updated = [...prev];
                    updated[idx] = result;
                    return updated;
                }
                return [...prev, result];
            });
        });

        return () => {
            off('LeaderboardUpdated');
            off('ResultUpdated');
        };
    }, []);

    const mDiscResults = allDiscResults.filter(r => r.gender === 'm').sort((a, b) => b.points - a.points);
    const fDiscResults = allDiscResults.filter(r => r.gender === 'f').sort((a, b) => b.points - a.points);

    return { disciplines, activeTab, setActiveTab, mLeaderboard, fLeaderboard, mDiscResults, fDiscResults, loading };
}
