import { useState, useEffect } from 'react';
import type { DisciplineDto } from '../api/types';
import { disciplinesApi } from '../api/disciplinesApi';
import { useSignalR } from './useSignalR';

export function useLiveDisc() {
    const [liveDisc, setLiveDisc] = useState<DisciplineDto | null>(null);
    const { on, off } = useSignalR();

    useEffect(() => {
        disciplinesApi.getAll().then(discs => {
            setLiveDisc(discs.find(d => d.status === 'live') ?? null);
        });
    }, []);

    useEffect(() => {
        on('DisciplineStatusChanged', (data: unknown) => {
            const disc = data as DisciplineDto;
            if (disc.status === 'live') {
                setLiveDisc(disc);
            } else {
                setLiveDisc(prev => prev?.id === disc.id ? null : prev);
            }
        });

        return () => { off('DisciplineStatusChanged'); };
    }, []);

    return liveDisc;
}
