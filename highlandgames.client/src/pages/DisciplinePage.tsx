import { useState, useEffect } from 'react';
import type { DisciplineDto, ResultDto, MatchDto } from '../api/types';
import { disciplinesApi } from '../api/disciplinesApi';
import { resultsApi } from '../api/resultsApi';
import { getMatches } from '../api/matches';
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

const thStyle: React.CSSProperties = {
    fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2,
    textTransform: 'uppercase', color: 'var(--gold)',
    padding: '14px 18px', textAlign: 'left',
    borderBottom: '1px solid rgba(201,148,58,.25)',
};

const tdStyle: React.CSSProperties = {
    padding: '12px 18px',
    borderBottom: '1px solid rgba(240,230,204,.07)',
};

const emptyStyle: React.CSSProperties = {
    padding: '40px 20px', textAlign: 'center',
    fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2,
    color: 'var(--cream-dark)', opacity: .4,
    border: '1px dashed rgba(201,148,58,.2)',
};

const rankMedal = (i: number) => {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return String(i + 1);
};

const rankColor = (i: number) =>
    i === 0 ? '#f0c040' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--cream-dark)';

export function DisciplinePage({ discId, navigate }: DisciplinePageProps) {
    const [discipline, setDiscipline] = useState<DisciplineDto | null>(null);
    const [results, setResults] = useState<ResultDto[]>([]);
    const [matchesM, setMatchesM] = useState<MatchDto[]>([]);
    const [matchesF, setMatchesF] = useState<MatchDto[]>([]);
    const { on, off, joinGroup } = useSignalR();

    const loadMatches = () => {
        getMatches(discId, 'm').then(setMatchesM);
        getMatches(discId, 'f').then(setMatchesF);
    };

    useEffect(() => {
        disciplinesApi.getById(discId).then(setDiscipline);
        resultsApi.getByDiscipline(discId).then(setResults);
        loadMatches();
    }, [discId]);

    useEffect(() => {
        joinGroup('JoinDiscipline', discId);
        joinGroup('JoinMatchesGroup', discId);

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

        on('MatchesUpdated', () => loadMatches());

        return () => { off('ResultUpdated'); off('MatchesUpdated'); };
    }, [discId]);

    const renderResults = (genderResults: ResultDto[], color: string) =>
        genderResults.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                <thead style={{ background: 'var(--green-dark)' }}>
                    <tr>
                        {['#', 'Team', 'Punkte', 'Wert'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {genderResults.map((r, i) => (
                        <tr key={r.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                            <td style={{ ...tdStyle, fontFamily: 'Cinzel, serif', color: rankColor(i) }}>{rankMedal(i)}</td>
                            <td style={{ ...tdStyle, color: 'var(--cream)' }}>{r.teamName}</td>
                            <td style={{ ...tdStyle, color, fontFamily: 'Cinzel, serif', fontWeight: 700 }}>{r.points}</td>
                            <td style={{ ...tdStyle, color: 'var(--cream-dark)', opacity: .7, fontStyle: 'italic' }}>{r.rawValue ?? '–'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : <div style={emptyStyle}>Noch keine Ergebnisse</div>;

    const renderMatches = (matchList: MatchDto[]) =>
        matchList.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                <thead style={{ background: 'var(--green-dark)' }}>
                    <tr>
                        {['Team A', 'Score', 'Team B', 'Sieger'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {matchList.map((m, i) => (
                        <tr key={m.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                            <td style={{ ...tdStyle, color: m.winnerTeamId === m.teamAId ? 'var(--gold)' : 'var(--cream)' }}>{m.teamAName}</td>
                            <td style={{ ...tdStyle, fontFamily: 'Cinzel, serif', color: 'var(--cream-dark)' }}>{m.teamAScore ?? '–'} : {m.teamBScore ?? '–'}</td>
                            <td style={{ ...tdStyle, color: m.winnerTeamId === m.teamBId ? 'var(--gold)' : 'var(--cream)' }}>{m.teamBName}</td>
                            <td style={{ ...tdStyle, color: '#7dc49e', fontFamily: 'Cinzel, serif', fontSize: 12 }}>
                                {m.winnerTeamId ? (m.winnerTeamId === m.teamAId ? m.teamAName : m.teamBName) : '–'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : <div style={emptyStyle}>Noch keine Begegnungen</div>;

    if (!discipline) return null;

    const style = statusStyle[discipline.status] ?? statusStyle.upcoming;
    const mResults = results.filter(r => r.gender === 'm').sort((a, b) => b.points - a.points);
    const fResults = results.filter(r => r.gender === 'f').sort((a, b) => b.points - a.points);

    const genders = [
        { label: 'Männer', color: '#7aadff', results: mResults, matches: matchesM },
        { label: 'Frauen', color: '#ff8aaa', results: fResults, matches: matchesF },
    ];

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

            {/* Begegnungen */}
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 3, color: 'var(--gold)', marginBottom: 16, textTransform: 'uppercase' }}>Begegnungen</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 48 }}>
                {genders.map(({ label, color, matches }) => (
                    <div key={label}>
                        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, color, marginBottom: 12, textTransform: 'uppercase' }}>{label}</div>
                        <div style={{ border: '1px solid rgba(201,148,58,.2)', overflow: 'hidden' }}>
                            {renderMatches(matches)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Ergebnisse */}
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 3, color: 'var(--gold)', marginBottom: 16, textTransform: 'uppercase' }}>Ergebnisse</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                {genders.map(({ label, color, results: res }) => (
                    <div key={label}>
                        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, color, marginBottom: 12, textTransform: 'uppercase' }}>{label}</div>
                        <div style={{ border: '1px solid rgba(201,148,58,.2)', overflow: 'hidden' }}>
                            {renderResults(res, color)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}