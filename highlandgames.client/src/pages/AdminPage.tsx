import { useState, useEffect } from 'react';
import type { TeamDto, DisciplineDto } from '../api/types';
import { teamsApi } from '../api/teamsApi';
import { disciplinesApi } from '../api/disciplinesApi';
import { resultsApi } from '../api/resultsApi';
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

    useEffect(() => {
        if (!loggedIn) return;
        disciplinesApi.getAll().then(d => {
            setDisciplines(d);
            if (d.length > 0) setSelectedDisc(d[0].id);
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
        const disc = disciplines.find(d => d.id === selectedDisc);
        if (!disc) return;

        const entries = Object.entries(points).filter(([, v]) => v.points !== '');
        await Promise.all(entries.map(([teamId, v]) =>
            resultsApi.upsert({
                teamId,
                disciplineId: selectedDisc,
                points: parseInt(v.points),
                rawValue: v.rawValue || undefined,
            })
        ));
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
    };

    const handleStatusChange = async (id: string, status: string) => {
        await disciplinesApi.updateStatus(id, status);
        setDisciplines(prev => prev.map(d => d.id === id ? { ...d, status } : d));
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

    if (!loggedIn) {
        return (
            <div className="page-enter" style={{ padding: '60px 40px', maxWidth: 480, margin: '0 auto' }}>
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
                        <input
                            type="password"
                            value={password}
                            placeholder="Passwort eingeben"
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && login(password)}
                            style={fieldStyle}
                        />
                        {error && <div style={{ color: '#e07070', fontSize: 13, marginTop: 8, fontFamily: 'Cinzel, serif', letterSpacing: 1 }}>{error}</div>}
                    </div>
                    <button
                        onClick={() => login(password)}
                        disabled={loading}
                        style={{ width: '100%', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 28px', borderRadius: 2, cursor: 'pointer', border: 'none', background: 'var(--gold)', color: 'var(--green-dark)' }}
                    >
                        {loading ? 'Laden...' : 'Einloggen'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-enter" style={{ padding: '60px 40px', maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <div>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, display: 'block' }}>Verwaltung</span>
                    <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: 'var(--cream)' }}>Admin</h2>
                </div>
                <button onClick={logout} style={{ background: 'none', border: '1px solid rgba(240,230,204,.2)', color: 'var(--cream-dark)', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, padding: '8px 16px', borderRadius: 2 }}>
                    Abmelden
                </button>
            </div>
            <Separator />

            {/* Disziplin Status */}
            <div style={{ marginBottom: 48 }}>
                <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: 14, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 16 }}>Disziplin Status</h3>
                <div style={{ border: '1px solid rgba(201,148,58,.2)', overflow: 'hidden' }}>
                    {disciplines.map(d => (
                        <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderBottom: '1px solid rgba(240,230,204,.07)' }}>
                            <span style={{ fontSize: 20 }}>{d.icon}</span>
                            <span style={{ flex: 1, fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--cream)' }}>{d.name}</span>
                            <select
                                value={d.status}
                                onChange={e => handleStatusChange(d.id, e.target.value)}
                                style={{ ...fieldStyle, width: 'auto', padding: '6px 12px', cursor: 'pointer' }}
                            >
                                <option value="upcoming" style={{ background: '#0e2218' }}>Geplant</option>
                                <option value="next" style={{ background: '#0e2218' }}>Als nächstes</option>
                                <option value="live" style={{ background: '#0e2218' }}>Läuft</option>
                                <option value="done" style={{ background: '#0e2218' }}>Abgeschlossen</option>
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            {/* Teams verwalten */}
            <div style={{ marginBottom: 48 }}>
                <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: 14, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 16 }}>Teams verwalten</h3>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Teamname</label>
                        <input
                            type="text"
                            value={newTeamName}
                            placeholder="Teamname eingeben"
                            onChange={e => setNewTeamName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddTeam()}
                            style={fieldStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Kategorie</label>
                        <select value={newTeamGender} onChange={e => setNewTeamGender(e.target.value as 'm' | 'f')} style={{ ...fieldStyle, width: 'auto', padding: '10px 12px', cursor: 'pointer' }}>
                            <option value="m" style={{ background: '#0e2218' }}>♂ Männer</option>
                            <option value="f" style={{ background: '#0e2218' }}>♀ Frauen</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button onClick={handleAddTeam} style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', padding: '10px 20px', borderRadius: 2, cursor: 'pointer', border: 'none', background: 'var(--gold)', color: 'var(--green-dark)', whiteSpace: 'nowrap' }}>
                            + Hinzufügen
                        </button>
                    </div>
                </div>

                <div style={{ border: '1px solid rgba(201,148,58,.2)', overflow: 'hidden' }}>
                    {teams.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--cream-dark)', opacity: .4 }}>Keine Teams eingetragen</div>
                    ) : teams.map((t, i) => (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid rgba(240,230,204,.07)', background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, padding: '2px 8px', borderRadius: 2, background: t.gender === 'm' ? 'rgba(30,80,200,.2)' : 'rgba(200,30,80,.2)', color: t.gender === 'm' ? '#7aadff' : '#ff8aaa', border: t.gender === 'm' ? '1px solid rgba(30,80,200,.3)' : '1px solid rgba(200,30,80,.3)' }}>
                                {t.gender === 'm' ? '♂' : '♀'}
                            </span>
                            <span style={{ flex: 1, fontSize: 15, color: 'var(--cream)' }}>{t.name}</span>
                            <button onClick={() => handleDeleteTeam(t.id)} style={{ background: 'none', border: '1px solid rgba(122,28,28,.4)', color: '#e07070', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, padding: '4px 10px', borderRadius: 2 }}>
                                Löschen
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ergebnisse eintragen */}
            <div>
                <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: 14, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 16 }}>Ergebnisse eintragen</h3>

                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Disziplin</label>
                    <select value={selectedDisc} onChange={e => setSelectedDisc(e.target.value)} style={{ ...fieldStyle, cursor: 'pointer' }}>
                        {disciplines.map(d => (
                            <option key={d.id} value={d.id} style={{ background: '#0e2218' }}>Spiel {d.number}: {d.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ border: '1px solid rgba(240,230,204,.1)', overflow: 'hidden', marginBottom: 16 }}>
                    {teams.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--cream-dark)', opacity: .4 }}>Zuerst Teams hinzufügen</div>
                    ) : teams.map((t, i) => (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid rgba(240,230,204,.07)', background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, padding: '2px 8px', borderRadius: 2, background: t.gender === 'm' ? 'rgba(30,80,200,.2)' : 'rgba(200,30,80,.2)', color: t.gender === 'm' ? '#7aadff' : '#ff8aaa', border: t.gender === 'm' ? '1px solid rgba(30,80,200,.3)' : '1px solid rgba(200,30,80,.3)' }}>
                                {t.gender === 'm' ? '♂' : '♀'}
                            </span>
                            <span style={{ flex: 1, fontSize: 15, color: 'var(--cream)' }}>{t.name}</span>
                            <input
                                type="text"
                                placeholder="Wert (z.B. 12.34m)"
                                value={points[t.id]?.rawValue ?? ''}
                                onChange={e => setPoints(prev => ({ ...prev, [t.id]: { ...prev[t.id], rawValue: e.target.value } }))}
                                style={{ ...fieldStyle, width: 140, padding: '6px 10px', fontSize: 14 }}
                            />
                            <input
                                type="number"
                                placeholder="Pkt"
                                value={points[t.id]?.points ?? ''}
                                onChange={e => setPoints(prev => ({ ...prev, [t.id]: { ...prev[t.id], points: e.target.value } }))}
                                style={{ ...fieldStyle, width: 70, textAlign: 'center', padding: '6px 10px', fontSize: 14 }}
                            />
                        </div>
                    ))}
                </div>

                <button onClick={handleSaveResults} style={{ width: '100%', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 28px', borderRadius: 2, cursor: 'pointer', border: 'none', background: saved ? 'var(--green-light)' : 'var(--gold)', color: 'var(--green-dark)', transition: 'background .3s' }}>
                    {saved ? '✓ Gespeichert!' : 'Ergebnisse speichern'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--cream-dark)', opacity: .4, marginTop: 12, fontStyle: 'italic' }}>
                    Änderungen werden sofort für alle Besucher sichtbar
                </p>
            </div>
        </div>
    );
}