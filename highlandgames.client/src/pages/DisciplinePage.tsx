import { useState, useEffect } from 'react';
import type { DisciplineDto, ResultDto } from '../api/types';
import { disciplinesApi } from '../api/disciplinesApi';
import { resultsApi } from '../api/resultsApi';
import { Separator } from '../components/Separator';
import { useSignalR } from '../hooks/useSignalR';

interface DisciplinePageProps {
    discId: string;
    navigate: (page: string) => void;
}

const statusLabel: Record<string, string> = {
    done: 'Abgeschlossen',
    live: 'Läuft',
    next: 'Als nächstes',
    upcoming: 'Geplant',
};

const statusStyle: Record<string, { background: string; color: string; border: string }> = {
    done: { background: 'rgba(45,107,71,.25)', color: '#7dc49e', border: '1px solid rgba(45,107,71,.4)' },
    live: { background: 'rgba(122,28,28,.35)', color: '#e07070', border: '1px solid rgba(200,60,60,.4)' },
    next: { background: 'rgba(201,148,58,.18)', color: 'var(--gold)', border: '1px solid rgba(201,148,58,.35)' },
    upcoming: { background: 'rgba(240,230,204,.06)', color: 'var(--cream-dark)', border: '1px solid rgba(240,230,204,.15)' },
};

export function DisciplinePage({ discId, navigate }: DisciplinePageProps) {
    const [discipline, setDiscipline] = useState<DisciplineDto | null>(null);
    const [results, setResults] = useState<ResultDto[]>([]);
    const { on, off, joinGroup } = useSignalR();

    useEffect(() => {
        disciplinesApi.getById(discId).then(setDiscipline);
        resultsApi.getByDiscipline(discId).then(setResults);
    }, [discId]);

    useEffect(() => {
        joinGroup('JoinDiscipline', discId);

        on('ResultUpdated', (data: unknown) => {
            const result = data as ResultDto;
            setResults(prev => {
                const idx = prev.findIndex(r => r.id === result.id);
                if (idx >= 0) {
                    const updated = [...prev];
                    updated[idx] = result;
                    return updated;
                }
                return [...prev, result];
            });
        });

        return () => off('ResultUpdated');
    }, [discId]);

    const rankMedal = (i: number) => {
        if (i === 0) return '🥇';
        if (i === 1) return '🥈';
        if (i === 2) return '🥉';
        return String(i + 1);
    };

    const renderTable = (genderResults: ResultDto[], color: string) => (
        genderResults.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                <thead style={{ background: 'var(--green-dark)' }}>
                    <tr>
                        {['#', 'Team', 'Punkte', 'Wert'].map(h => (
                            <th key={h} style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', padding: '14px 18px', textAlign: 'left', borderBottom: '1px solid rgba(201,148,58,.25)' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {genderResults.map((r, i) => (
                        <tr key={r.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                            <td style={{ padding: '12px 18px', fontFamily: 'Cinzel, serif', color: i === 0 ? '#f0c040' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--cream-dark)', borderBottom: '1px solid rgba(240,230,204,.07)' }}>{rankMedal(i)}</td>
                            <td style={{ padding: '12px 18px', color: 'var(--cream)', borderBottom: '1px solid rgba(240,230,204,.07)' }}>{r.teamName}</td>
                            <td style={{ padding: '12px 18px', color, fontFamily: 'Cinzel, serif', fontWeight: 700, borderBottom: '1px solid rgba(240,230,204,.07)' }}>{r.points}</td>
                            <td style={{ padding: '12px 18px', color: 'var(--cream-dark)', opacity: .7, fontStyle: 'italic', borderBottom: '1px solid rgba(240,230,204,.07)' }}>{r.rawValue ?? '–'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, color: 'var(--cream-dark)', opacity: .4, border: '1px dashed rgba(201,148,58,.2)' }}>
                Noch keine Ergebnisse
            </div>
        )
    );

    if (!discipline) return null;

    const style = statusStyle[discipline.status] ?? statusStyle.upcoming;
    const mResults = results.filter(r => r.teamName).sort((a, b) => b.points - a.points);

    return (
        <div className="page-enter" style={{ padding: '60px 40px', maxWidth: 1000, margin: '0 auto' }}>
            <button onClick={() => navigate('matches')} style={{
                background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer',
                fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, marginBottom: 24, padding: 0,
            }}>
                ← Alle Begegnungen
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 44 }}>{discipline.icon}</span>
                <div>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4, display: 'block' }}>
                        Spiel {discipline.number}
                    </span>
                    <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: 'var(--cream)' }}>
                        {discipline.name}
                    </h2>
                </div>
                <span style={{ marginLeft: 'auto', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, padding: '3px 10px', borderRadius: 2, textTransform: 'uppercase', ...style }}>
                    {statusLabel[discipline.status]}
                </span>
            </div>

            {discipline.description && (
                <p style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--cream-dark)', opacity: .8, marginBottom: 40, maxWidth: 600 }}>
                    {discipline.description}
                </p>
            )}

            <Separator />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                {[{ label: 'Männer', color: '#7aadff' }, { label: 'Frauen', color: '#ff8aaa' }].map(({ label, color }) => (
                    <div key={label}>
                        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, color, marginBottom: 12, textTransform: 'uppercase' }}>
                            {label}
                        </div>
                        <div style={{ border: '1px solid rgba(201,148,58,.2)', overflow: 'hidden' }}>
                            {renderTable(mResults, color)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}