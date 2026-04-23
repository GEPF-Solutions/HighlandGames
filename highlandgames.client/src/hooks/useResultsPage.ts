import { useState, useEffect } from 'react';
import type { DisciplineDto, LeaderboardEntryDto, ResultDto } from '../api/types';
import { disciplinesApi } from '../api/disciplinesApi';
import { resultsApi } from '../api/resultsApi';
import { useSignalR } from './useSignalR';
import type { Gender } from '../api/types';

export function useResultsPage() {
    const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
    const [gender, setGender] = useState<Gender>('m');
    const [activeTab, setActiveTab] = useState<string>('total');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntryDto[]>([]);
    const [discResults, setDiscResults] = useState<ResultDto[]>([]);
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
                    const data = await resultsApi.getLeaderboard(gender);
                    setLeaderboard(data);
                } else {
                    const data = await resultsApi.getByDiscipline(activeTab);
                    setDiscResults(data);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [gender, activeTab]);

    useEffect(() => {
        joinGroup('JoinLeaderboard', gender);

        on('LeaderboardUpdated', (data: unknown) => {
            setLeaderboard(data as LeaderboardEntryDto[]);
        });

        on('ResultUpdated', (data: unknown) => {
            const result = data as ResultDto;
            setDiscResults(prev => {
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
    }, [gender]);

    return { disciplines, gender, setGender, activeTab, setActiveTab, leaderboard, discResults, loading };
}