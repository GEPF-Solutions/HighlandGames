import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { DisciplineDto, ResultDto, MatchDto } from '../api/types';
import { disciplinesApi } from '../api/disciplinesApi';
import { resultsApi } from '../api/resultsApi';
import { getMatches } from '../api/matches';
import { Separator } from '../components/Separator';
import { useSignalR } from '../hooks/useSignalR';

const statusLabel: Record<string, string> = {
    done: 'Abgeschlossen',
    live: 'Live',
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

const thNarrow: React.CSSProperties = { ...thStyle, whiteSpace: 'nowrap', textAlign: 'center' };

const tdStyle: React.CSSProperties = {
    padding: '12px 18px',
    borderBottom: '1px solid rgba(240,230,204,.07)',
};

const tdNarrow: React.CSSProperties = { ...tdStyle, whiteSpace: 'nowrap', textAlign: 'center' };

const emptyStyle: React.CSSProperties = {
    padding: '40px 20px', textAlign: 'center',
    fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2,
    color: 'var(--cream-dark)', opacity: .4,
    border: '1px dashed rgba(201,148,58,.2)',
};

const rankMedal = (i: number) => String(i + 1);

const rankColor = (i: number) =>
    i === 0 ? '#f0c040' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--cream-dark)';

export function DisciplinePage() {
    const { id: discId = '' } = useParams();
    const navigate = useNavigate();
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

        on('ResultUpdated', () => {
            resultsApi.getByDiscipline(discId).then(setResults);
        });

        on('MatchesUpdated', () => loadMatches());

        return () => { off('ResultUpdated'); off('MatchesUpdated'); };
    }, [discId]);

    const renderResults = (genderResults: ResultDto[], color: string) => {
        const mt = discipline?.measurementType ?? 'none';
        const hasRaw = mt !== 'none' && genderResults.some(r => r.rawValue != null);
        const unit = mt === 'time' ? 'min' : mt === 'distance' ? 'm' : '';
        if (genderResults.length === 0) return <div style={emptyStyle}>Noch keine Ergebnisse</div>;
        return (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                <thead style={{ background: 'var(--green-dark)' }}>
                    <tr>
                        <th style={thNarrow}>#</th>
                        <th style={thStyle}>Team</th>
                        <th style={thNarrow}>Punkte</th>
                        {hasRaw && <th style={thNarrow}>Messwert</th>}
                    </tr>
                </thead>
                <tbody>
                    {genderResults.map((r, i) => (
                        <tr key={r.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                            <td style={{ ...tdNarrow, fontFamily: 'Cinzel, serif', color: rankColor(i) }}>{rankMedal(i)}</td>
                            <td style={{ ...tdStyle, color: 'var(--cream)' }}>{r.teamName}</td>
                            <td style={{ ...tdNarrow, color, fontFamily: 'Cinzel, serif', fontWeight: 700 }}>{r.points}</td>
                            {hasRaw && (
                                <td style={{ ...tdNarrow }}>
                                    {r.rawValue
                                        ? mt === 'duel'
                                            ? <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, padding: '3px 8px', borderRadius: 2, textTransform: 'uppercase', background: r.rawValue === 'Sieg' ? 'rgba(45,107,71,.25)' : 'rgba(240,230,204,.06)', color: r.rawValue === 'Sieg' ? '#7dc49e' : 'var(--cream-dark)', border: r.rawValue === 'Sieg' ? '1px solid rgba(45,107,71,.4)' : '1px solid rgba(240,230,204,.15)' }}>{r.rawValue}</span>
                                            : <span style={{ fontStyle: 'italic', color: 'var(--cream-dark)', opacity: .7 }}>{r.rawValue}{unit && <span style={{ fontSize: 11, opacity: .6, marginLeft: 4 }}>{unit}</span>}</span>
                                        : <span style={{ opacity: .3 }}>—</span>}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderMatches = (matchList: MatchDto[], genderResults: ResultDto[]) => {
        const mt = discipline?.measurementType ?? 'none';
        const rawById = Object.fromEntries(genderResults.map(r => [r.teamId, r.rawValue]));
        const unit = mt === 'time' ? 'min' : mt === 'distance' ? 'm' : '';
        const hasDuels = matchList.some(m => m.teamBId);
        if (matchList.length === 0) return <div style={emptyStyle}>Noch keine Begegnungen</div>;

        const centerCell = (m: MatchDto) => {
            if (mt === 'time' || mt === 'distance') {
                const rawA = rawById[m.teamAId];
                const rawB = m.teamBId ? rawById[m.teamBId] : undefined;
                const fmt = (v: string | null | undefined) => v
                    ? <>{v}{unit && <span style={{ fontSize: 11, opacity: .5, marginLeft: 3 }}>{unit}</span>}</>
                    : <span style={{ opacity: .25 }}>—</span>;
                return m.teamBId
                    ? <>{fmt(rawA)}<span style={{ margin: '0 8px', opacity: .3 }}>:</span>{fmt(rawB)}</>
                    : fmt(rawA);
            }
            if (mt === 'duel') {
                return m.winnerTeamId
                    ? <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, color: '#7dc49e' }}>
                        {m.winnerTeamId === m.teamAId ? m.teamAName : m.teamBName}
                      </span>
                    : <span style={{ opacity: .25 }}>—</span>;
            }
            return <span style={{ fontFamily: 'Cinzel, serif', color: 'var(--cream-dark)' }}>
                {m.teamBId ? `${m.teamAScore ?? '–'} : ${m.teamBScore ?? '–'}` : (m.teamAScore ?? '–')}
            </span>;
        };

        return (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                <thead style={{ background: 'var(--green-dark)' }}>
                    <tr>
                        <th style={thNarrow}>#</th>
                        <th style={thStyle}>Team A</th>
                        <th style={thNarrow}>{mt === 'duel' ? 'Sieger' : mt === 'none' ? 'Score' : 'Messwert'}</th>
                        {hasDuels && <th style={{ ...thStyle, textAlign: 'right' }}>Team B</th>}
                    </tr>
                </thead>
                <tbody>
                    {matchList.map((m, i) => (
                        <tr key={m.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                            <td style={{ ...tdNarrow, fontFamily: 'Cinzel, serif', color: 'var(--gold)', opacity: .4 }}>{i + 1}</td>
                            <td style={{ ...tdStyle, color: m.winnerTeamId === m.teamAId ? 'var(--gold)' : 'var(--cream)' }}>{m.teamAName}</td>
                            <td style={{ ...tdNarrow, fontStyle: mt === 'time' || mt === 'distance' ? 'italic' : 'normal', color: 'var(--cream-dark)' }}>
                                {centerCell(m)}
                            </td>
                            {hasDuels && (
                                <td style={{ ...tdStyle, textAlign: 'right', color: m.winnerTeamId === m.teamBId ? 'var(--gold)' : 'var(--cream)' }}>
                                    {m.teamBName ?? <span style={{ opacity: .3 }}>—</span>}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    if (!discipline) return null;

    const style = statusStyle[discipline.status] ?? statusStyle.upcoming;
    const mResults = results.filter(r => r.gender === 'm').sort((a, b) => b.points - a.points);
    const fResults = results.filter(r => r.gender === 'f').sort((a, b) => b.points - a.points);

    const genders = [
        { label: '♂ Männer', color: '#7aadff', results: mResults, matches: matchesM },
        { label: '♀ Frauen', color: '#ff8aaa', results: fResults, matches: matchesF },
    ];

    return (
        <div className="page-enter page-content" style={{ padding: '60px 40px', width: '100%', maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}>
            <button onClick={() => navigate('/disciplines')} style={{
                background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer',
                fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, marginBottom: 24, padding: 0,
            }}>
                ← Alle Disziplinen
            </button>

            <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap' }}>
                {discipline.icon?.startsWith('/') ? (
                    <img src={discipline.icon} alt={discipline.name} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                ) : discipline.icon ? (
                    <span style={{ fontSize: 80, lineHeight: 1, flexShrink: 0 }}>{discipline.icon}</span>
                ) : null}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--gold)' }}>
                            Spiel {discipline.number}
                        </span>
                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, padding: '3px 10px', borderRadius: 2, textTransform: 'uppercase', flexShrink: 0, ...style }}>
                            {statusLabel[discipline.status]}
                        </span>
                    </div>
                    <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: 'var(--cream)', margin: 0 }}>
                        {discipline.name}
                    </h2>
                </div>
            </div>

            {discipline.description && (
                <p style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--cream-dark)', opacity: .8, marginBottom: 24 }}>
                    {discipline.description}
                </p>
            )}

            <Separator />

            {/* Begegnungen */}
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 3, color: 'var(--gold)', marginBottom: 16, textTransform: 'uppercase' }}>Begegnungen</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 48 }}>
                {genders.map(({ label, color, matches, results: res }) => (
                    <div key={label} style={{ flex: '1 1 300px', minWidth: 0 }}>
                        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, color, marginBottom: 12, textTransform: 'uppercase' }}>{label}</div>
                        <div style={{ display: 'block', width: '100%', border: '1px solid rgba(201,148,58,.2)', overflowX: 'auto' }}>
                            {renderMatches(matches, res)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Ergebnisse */}
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 3, color: 'var(--gold)', marginBottom: 16, textTransform: 'uppercase' }}>Ergebnisse</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                {genders.map(({ label, color, results: res }) => (
                    <div key={label} style={{ flex: '1 1 300px', minWidth: 0 }}>
                        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, color, marginBottom: 12, textTransform: 'uppercase' }}>{label}</div>
                        <div style={{ display: 'block', width: '100%', border: '1px solid rgba(201,148,58,.2)', overflowX: 'auto' }}>
                            {renderResults(res, color)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}