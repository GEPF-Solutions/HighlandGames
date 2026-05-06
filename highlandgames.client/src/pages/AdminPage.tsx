import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { TeamDto, DisciplineDto, MatchDto } from '../api/types';
import { teamsApi } from '../api/teamsApi';
import { disciplinesApi } from '../api/disciplinesApi';
import { resultsApi } from '../api/resultsApi';
import { getMatches, generateMatches, updateMatch } from '../api/matches';
import { useAuth } from '../hooks/useAuth';
import { Separator } from '../components/Separator';
import { ConfirmModal } from '../components/ConfirmModal';

type AdminTab = 'disciplines' | 'matches' | 'teams' | 'results';

export function AdminPage() {
    const { loggedIn, error, loading, login, logout } = useAuth();
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState<AdminTab>('disciplines');
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
    const [newDiscName, setNewDiscName] = useState('');
    const [newDiscNumber, setNewDiscNumber] = useState('');
    const [newDiscDesc, setNewDiscDesc] = useState('');
    const [newDiscImage, setNewDiscImage] = useState<File | null>(null);
    const [newDiscImagePreview, setNewDiscImagePreview] = useState<string | null>(null);
    const [discSaving, setDiscSaving] = useState(false);
    const [discModalOpen, setDiscModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

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
        setDisciplines(prev => prev.map(d => d.id === id ? { ...d, status: status as DisciplineDto['status'] } : d));
    };

    const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setNewDiscImage(file);
        if (file) {
            const url = URL.createObjectURL(file);
            setNewDiscImagePreview(url);
        } else {
            setNewDiscImagePreview(null);
        }
    };

    const handleCreateDiscipline = async () => {
        if (!newDiscName.trim() || !newDiscNumber) return;
        setDiscSaving(true);
        try {
            const dto = await disciplinesApi.create(
                newDiscName.trim(),
                parseInt(newDiscNumber),
                newDiscDesc.trim() || undefined,
                newDiscImage,
            );
            setDisciplines(prev => [...prev, dto].sort((a, b) => a.number - b.number));
            setNewDiscName('');
            setNewDiscNumber('');
            setNewDiscDesc('');
            setNewDiscImage(null);
            setNewDiscImagePreview(null);
            setDiscModalOpen(false);
        } finally {
            setDiscSaving(false);
        }
    };

    const handleDeleteDiscipline = async (id: string) => {
        await disciplinesApi.delete(id);
        setDisciplines(prev => prev.filter(d => d.id !== id));
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

    const selectStyle = {
        padding: '10px 14px', background: 'var(--green-dark)',
        border: '1px solid rgba(201,148,58,.4)', color: 'var(--gold)',
        fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2,
        textTransform: 'uppercase' as const, borderRadius: 2, cursor: 'pointer', outline: 'none',
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
            <div className="page-enter page-content" style={{ padding: '60px 40px', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' as const }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, display: 'block' }}>
                    Verwaltung
                </span>
                <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: 'var(--cream)', marginBottom: 16 }}>
                    Admin
                </h2>
                <Separator />
                <div style={{ maxWidth: 480, margin: '0 auto' }}>
                <div style={{ background: 'rgba(240,230,204,.05)', border: '1px solid rgba(201,148,58,.2)', padding: 32, borderRadius: 2 }}>
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <img src="/PWLogo.png" alt="Prowestern" style={{ height: 64, marginBottom: 12, objectFit: 'contain' }} />
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
            </div>
        );
    }

    const tabs: { id: AdminTab; label: string }[] = [
        { id: 'disciplines', label: 'Disziplinen' },
        { id: 'matches', label: 'Begegnungen' },
        { id: 'teams', label: 'Teams' },
        { id: 'results', label: 'Ergebnisse' },
    ];

    const tabBar = (
        <>
            {/* Desktop */}
            <div className="tabs-desktop" style={{ display: 'flex', marginBottom: 32, borderBottom: '1px solid rgba(201,148,58,.2)', overflowX: 'auto' }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                        fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2,
                        textTransform: 'uppercase', padding: '12px 24px', cursor: 'pointer',
                        border: 'none', borderBottom: activeTab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
                        background: 'transparent', whiteSpace: 'nowrap',
                        color: activeTab === t.id ? 'var(--gold)' : 'var(--cream-dark)',
                        opacity: activeTab === t.id ? 1 : 0.5,
                        transition: 'color .2s, opacity .2s',
                        marginBottom: -1, flexShrink: 0,
                    }}>
                        {t.label}
                    </button>
                ))}
            </div>
            {/* Mobile */}
            <select
                className="tabs-mobile"
                value={activeTab}
                onChange={e => setActiveTab(e.target.value as AdminTab)}
                style={{ ...selectStyle, width: '100%', marginBottom: 24 }}
            >
                {tabs.map(t => (
                    <option key={t.id} value={t.id} style={{ background: '#0e2218' }}>{t.label}</option>
                ))}
            </select>
        </>
    );

    return (
        <div className="page-enter page-content" style={{ padding: '60px 40px', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' as const }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
                <div>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, display: 'block' }}>Verwaltung</span>
                    <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: 'var(--cream)' }}>Admin</h2>
                </div>
                <button onClick={logout} style={btnOutline}>Abmelden</button>
            </div>
            <Separator />

            {tabBar}

            {/* Disziplinen */}
            {activeTab === 'disciplines' && (
                <div>
                    {/* Modal */}
                    {discModalOpen && createPortal(
                        <div onClick={() => setDiscModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                            <div onClick={e => e.stopPropagation()} style={{ background: 'var(--green-dark)', border: '1px solid rgba(201,148,58,.3)', padding: 32, borderRadius: 2, width: '100%', maxWidth: 520 }}>
                                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 24 }}>Neue Disziplin</div>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={labelStyle}>Name</label>
                                        <input type="text" value={newDiscName}
                                            onChange={e => setNewDiscName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleCreateDiscipline()}
                                            style={fieldStyle} autoFocus
                                        />
                                    </div>
                                    <div style={{ width: 90 }}>
                                        <label style={labelStyle}>Nummer</label>
                                        <input type="number" value={newDiscNumber}
                                            onChange={e => setNewDiscNumber(e.target.value)}
                                            style={fieldStyle}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={labelStyle}>Beschreibung</label>
                                        <textarea value={newDiscDesc}
                                            onChange={e => setNewDiscDesc(e.target.value)}
                                            rows={6}
                                            style={{ ...fieldStyle, resize: 'none', height: 160, boxSizing: 'border-box' as const }}
                                        />
                                    </div>
                                    <div style={{ flexShrink: 0 }}>
                                        <label style={labelStyle}>Bild</label>
                                        <label style={{ display: 'block', cursor: 'pointer' }}>
                                            <input type="file" accept="image/*" onChange={handleImagePick} style={{ display: 'none' }} />
                                            {newDiscImagePreview ? (
                                                <div style={{ position: 'relative', width: 160, height: 160, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(201,148,58,.3)' }}>
                                                    <img src={newDiscImagePreview} alt="Vorschau" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .2s' }}
                                                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                                        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                                                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: 'var(--cream)', textTransform: 'uppercase' }}>Ändern</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ width: 160, height: 160, border: '1px dashed rgba(201,148,58,.35)', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(240,230,204,.03)', transition: 'border-color .15s, background .15s' }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,148,58,.7)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(240,230,204,.06)'; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,148,58,.35)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(240,230,204,.03)'; }}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(201,148,58,.6)" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: 'var(--cream-dark)', opacity: .5, textTransform: 'uppercase' }}>Bild hochladen</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                    <button onClick={() => setDiscModalOpen(false)} style={btnOutline}>Abbrechen</button>
                                    <button onClick={handleCreateDiscipline} disabled={discSaving || !newDiscName.trim() || !newDiscNumber} style={{ ...btnPrimary, opacity: (!newDiscName.trim() || !newDiscNumber) ? 0.5 : 1 }}>
                                        {discSaving ? 'Speichern...' : 'Anlegen'}
                                    </button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )}

                    {/* Toolbar */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <button onClick={() => setDiscModalOpen(true)} style={btnPrimary}>+ Neue Disziplin</button>
                    </div>

                    {/* Bestehende Disziplinen */}
                    <div style={{ border: '1px solid rgba(201,148,58,.2)', overflow: 'hidden' }}>
                        {disciplines.map(d => (
                            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(240,230,204,.07)', flexWrap: 'wrap' }}>
                                {d.icon?.startsWith('/') ? (
                                    <img src={d.icon} alt={d.name} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
                                ) : (
                                    <span style={{ fontSize: 24, width: 32, textAlign: 'center', flexShrink: 0 }}>{d.icon}</span>
                                )}
                                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: 'var(--gold)', opacity: .6, width: 20, flexShrink: 0 }}>{d.number}</span>
                                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--cream)' }}>{d.name}</span>
                                <button onClick={() => setDeleteTarget({ id: d.id, name: d.name })} style={{ background: 'none', border: 'none', color: 'var(--cream-dark)', opacity: .3, cursor: 'pointer', padding: '4px', flexShrink: 0, lineHeight: 0, transition: 'opacity .15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={e => (e.currentTarget.style.opacity = '.3')}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e07070" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                </button>
                                <div style={{ flex: 1 }} />
                                <select value={d.status} onChange={e => handleStatusChange(d.id, e.target.value)}
                                    style={{ ...selectStyle, flexShrink: 0 }}>
                                    <option value="upcoming" style={{ background: '#0e2218' }}>Geplant</option>
                                    <option value="next" style={{ background: '#0e2218' }}>Als nächstes</option>
                                    <option value="live" style={{ background: '#0e2218' }}>Läuft</option>
                                    <option value="done" style={{ background: '#0e2218' }}>Abgeschlossen</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Begegnungen */}
            {activeTab === 'matches' && (
                <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 160 }}>
                            <label style={labelStyle}>Disziplin</label>
                            <select value={matchDisc} onChange={e => setMatchDisc(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
                                {disciplines.map(d => <option key={d.id} value={d.id} style={{ background: '#0e2218' }}>Spiel {d.number}: {d.name}</option>)}
                            </select>
                        </div>
                        <div style={{ minWidth: 120 }}>
                            <label style={labelStyle}>Kategorie</label>
                            <select value={matchGender} onChange={e => setMatchGender(e.target.value as 'm' | 'f')} style={{ ...selectStyle, width: '100%' }}>
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
            )}

            {/* Teams verwalten */}
            {activeTab === 'teams' && (
                <div>
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
                            <select value={newTeamGender} onChange={e => setNewTeamGender(e.target.value as 'm' | 'f')} style={{ ...selectStyle, width: '100%' }}>
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
            )}

            {/* Ergebnisse eintragen */}
            {activeTab === 'results' && (
                <div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Disziplin</label>
                        <select value={selectedDisc} onChange={e => setSelectedDisc(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
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
            )}

            {deleteTarget && (
                <ConfirmModal
                    message={`"${deleteTarget.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
                    onConfirm={() => { handleDeleteDiscipline(deleteTarget.id); setDeleteTarget(null); }}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
