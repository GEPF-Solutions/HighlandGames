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

        return () => { off('LeaderboardUpdated'); };
    }, []);

    useEffect(() => {
        if (activeTab === 'total') { off('ResultUpdated'); return; }

        joinGroup('JoinDiscipline', activeTab);

        on('ResultUpdated', () => {
            resultsApi.getByDiscipline(activeTab).then(setAllDiscResults);
        });

        return () => { off('ResultUpdated'); };
    }, [activeTab]);

    const mDiscResults = allDiscResults.filter(r => r.gender === 'm' && r.points > 0).sort((a, b) => b.points - a.points);
    const fDiscResults = allDiscResults.filter(r => r.gender === 'f' && r.points > 0).sort((a, b) => b.points - a.points);

    return {
        disciplines, activeTab, setActiveTab,
        mLeaderboard: mLeaderboard.filter(e => e.totalPoints > 0),
        fLeaderboard: fLeaderboard.filter(e => e.totalPoints > 0),
        mDiscResults, fDiscResults, loading,
    };
}
