import { Separator } from '../components/Separator';
import { useResultsPage } from '../hooks/useResultsPage';
import type { LeaderboardEntryDto, ResultDto } from '../api/types';

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

const rankMedal = (i: number) => String(i + 1);

const rankColor = (i: number) =>
    i === 0 ? '#f0c040' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--cream-dark)';

const empty = (
    <div style={{
        width: '100%', padding: '40px 20px', textAlign: 'center',
        fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2,
        color: 'var(--cream-dark)', opacity: .4,
    }}>
        Noch keine Ergebnisse
    </div>
);

function LeaderboardTable({ entries, color }: { entries: LeaderboardEntryDto[]; color: string }) {
    if (entries.length === 0) return empty;
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead style={{ background: 'var(--green-dark)' }}>
                <tr>
                    <th style={thNarrow}>#</th>
                    <th style={thStyle}>Team</th>
                    <th style={thNarrow}>Punkte</th>
                </tr>
            </thead>
            <tbody>
                {entries.map((entry, i) => (
                    <tr key={entry.teamId} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                        <td style={{ ...tdNarrow, fontFamily: 'Cinzel, serif', color: rankColor(i) }}>{rankMedal(i)}</td>
                        <td style={{ ...tdStyle, color: 'var(--cream)' }}>{entry.teamName}</td>
                        <td style={{ ...tdNarrow, fontFamily: 'Cinzel, serif', fontWeight: 700, color }}>{entry.totalPoints}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function DiscResultTable({ results, color }: { results: ResultDto[]; color: string }) {
    if (results.length === 0) return empty;
    const hasRawValues = results.some(r => r.rawValue != null);
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead style={{ background: 'var(--green-dark)' }}>
                <tr>
                    <th style={thNarrow}>#</th>
                    <th style={thStyle}>Team</th>
                    <th style={thNarrow}>Punkte</th>
                    {hasRawValues && <th style={thNarrow}>Messwert</th>}
                </tr>
            </thead>
            <tbody>
                {results.map((r, i) => (
                    <tr key={r.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                        <td style={{ ...tdNarrow, fontFamily: 'Cinzel, serif', color: rankColor(i) }}>{rankMedal(i)}</td>
                        <td style={{ ...tdStyle, color: 'var(--cream)' }}>{r.teamName}</td>
                        <td style={{ ...tdNarrow, fontFamily: 'Cinzel, serif', fontWeight: 700, color }}>{r.points}</td>
                        {hasRawValues && <td style={{ ...tdNarrow, fontStyle: 'italic', color: 'var(--cream-dark)', opacity: .7 }}>{r.rawValue ?? '—'}</td>}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function ResultsPage() {
    const { disciplines, activeTab, setActiveTab, mLeaderboard, fLeaderboard, mDiscResults, fDiscResults, loading } = useResultsPage();

    const tabs = [{ id: 'total', name: 'Gesamt' }, ...disciplines.map(d => ({ id: d.id, name: d.name }))];

    const genders = [
        { label: '♂ Männer', color: '#7aadff' },
        { label: '♀ Frauen', color: '#ff8aaa' },
    ];

    return (
        <div className="page-enter" style={{ padding: '60px 40px', maxWidth: 1200, margin: '0 auto' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, display: 'block' }}>
                Wettkampf
            </span>
            <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: 'var(--cream)', marginBottom: 16 }}>
                Ergebnisse
            </h2>
            <Separator />

            {/* Discipline Tabs – Desktop */}
            <div className="tabs-desktop" style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 24 }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                        fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2,
                        textTransform: 'uppercase', padding: '10px 20px', cursor: 'pointer',
                        transition: 'all .2s', borderRadius: '2px 2px 0 0', borderBottom: 'none',
                        background: activeTab === t.id ? 'var(--green-dark)' : 'rgba(240,230,204,.06)',
                        color: activeTab === t.id ? 'var(--gold)' : 'var(--cream-dark)',
                        border: activeTab === t.id ? '1px solid rgba(201,148,58,.4)' : '1px solid rgba(240,230,204,.12)',
                    }}>
                        {t.name}
                    </button>
                ))}
            </div>

            {/* Discipline Tabs – Mobile Dropdown */}
            <select
                className="tabs-mobile"
                value={activeTab}
                onChange={e => setActiveTab(e.target.value)}
                style={{
                    width: '100%', marginBottom: 24, padding: '10px 14px',
                    background: 'var(--green-dark)', border: '1px solid rgba(201,148,58,.4)',
                    color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontSize: 12,
                    letterSpacing: 2, textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer',
                }}
            >
                {tabs.map(t => (
                    <option key={t.id} value={t.id} style={{ background: '#0e2218' }}>{t.name}</option>
                ))}
            </select>

            {loading ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, color: 'var(--cream-dark)', opacity: .4 }}>
                    Laden...
                </div>
            ) : (
                <div className="results-grid">
                    {genders.map(({ label, color }, gi) => (
                        <div key={label} style={{ minWidth: 0 }}>
                            <div style={{
                                fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3,
                                textTransform: 'uppercase', color, marginBottom: 12,
                            }}>
                                {label}
                            </div>
                            <div style={{ display: 'block', width: '100%', border: '1px solid rgba(201,148,58,.2)', overflowX: 'auto' }}>
                                {activeTab === 'total'
                                    ? <LeaderboardTable entries={gi === 0 ? mLeaderboard : fLeaderboard} color={color} />
                                    : <DiscResultTable results={gi === 0 ? mDiscResults : fDiscResults} color={color} />
                                }
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
