import { useState, useEffect } from 'react';
import type { DisciplineDto } from '../api/types';
import { disciplinesApi } from '../api/disciplinesApi';
import { useSignalR } from './useSignalR';

export function useLiveDisc() {
    const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
    const { on, off } = useSignalR();

    useEffect(() => {
        disciplinesApi.getAll().then(setDisciplines);
    }, []);

    useEffect(() => {
        on('DisciplineStatusChanged', (data: unknown) => {
            const updated = data as DisciplineDto;
            setDisciplines(prev => prev.map(d => d.id === updated.id ? updated : d));
        });
        return () => off('DisciplineStatusChanged');
    }, []);

    return {
        liveDisc: disciplines.find(d => d.status === 'live') ?? null,
        nextDisc: disciplines.find(d => d.status === 'next') ?? null,
    };
}
