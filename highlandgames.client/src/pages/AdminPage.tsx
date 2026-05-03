import { useState, useEffect } from 'react';
import type { TeamDto, DisciplineDto, MatchDto } from '../api/types';
import { teamsApi } from '../api/teamsApi';
import { disciplinesApi } from '../api/disciplinesApi';
import { resultsApi } from '../api/resultsApi';
import { getMatches, generateMatches, updateMatch } from '../api/matches';
import { useAuth } from '../hooks/useAuth';
import { Separator } from '../components/Separator';

export function AdminPage() {
    const { loggedIn, error, loading, login, logout } = useAuth();
    const [password, setPassword] = useState('');
    const [teams, setTeams] = useState<TeamDto[]>([]);
    const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamGender, setNewTeamGender] = useState<'m' | 'f'>('m');
    const [selectedDisc, setSelectedDisc] = useState('');
    const [points, setPoints] = useState<Record<string, { points: string; rawValue: string }>>({});
    const [saved, setSaved] = useState(false);
    const [matchDisc, setMatchDisc] = useState('');
    const [matchGender, setMatchGender] = useState<'m' | 'f'>('m');
    const [matches, setMatches] = useState<MatchDto[]>([]);
    const [matchScores, setMatchScores] = useState<Record<string, { a: string; b: string }>>({});
    const [matchSaved, setMatchSaved] = useState(false);

    useEffect(() => {
        if (!loggedIn) return;
        disciplinesApi.getAll().then(d => {
            setDisciplines(d);
            if (d.length > 0) { setSelectedDisc(d[0].id); setMatchDisc(d[0].id); }
        });
        loadTeams();
    }, [loggedIn]);

    const loadTeams = async () => {
        const [m, f] = await Promise.all([teamsApi.getByGender('m'), teamsApi.getByGender('f')]);
        setTeams([...m, ...f]);
    };

    const handleAddTeam = async () => {
        if (!newTeamName.trim()) return;
        await teamsApi.create({ name: newTeamName.trim(), gender: newTeamGender });
        setNewTeamName('');
        loadTeams();
    };

    const handleDeleteTeam = async (id: string) => {
        await teamsApi.delete(id);
        loadTeams();
    };

    const handleSaveResults = async () => {
        const entries = Object.entries(points).filter(([, v]) => v.points !== '');
        await Promise.all(entries.map(([teamId, v]) =>
            resultsApi.upsert({ teamId, disciplineId: selectedDisc, points: parseInt(v.points), rawValue: v.rawValue || undefined })
        ));
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
    };

    const handleStatusChange = async (id: string, status: string) => {
        await disciplinesApi.updateStatus(id, status);
        setDisciplines(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    };

    const handleLoadMatches = async () => {
        const data = await getMatches(matchDisc, matchGender);
        setMatches(data);
        setMatchScores({});
    };

    const handleGenerateMatches = async () => {
        await generateMatches(matchDisc, matchGender);
        const data = await getMatches(matchDisc, matchGender);
        setMatches(data);
        setMatchScores({});
    };

    const handleSaveMatches = async () => {
        await Promise.all(
            Object.entries(matchScores).map(([id, v]) => {
                const match = matches.find(m => m.id === id);
                if (!match) return Promise.resolve();
                const aScore = v.a !== '' ? parseInt(v.a) : null;
                const bScore = v.b !== '' ? parseInt(v.b) : null;
                const winnerId = aScore !== null && bScore !== null
                    ? (aScore > bScore ? match.teamAId : match.teamBId) : null;
                return updateMatch(id, { teamAScore: aScore, teamBScore: bScore, winnerTeamId: winnerId });
            })
        );
        setMatchSaved(true);
        handleLoadMatches();
        setTimeout(() => setMatchSaved(false), 2200);
    };

    const fieldStyle = {
        width: '100%', padding: '10px 14px',
        background: 'rgba(240,230,204,.06)', border: '1px solid rgba(240,230,204,.2)',
        color: 'var(--cream)', fontFamily: 'EB Garamond, serif', fontSize: 16,
        borderRadius: 2, outline: 'none',
    };

    const labelStyle = {
        fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2,
        textTransform: 'uppercase' as const, color: 'var(--cream-dark)', opacity: .7,
        marginBottom: 6, display: 'block',
    };

    const sectionTitle = {
        fontFamily: 'Cinzel, serif', fontSize: 14, letterSpacing: 2,
        color: 'var(--gold)', textTransform: 'uppercase' as const, marginBottom: 16,
    };

    const btnPrimary = {
        fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2,
        textTransform: 'uppercase' as const, padding: '10px 16px', borderRadius: 2,
        cursor: 'pointer', border: 'none', background: 'var(--gold)',
        color: 'var(--green-dark)', whiteSpace: 'nowrap' as const,
    };

    const btnOutline = {
        fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2,
        textTransform: 'uppercase' as const, padding: '10px 16px', borderRadius: 2,
        cursor: 'pointer', border: '1px solid rgba(240,230,204,.2)',
        background: 'transparent', color: 'var(--cream-dark)', whiteSpace: 'nowrap' as const,
    };

    const genderBadge = (gender: string) => ({
        fontFamily: 'Cinzel, serif', fontSize: 10, padding: '2px 8px', borderRadius: 2,
        background: gender === 'm' ? 'rgba(30,80,200,.2)' : 'rgba(200,30,80,.2)',
        color: gender === 'm' ? '#7aadff' : '#ff8aaa',
        border: gender === 'm' ? '1px solid rgba(30,80,200,.3)' : '1px solid rgba(200,30,80,.3)',
        flexShrink: 0 as const,
    });

    if (!loggedIn) {
        return (
            <div className="page-enter page-content" style={{ padding: '60px 40px', maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box' as const }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, display: 'block' }}>
                    Verwaltung
                </span>
                <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: 'var(--cream)', marginBottom: 16 }}>
                    Admin
                </h2>
                <Separator />
                <div style={{ background: 'rgba(240,230,204,.05)', border: '1px solid rgba(201,148,58,.2)', padding: 32, borderRadius: 2 }}>
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
                        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, color: 'var(--cream-dark)' }}>Nur für Organisatoren</div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Passwort</label>
                        <input type="password" value={password} placeholder="Passwort eingeben"
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && login(password)}
                            style={fieldStyle}
                        />
                        {error && <div style={{ color: '#e07070', fontSize: 13, marginTop: 8, fontFamily: 'Cinzel, serif', letterSpacing: 1 }}>{error}</div>}
                    </div>
                    <button onClick={() => login(password)} disabled={loading} style={{ width: '100%', ...btnPrimary, padding: '12px 28px' }}>
                        {loading ? 'Laden...' : 'Einloggen'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-enter page-content" style={{ padding: '60px 40px', maxWidth: 800, margin: '0 auto', width: '100%', boxSizing: 'border-box' as const }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
                <div>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, display: 'block' }}>Verwaltung</span>
                    <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: 'var(--cream)' }}>Admin</h2>
                </div>
                <button onClick={logout} style={btnOutline}>Abmelden</button>
            </div>
            <Separator />

            {/* Disziplin Status */}
            <div style={{ marginBottom: 48 }}>
                <h3 style={sectionTitle}>Disziplin Status</h3>
                <div style={{ border: '1px solid rgba(201,148,58,.2)', overflow: 'hidden' }}>
                    {disciplines.map(d => (
                        <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(240,230,204,.07)', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 20 }}>{d.icon}</span>
                            <span style={{ flex: 1, fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--cream)', minWidth: 120 }}>{d.name}</span>
                            <select value={d.status} onChange={e => handleStatusChange(d.id, e.target.value)}
                                style={{ ...fieldStyle, width: 'auto', padding: '8px 12px', cursor: 'pointer', flexShrink: 0 }}>
                                <option value="upcoming" style={{ background: '#0e2218' }}>Geplant</option>
                                <option value="next" style={{ background: '#0e2218' }}>Als nächstes</option>
                                <option value="live" style={{ background: '#0e2218' }}>Läuft</option>
                                <option value="done" style={{ background: '#0e2218' }}>Abgeschlossen</option>
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            {/* Begegnungen */}
            <div style={{ marginBottom: 48 }}>
                <h3 style={sectionTitle}>Begegnungen</h3>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                        <label style={labelStyle}>Disziplin</label>
                        <select value={matchDisc} onChange={e => setMatchDisc(e.target.value)} style={{ ...fieldStyle, cursor: 'pointer' }}>
                            {disciplines.map(d => <option key={d.id} value={d.id} style={{ background: '#0e2218' }}>Spiel {d.number}: {d.name}</option>)}
                        </select>
                    </div>
                    <div style={{ minWidth: 120 }}>
                        <label style={labelStyle}>Kategorie</label>
                        <select value={matchGender} onChange={e => setMatchGender(e.target.value as 'm' | 'f')} style={{ ...fieldStyle, cursor: 'pointer' }}>
                            <option value="m" style={{ background: '#0e2218' }}>♂ Männer</option>
                            <option value="f" style={{ background: '#0e2218' }}>♀ Frauen</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={handleLoadMatches} style={btnOutline}>Laden</button>
                        <button onClick={handleGenerateMatches} style={btnPrimary}>Neu generieren</button>
                    </div>
                </div>

                {matches.length > 0 && (
                    <>
                        <div style={{ border: '1px solid rgba(201,148,58,.2)', overflow: 'hidden', marginBottom: 12 }}>
                            {matches.map((m, i) => (
                                <div key={m.id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(240,230,204,.07)', background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                        <span style={{ flex: 1, fontSize: 15, color: m.winnerTeamId === m.teamAId ? 'var(--gold)' : 'var(--cream)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.teamAName}</span>
                                        <input type="number" placeholder="Pkt"
                                            value={matchScores[m.id]?.a ?? (m.teamAScore !== null ? String(m.teamAScore) : '')}
                                            onChange={e => setMatchScores(prev => ({ ...prev, [m.id]: { ...prev[m.id], a: e.target.value } }))}
                                            style={{ ...fieldStyle, width: 72, textAlign: 'center', padding: '6px 8px', fontSize: 14, flexShrink: 0 }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ flex: 1, fontSize: 15, color: m.winnerTeamId === m.teamBId ? 'var(--gold)' : 'var(--cream)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.teamBName}</span>
                                        <input type="number" placeholder="Pkt"
                                            value={matchScores[m.id]?.b ?? (m.teamBScore !== null ? String(m.teamBScore) : '')}
                                            onChange={e => setMatchScores(prev => ({ ...prev, [m.id]: { ...prev[m.id], b: e.target.value } }))}
                                            style={{ ...fieldStyle, width: 72, textAlign: 'center', padding: '6px 8px', fontSize: 14, flexShrink: 0 }}
                                        />
                                    </div>
                                    {m.isManualOverride && (
                                        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, color: 'var(--gold)', opacity: .5, marginTop: 4 }}>manuell</div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={handleSaveMatches} style={{ width: '100%', ...btnPrimary, padding: '12px 28px', background: matchSaved ? 'var(--green-light)' : 'var(--gold)', transition: 'background .3s' }}>
                            {matchSaved ? '✓ Gespeichert!' : 'Begegnungen speichern'}
                        </button>
                    </>
                )}
            </div>

            {/* Teams verwalten */}
            <div style={{ marginBottom: 48 }}>
                <h3 style={sectionTitle}>Teams verwalten</h3>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <label style={labelStyle}>Teamname</label>
                        <input type="text" value={newTeamName} placeholder="Teamname eingeben"
                            onChange={e => setNewTeamName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddTeam()}
                            style={fieldStyle}
                        />
                    </div>
                    <div style={{ minWidth: 120 }}>
                        <label style={labelStyle}>Kategorie</label>
                        <select value={newTeamGender} onChange={e => setNewTeamGender(e.target.value as 'm' | 'f')} style={{ ...fieldStyle, cursor: 'pointer' }}>
                            <option value="m" style={{ background: '#0e2218' }}>♂ Männer</option>
                            <option value="f" style={{ background: '#0e2218' }}>♀ Frauen</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button onClick={handleAddTeam} style={{ ...btnPrimary, width: '100%' }}>+ Hinzufügen</button>
                    </div>
                </div>
                <div style={{ border: '1px solid rgba(201,148,58,.2)', overflow: 'hidden' }}>
                    {teams.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--cream-dark)', opacity: .4 }}>Keine Teams eingetragen</div>
                    ) : teams.map((t, i) => (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid rgba(240,230,204,.07)', background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                            <span style={genderBadge(t.gender)}>{t.gender === 'm' ? '♂' : '♀'}</span>
                            <span style={{ flex: 1, fontSize: 15, color: 'var(--cream)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                            <button onClick={() => handleDeleteTeam(t.id)} style={{ background: 'none', border: '1px solid rgba(122,28,28,.4)', color: '#e07070', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, padding: '4px 10px', borderRadius: 2, flexShrink: 0 }}>
                                Löschen
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ergebnisse eintragen */}
            <div>
                <h3 style={sectionTitle}>Ergebnisse eintragen</h3>
                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Disziplin</label>
                    <select value={selectedDisc} onChange={e => setSelectedDisc(e.target.value)} style={{ ...fieldStyle, cursor: 'pointer' }}>
                        {disciplines.map(d => <option key={d.id} value={d.id} style={{ background: '#0e2218' }}>Spiel {d.number}: {d.name}</option>)}
                    </select>
                </div>
                <div style={{ border: '1px solid rgba(240,230,204,.1)', overflow: 'hidden', marginBottom: 16 }}>
                    {teams.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--cream-dark)', opacity: .4 }}>Zuerst Teams hinzufügen</div>
                    ) : teams.map((t, i) => (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid rgba(240,230,204,.07)', background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)', flexWrap: 'wrap' }}>
                            <span style={genderBadge(t.gender)}>{t.gender === 'm' ? '♂' : '♀'}</span>
                            <span style={{ flex: 1, fontSize: 15, color: 'var(--cream)', minWidth: 100 }}>{t.name}</span>
                            <input type="text" placeholder="Wert (z.B. 12.34m)"
                                value={points[t.id]?.rawValue ?? ''}
                                onChange={e => setPoints(prev => ({ ...prev, [t.id]: { ...prev[t.id], rawValue: e.target.value } }))}
                                style={{ ...fieldStyle, width: 130, padding: '6px 10px', fontSize: 14, flexShrink: 0 }}
                            />
                            <input type="number" placeholder="Pkt"
                                value={points[t.id]?.points ?? ''}
                                onChange={e => setPoints(prev => ({ ...prev, [t.id]: { ...prev[t.id], points: e.target.value } }))}
                                style={{ ...fieldStyle, width: 72, textAlign: 'center', padding: '6px 10px', fontSize: 14, flexShrink: 0 }}
                            />
                        </div>
                    ))}
                </div>
                <button onClick={handleSaveResults} style={{ width: '100%', ...btnPrimary, padding: '12px 28px', background: saved ? 'var(--green-light)' : 'var(--gold)', transition: 'background .3s' }}>
                    {saved ? '✓ Gespeichert!' : 'Ergebnisse speichern'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--cream-dark)', opacity: .4, marginTop: 12, fontStyle: 'italic' }}>
                    Änderungen werden sofort für alle Besucher sichtbar
                </p>
            </div>
        </div>
    );
}
