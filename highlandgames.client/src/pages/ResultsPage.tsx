import { Separator } from '../components/Separator';
import { useResultsPage } from '../hooks/useResultsPage';

export function ResultsPage() {
    const { disciplines, gender, setGender, activeTab, setActiveTab, leaderboard, discResults, loading } = useResultsPage();

    const tabs = [{ id: 'total', name: 'Gesamt' }, ...disciplines.map(d => ({ id: d.id, name: d.name }))];

    const rankMedal = (i: number) => {
        if (i === 0) return '🥇';
        if (i === 1) return '🥈';
        if (i === 2) return '🥉';
        return String(i + 1);
    };

    return (
        <div className="page-enter" style={{ padding: '60px 40px', maxWidth: 1100, margin: '0 auto' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, display: 'block' }}>
                Wettkampf 2026
            </span>
            <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: 'var(--cream)', marginBottom: 16 }}>
                Ergebnisse
            </h2>
            <Separator />

            {/* Gender Toggle */}
            <div style={{ display: 'flex', gap: 2, marginBottom: 28 }}>
                {(['m', 'f'] as const).map(g => (
                    <button key={g} onClick={() => setGender(g)} style={{
                        flex: 1, maxWidth: 200, padding: '10px 24px', cursor: 'pointer',
                        fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
                        borderRadius: 2, transition: 'all .2s', border: '1px solid rgba(240,230,204,.2)',
                        background: gender === g
                            ? g === 'm' ? 'rgba(30,80,200,.2)' : 'rgba(200,30,80,.2)'
                            : 'transparent',
                        color: gender === g
                            ? g === 'm' ? '#7aadff' : '#ff8aaa'
                            : 'var(--cream-dark)',
                        borderColor: gender === g
                            ? g === 'm' ? 'rgba(30,80,200,.4)' : 'rgba(200,30,80,.4)'
                            : 'rgba(240,230,204,.2)',
                    }}>
                        {g === 'm' ? '♂ Männer' : '♀ Frauen'}
                    </button>
                ))}
            </div>

            {/* Discipline Tabs */}
            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 0 }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                        fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2,
                        textTransform: 'uppercase', padding: '10px 20px', cursor: 'pointer',
                        transition: 'all .2s', borderBottom: 'none', borderRadius: '2px 2px 0 0',
                        background: activeTab === t.id ? 'var(--green-dark)' : 'rgba(240,230,204,.06)',
                        color: activeTab === t.id ? 'var(--gold)' : 'var(--cream-dark)',
                        border: activeTab === t.id ? '1px solid rgba(201,148,58,.4)' : '1px solid rgba(240,230,204,.12)',
                    }}>
                        {t.name}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div style={{ border: '1px solid rgba(201,148,58,.2)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, color: 'var(--cream-dark)', opacity: .4 }}>
                        Laden...
                    </div>
                ) : activeTab === 'total' ? (
                    leaderboard.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                            <thead style={{ background: 'var(--green-dark)' }}>
                                <tr>
                                    <th style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', padding: '14px 18px', textAlign: 'left', borderBottom: '1px solid rgba(201,148,58,.25)' }}>#</th>
                                    <th style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', padding: '14px 18px', textAlign: 'left', borderBottom: '1px solid rgba(201,148,58,.25)' }}>Team</th>
                                    <th style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', padding: '14px 18px', textAlign: 'left', borderBottom: '1px solid rgba(201,148,58,.25)' }}>Punkte</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((entry, i) => (
                                    <tr key={entry.teamId} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                                        <td style={{ padding: '12px 18px', fontFamily: 'Cinzel, serif', color: i === 0 ? '#f0c040' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--cream-dark)', borderBottom: '1px solid rgba(240,230,204,.07)' }}>
                                            {rankMedal(i)}
                                        </td>
                                        <td style={{ padding: '12px 18px', color: 'var(--cream)', borderBottom: '1px solid rgba(240,230,204,.07)' }}>{entry.teamName}</td>
                                        <td style={{ padding: '12px 18px', color: 'var(--cream-dark)', fontFamily: 'Cinzel, serif', fontWeight: 700, borderBottom: '1px solid rgba(240,230,204,.07)' }}>{entry.totalPoints}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, color: 'var(--cream-dark)', opacity: .4, border: '1px dashed rgba(201,148,58,.2)' }}>
                            Ergebnisse werden nach dem Wettkampf veröffentlicht
                        </div>
                    )
                ) : (
                    discResults.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                            <thead style={{ background: 'var(--green-dark)' }}>
                                <tr>
                                    <th style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', padding: '14px 18px', textAlign: 'left', borderBottom: '1px solid rgba(201,148,58,.25)' }}>#</th>
                                    <th style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', padding: '14px 18px', textAlign: 'left', borderBottom: '1px solid rgba(201,148,58,.25)' }}>Team</th>
                                    <th style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', padding: '14px 18px', textAlign: 'left', borderBottom: '1px solid rgba(201,148,58,.25)' }}>Punkte</th>
                                    <th style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', padding: '14px 18px', textAlign: 'left', borderBottom: '1px solid rgba(201,148,58,.25)' }}>Wert</th>
                                </tr>
                            </thead>
                            <tbody>
                                {discResults.map((result, i) => (
                                    <tr key={result.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                                        <td style={{ padding: '12px 18px', fontFamily: 'Cinzel, serif', color: i === 0 ? '#f0c040' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--cream-dark)', borderBottom: '1px solid rgba(240,230,204,.07)' }}>
                                            {rankMedal(i)}
                                        </td>
                                        <td style={{ padding: '12px 18px', color: 'var(--cream)', borderBottom: '1px solid rgba(240,230,204,.07)' }}>{result.teamName}</td>
                                        <td style={{ padding: '12px 18px', color: 'var(--cream-dark)', fontFamily: 'Cinzel, serif', fontWeight: 700, borderBottom: '1px solid rgba(240,230,204,.07)' }}>{result.points}</td>
                                        <td style={{ padding: '12px 18px', color: 'var(--cream-dark)', opacity: .7, fontStyle: 'italic', borderBottom: '1px solid rgba(240,230,204,.07)' }}>{result.rawValue ?? '–'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, color: 'var(--cream-dark)', opacity: .4, border: '1px dashed rgba(201,148,58,.2)' }}>
                            Ergebnisse werden nach dem Wettkampf veröffentlicht
                        </div>
                    )
                )}
            </div>
        </div>
    );
}