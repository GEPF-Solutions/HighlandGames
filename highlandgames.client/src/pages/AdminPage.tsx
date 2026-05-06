import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TeamDto, DisciplineDto, MatchDto, ResultDto, MeasurementType } from '../api/types';
import { teamsApi } from '../api/teamsApi';
import { disciplinesApi } from '../api/disciplinesApi';
import { resultsApi } from '../api/resultsApi';
import { getMatches, createMatch, updateMatch, deleteMatch, reorderMatches } from '../api/matches';
import { useAuth } from '../hooks/useAuth';
import { Separator } from '../components/Separator';
import { ConfirmModal } from '../components/ConfirmModal';

type AdminTab = 'disciplines' | 'matches' | 'teams' | 'results' | 'tiebreaker';

const tiebreakerRankColor = (i: number) =>
    i === 0 ? '#f0c040' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'rgba(240,230,204,.4)';

function SortableTiebreakerRow({ teamId, teamName, points, rank }: { teamId: string; teamName: string; points: number; rank: number }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: teamId });
    const color = tiebreakerRankColor(rank - 1);
    return (
        <div ref={setNodeRef} style={{
            transform: CSS.Transform.toString(transform), transition,
            opacity: isDragging ? 0.5 : 1,
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            borderBottom: '1px solid rgba(240,230,204,.07)',
            background: isDragging ? 'rgba(201,148,58,.06)' : 'transparent',
        }}>
            <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--cream-dark)', opacity: .3, flexShrink: 0, lineHeight: 0, padding: '2px 4px' }}>
                <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
                    <circle cx="4" cy="3" r="1.5"/><circle cx="8" cy="3" r="1.5"/>
                    <circle cx="4" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/>
                    <circle cx="4" cy="13" r="1.5"/><circle cx="8" cy="13" r="1.5"/>
                </svg>
            </div>
            <span style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${color}22`, border: `1px solid ${color}66`,
                fontFamily: 'Cinzel, serif', fontSize: 12, fontWeight: 700, color,
            }}>{rank}</span>
            <span style={{ flex: 1, fontFamily: 'Cinzel, serif', fontSize: 14, color: 'var(--cream)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {teamName}
            </span>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: 'var(--gold)', opacity: .5, flexShrink: 0 }}>
                {points} Pkt
            </span>
        </div>
    );
}

function parseRawValue(v: string): number {
    if (!v) return Infinity;
    if (v.includes(':')) {
        const [min, sec] = v.split(':');
        return parseInt(min) * 60 + parseFloat(sec || '0');
    }
    return parseFloat(v.replace(/[^0-9.]/g, '')) || 0;
}

interface SortableMatchRowProps {
    match: MatchDto;
    measurementType: MeasurementType;
    valueA: string;
    valueB: string;
    onValueAChange: (v: string) => void;
    onValueBChange: (v: string) => void;
    onSaveScore: () => void;
    onSaveMeasurement: (teamId: string, rawValue: string) => void;
    onSetWinner: (winnerId: string | null) => void;
    onSetSoloResult?: (rawValue: 'Sieg' | 'Niederlage') => void;
    soloResultRawValue?: string;
    onDelete: () => void;
    fieldStyle: React.CSSProperties;
}

function SortableMatchRow({ match: m, measurementType, valueA, valueB, onValueAChange, onValueBChange, onSaveScore, onSaveMeasurement, onSetWinner, onSetSoloResult, soloResultRawValue, onDelete, fieldStyle }: SortableMatchRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.id });
    const rowStyle: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
        borderBottom: '1px solid rgba(240,230,204,.07)',
        background: isDragging ? 'rgba(201,148,58,.06)' : 'transparent',
    };

    const measurePlaceholder = measurementType === 'time' ? '0:00.0' : '0.00';
    const measureInput = (value: string, onChange: (v: string) => void, teamId: string) => (
        <input type="text" placeholder={measurePlaceholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            onBlur={() => onSaveMeasurement(teamId, value)}
            style={{ ...fieldStyle, width: 90, textAlign: 'center', padding: '4px 6px', fontSize: 12, flexShrink: 0 }}
        />
    );

    const winnerBtn = (label: string, teamId: string) => {
        const isWinner = m.winnerTeamId === teamId;
        return (
            <button onClick={() => onSetWinner(isWinner ? null : teamId)} style={{
                fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
                padding: '3px 8px', borderRadius: 2, cursor: 'pointer', flexShrink: 0,
                border: isWinner ? '1px solid rgba(201,148,58,.5)' : '1px solid rgba(240,230,204,.15)',
                background: isWinner ? 'rgba(201,148,58,.15)' : 'transparent',
                color: isWinner ? 'var(--gold)' : 'var(--cream-dark)',
                transition: 'all .15s',
            }}>{label}</button>
        );
    };

    const teamNameStyle = (teamId: string): React.CSSProperties => ({
        flex: 1, fontSize: 13, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        color: m.winnerTeamId === teamId ? 'var(--gold)' : 'var(--cream)',
    });

    return (
        <div ref={setNodeRef} style={rowStyle}>
            <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--cream-dark)', opacity: .3, flexShrink: 0, padding: '2px 4px', lineHeight: 0 }}>
                <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
                    <circle cx="4" cy="3" r="1.5"/><circle cx="8" cy="3" r="1.5"/>
                    <circle cx="4" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/>
                    <circle cx="4" cy="13" r="1.5"/><circle cx="8" cy="13" r="1.5"/>
                </svg>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                {measurementType === 'duel' ? (
                    m.teamBId ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={teamNameStyle(m.teamAId)}>{m.teamAName}</span>
                            {winnerBtn('Sieger', m.teamAId)}
                            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: 'var(--cream-dark)', opacity: .3 }}>vs</span>
                            {winnerBtn('Sieger', m.teamBId)}
                            <span style={{ ...teamNameStyle(m.teamBId), textAlign: 'right' }}>{m.teamBName}</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ flex: 1, fontSize: 13, color: 'var(--cream)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.teamAName}</span>
                            {(['Sieg', 'Niederlage'] as const).map(result => {
                                const active = soloResultRawValue === result;
                                const label = result === 'Sieg' ? 'Sieger' : 'Verlierer';
                                return (
                                    <button key={result} onClick={() => onSetSoloResult?.(result)} style={{
                                        fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
                                        padding: '3px 8px', borderRadius: 2, cursor: 'pointer', flexShrink: 0,
                                        border: active
                                            ? (result === 'Sieg' ? '1px solid rgba(201,148,58,.5)' : '1px solid rgba(200,60,60,.5)')
                                            : '1px solid rgba(240,230,204,.15)',
                                        background: active
                                            ? (result === 'Sieg' ? 'rgba(201,148,58,.15)' : 'rgba(200,60,60,.15)')
                                            : 'transparent',
                                        color: active
                                            ? (result === 'Sieg' ? 'var(--gold)' : '#e07070')
                                            : 'var(--cream-dark)',
                                        transition: 'all .15s',
                                    }}>{label}</button>
                                );
                            })}
                            <div style={{ flex: 1 }} />
                        </div>
                    )
                ) : measurementType === 'time' || measurementType === 'distance' ? (
                    m.teamBId ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={teamNameStyle(m.teamAId)}>{m.teamAName}</span>
                            {measureInput(valueA, onValueAChange, m.teamAId)}
                            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: 'var(--cream-dark)', opacity: .3 }}>vs</span>
                            {measureInput(valueB, onValueBChange, m.teamBId)}
                            <span style={{ ...teamNameStyle(m.teamBId), textAlign: 'right' }}>{m.teamBName}</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ flex: 1, fontSize: 13, color: 'var(--cream)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.teamAName}</span>
                            {measureInput(valueA, onValueAChange, m.teamAId)}
                            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, opacity: 0, flexShrink: 0 }}>vs</span>
                            <div style={{ width: 90, flexShrink: 0 }} />
                            <div style={{ flex: 1 }} />
                        </div>
                    )
                ) : (
                    m.teamBId ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={teamNameStyle(m.teamAId)}>{m.teamAName}</span>
                            <input type="number" placeholder="–" value={valueA} onChange={e => onValueAChange(e.target.value)} onBlur={onSaveScore} style={{ ...fieldStyle, width: 52, textAlign: 'center', padding: '4px 6px', fontSize: 13, flexShrink: 0 }} />
                            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: 'var(--cream-dark)', opacity: .5 }}>:</span>
                            <input type="number" placeholder="–" value={valueB} onChange={e => onValueBChange(e.target.value)} onBlur={onSaveScore} style={{ ...fieldStyle, width: 52, textAlign: 'center', padding: '4px 6px', fontSize: 13, flexShrink: 0 }} />
                            <span style={{ ...teamNameStyle(m.teamBId), textAlign: 'right' }}>{m.teamBName}</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ flex: 1, fontSize: 13, color: 'var(--cream)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.teamAName}</span>
                            <input type="number" placeholder="–" value={valueA} onChange={e => onValueAChange(e.target.value)} onBlur={onSaveScore} style={{ ...fieldStyle, width: 52, textAlign: 'center', padding: '4px 6px', fontSize: 13, flexShrink: 0 }} />
                            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, opacity: 0, flexShrink: 0 }}>:</span>
                            <div style={{ width: 52, flexShrink: 0 }} />
                            <div style={{ flex: 1 }} />
                        </div>
                    )
                )}
            </div>

            <button onClick={onDelete} style={{ background: 'none', border: 'none', color: 'var(--cream-dark)', opacity: .3, cursor: 'pointer', padding: 4, flexShrink: 0, lineHeight: 0, transition: 'opacity .15s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '.3')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e07070" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
        </div>
    );
}

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
    const [matchDisc, setMatchDisc] = useState('');
    const [matchGender, setMatchGender] = useState<'m' | 'f'>('m');
    const [matchesM, setMatchesM] = useState<MatchDto[]>([]);
    const [matchesF, setMatchesF] = useState<MatchDto[]>([]);
    const [matchScores, setMatchScores] = useState<Record<string, { a: string; b: string }>>({});
    const [matchSaved, setMatchSaved] = useState(false);
    const [selectedTeamA, setSelectedTeamA] = useState<string | null>(null);
    const [matchDeleteTarget, setMatchDeleteTarget] = useState<string | null>(null);
    const [matchModalOpen, setMatchModalOpen] = useState(false);
    const [matchResults, setMatchResults] = useState<ResultDto[]>([]);
    const [leaderboardPoints, setLeaderboardPoints] = useState<Record<string, number>>({});
    const [tiebreakerGroups, setTiebreakerGroups] = useState<Record<string, TeamDto[]>>({});
    const [tiebreakerDirty, setTiebreakerDirty] = useState(false);
    const [newDiscName, setNewDiscName] = useState('');
    const [newDiscNumber, setNewDiscNumber] = useState('');
    const [newDiscDesc, setNewDiscDesc] = useState('');
    const [newDiscMeasurementType, setNewDiscMeasurementType] = useState<MeasurementType>('none');
    const [newDiscImage, setNewDiscImage] = useState<File | null>(null);
    const [newDiscImagePreview, setNewDiscImagePreview] = useState<string | null>(null);
    const [discSaving, setDiscSaving] = useState(false);
    const [discModalOpen, setDiscModalOpen] = useState(false);
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [teamAdded, setTeamAdded] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: 'discipline' | 'team' } | null>(null);

    const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    useEffect(() => {
        if (!loggedIn) return;
        disciplinesApi.getAll().then(d => {
            setDisciplines(d);
            if (d.length > 0) { setSelectedDisc(d[0].id); setMatchDisc(d[0].id); }
        });
        loadTeams();
    }, [loggedIn]);

    useEffect(() => {
        if (activeTab === 'matches' && matchDisc) {
            loadMatches(matchDisc);
        }
    }, [activeTab, matchDisc]);

    useEffect(() => {
        if (!loggedIn || !selectedDisc) return;
        resultsApi.getByDiscipline(selectedDisc).then(results => {
            setPoints(Object.fromEntries(results.map(r => [r.teamId, { points: String(r.points), rawValue: r.rawValue ?? '' }])));
        });
    }, [selectedDisc, loggedIn, activeTab]);

    useEffect(() => {
        if (activeTab !== 'tiebreaker' || !loggedIn || teams.length === 0) return;
        Promise.all([resultsApi.getLeaderboard('m'), resultsApi.getLeaderboard('f')]).then(([lbM, lbF]) => {
            const allLb = [...lbM, ...lbF];
            const pts = Object.fromEntries(allLb.map(e => [e.teamId, e.totalPoints]));
            const tbRanks = Object.fromEntries(allLb.map(e => [e.teamId, e.tiebreakerRank ?? null]));
            setLeaderboardPoints(pts);
            const newGroups: Record<string, TeamDto[]> = {};
            for (const g of ['m', 'f'] as const) {
                const byPoints = new Map<number, TeamDto[]>();
                for (const t of teams.filter(t => t.gender === g)) {
                    const p = pts[t.id] ?? 0;
                    if (p === 0) continue;
                    if (!byPoints.has(p)) byPoints.set(p, []);
                    byPoints.get(p)!.push(t);
                }
                for (const [p, group] of byPoints) {
                    if (group.length < 2) continue;
                    const key = `${g}-${p}`;
                    newGroups[key] = [...group].sort((a, b) =>
                        (tbRanks[a.id] ?? Infinity) - (tbRanks[b.id] ?? Infinity) || a.name.localeCompare(b.name)
                    );
                }
            }
            setTiebreakerGroups(newGroups);
        });
    }, [activeTab, loggedIn, teams]);


    const loadTeams = async () => {
        const [m, f] = await Promise.all([teamsApi.getByGender('m'), teamsApi.getByGender('f')]);
        const all = [...m, ...f];
        setTeams(all);
    };

    const handleAddTeam = async () => {
        if (!newTeamName.trim()) return;
        await teamsApi.create({ name: newTeamName.trim(), gender: newTeamGender });
        setNewTeamName('');
        setTeamAdded(true);
        setTimeout(() => setTeamAdded(false), 1800);
        loadTeams();
    };

    const handleDeleteTeam = async (id: string) => {
        await teamsApi.delete(id);
        loadTeams();
    };

    const handleSavePoint = async (teamId: string) => {
        const v = points[teamId];
        const pts = parseInt(v?.points ?? '0') || 0;
        await resultsApi.upsert({ teamId, disciplineId: selectedDisc, points: pts, rawValue: v?.rawValue || undefined });
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
                newDiscMeasurementType,
                newDiscImage,
            );
            setDisciplines(prev => [...prev, dto].sort((a, b) => a.number - b.number));
            setNewDiscName('');
            setNewDiscNumber('');
            setNewDiscDesc('');
            setNewDiscMeasurementType('none');
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

    const loadMatches = async (disc = matchDisc) => {
        const [dataM, dataF, results, lbM, lbF] = await Promise.all([
            getMatches(disc, 'm'),
            getMatches(disc, 'f'),
            resultsApi.getByDiscipline(disc),
            resultsApi.getLeaderboard('m'),
            resultsApi.getLeaderboard('f'),
        ]);
        setLeaderboardPoints(Object.fromEntries([...lbM, ...lbF].map(e => [e.teamId, e.totalPoints])));
        setMatchesM(dataM);
        setMatchesF(dataF);
        setMatchResults(results);

        const initialScores: Record<string, { a: string; b: string }> = {};
        for (const m of [...dataM, ...dataF]) {
            const rA = results.find(r => r.teamId === m.teamAId);
            const rB = m.teamBId ? results.find(r => r.teamId === m.teamBId) : undefined;
            initialScores[m.id] = {
                a: rA?.rawValue ?? (m.teamAScore !== null ? String(m.teamAScore) : ''),
                b: rB?.rawValue ?? (m.teamBScore !== null ? String(m.teamBScore) : ''),
            };
        }
        setMatchScores(initialScores);
        setSelectedTeamA(null);
    };

    const handleTeamClick = async (teamId: string) => {
        if (!matchDisc) return;
        if (selectedTeamA === null) {
            setSelectedTeamA(teamId);
        } else if (selectedTeamA === teamId) {
            setSelectedTeamA(null);
        } else {
            await createMatch(matchDisc, matchGender, selectedTeamA, teamId);
            setSelectedTeamA(null);
            await loadMatches();
        }
    };

    const handleAddIndividual = async (teamId: string) => {
        if (!matchDisc) return;
        await createMatch(matchDisc, matchGender, teamId, null);
        await loadMatches();
    };

    const handleDeleteMatch = async (id: string) => {
        await deleteMatch(id);
        setMatchesM(prev => prev.filter(m => m.id !== id));
        setMatchesF(prev => prev.filter(m => m.id !== id));
        setMatchDeleteTarget(null);
    };

    const updateMatchInState = (updated: MatchDto) => {
        setMatchesM(prev => prev.map(m => m.id === updated.id ? updated : m));
        setMatchesF(prev => prev.map(m => m.id === updated.id ? updated : m));
    };


    const handleSaveMeasurement = async (matchId: string, teamId: string, rawValue: string) => {
        if (!rawValue.trim()) {
            const existing = matchResults.find(r => r.teamId === teamId && r.disciplineId === matchDisc);
            if (existing) await resultsApi.delete(existing.id);
        } else {
            await resultsApi.upsert({ teamId, disciplineId: matchDisc, points: 0, rawValue });
        }
        const results = await resultsApi.getByDiscipline(matchDisc);
        setMatchResults(results);
        if (matchDisc === selectedDisc) {
            setPoints(Object.fromEntries(results.map(r => [r.teamId, { points: String(r.points), rawValue: r.rawValue ?? '' }])));
        }
        if (!rawValue.trim()) return;

        const match = [...matchesM, ...matchesF].find(m => m.id === matchId);
        if (match?.teamBId) {
            const scores = matchScores[matchId] ?? { a: '', b: '' };
            const currentA = teamId === match.teamAId ? rawValue : scores.a;
            const currentB = teamId === match.teamBId ? rawValue : scores.b;
            if (currentA && currentB) {
                const pA = parseRawValue(currentA), pB = parseRawValue(currentB);
                const disc = disciplines.find(d => d.id === matchDisc);
                let winnerId: string | null = null;
                if (disc?.measurementType === 'time') winnerId = pA < pB ? match.teamAId : match.teamBId;
                else if (disc?.measurementType === 'distance') winnerId = pA > pB ? match.teamAId : match.teamBId;
                if (winnerId) {
                    const updated = await updateMatch(matchId, { winnerTeamId: winnerId });
                    updateMatchInState(updated);
                }
            }
        }
    };

    const handleSoloResult = async (matchId: string, rawValue: 'Sieg' | 'Niederlage') => {
        const match = [...matchesM, ...matchesF].find(m => m.id === matchId);
        if (!match) return;
        const current = matchResults.find(r => r.teamId === match.teamAId)?.rawValue;
        if (current === rawValue) {
            const updated = await updateMatch(matchId, { winnerTeamId: null });
            updateMatchInState(updated);
            const toDelete = matchResults.filter(r => r.teamId === match.teamAId);
            await Promise.all(toDelete.map(r => resultsApi.delete(r.id)));
        } else {
            const winnerId = rawValue === 'Sieg' ? match.teamAId : null;
            const updated = await updateMatch(matchId, { winnerTeamId: winnerId });
            updateMatchInState(updated);
            await resultsApi.upsert({ teamId: match.teamAId, disciplineId: matchDisc, points: 0, rawValue });
        }
        const results = await resultsApi.getByDiscipline(matchDisc);
        setMatchResults(results);
        if (matchDisc === selectedDisc)
            setPoints(Object.fromEntries(results.map(r => [r.teamId, { points: String(r.points), rawValue: r.rawValue ?? '' }])));
    };

    const handleTiebreakerDragEnd = (event: DragEndEvent, groupKey: string) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setTiebreakerGroups(prev => {
            const group = prev[groupKey] ?? [];
            const oldIndex = group.findIndex(t => t.id === active.id);
            const newIndex = group.findIndex(t => t.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return prev;
            return { ...prev, [groupKey]: arrayMove(group, oldIndex, newIndex) };
        });
        setTiebreakerDirty(true);
    };

    const handleSaveTiebreaker = async () => {
        const ranks: { id: string; rank: number }[] = [];
        for (const groupTeams of Object.values(tiebreakerGroups)) {
            groupTeams.forEach((t, i) => ranks.push({ id: t.id, rank: i + 1 }));
        }
        await teamsApi.setTiebreakerRanksBulk(ranks);
        setTiebreakerDirty(false);
    };

    const handleSetWinner = async (matchId: string, winnerId: string | null) => {
        const match = [...matchesM, ...matchesF].find(m => m.id === matchId);
        const updated = await updateMatch(matchId, { winnerTeamId: winnerId });
        updateMatchInState(updated);

        const disc = disciplines.find(d => d.id === matchDisc);
        if (disc?.measurementType === 'duel' && match) {
            if (winnerId) {
                const loserId = winnerId === match.teamAId ? match.teamBId : match.teamAId;
                await resultsApi.upsert({ teamId: winnerId, disciplineId: matchDisc, points: 0, rawValue: 'Sieg' });
                if (loserId) await resultsApi.upsert({ teamId: loserId, disciplineId: matchDisc, points: 0, rawValue: 'Niederlage' });
            } else {
                const toDelete = matchResults.filter(r => r.teamId === match.teamAId || r.teamId === match.teamBId);
                await Promise.all(toDelete.map(r => resultsApi.delete(r.id)));
            }
            const results = await resultsApi.getByDiscipline(matchDisc);
            setMatchResults(results);
            if (matchDisc === selectedDisc)
                setPoints(Object.fromEntries(results.map(r => [r.teamId, { points: String(r.points), rawValue: r.rawValue ?? '' }])));
        }
    };

    const handleSaveMatchScore = async (id: string) => {
        const v = matchScores[id];
        if (!v) return;
        const match = [...matchesM, ...matchesF].find(m => m.id === id);
        if (!match) return;
        const aScore = v.a !== '' ? parseInt(v.a) : null;
        const bScore = v.b !== '' ? parseInt(v.b) : null;
        let winnerId: string | null = null;
        if (aScore !== null && bScore !== null && match.teamBId) {
            winnerId = aScore > bScore ? match.teamAId : match.teamBId;
        }
        const updated = await updateMatch(id, { teamAScore: aScore, teamBScore: bScore, winnerTeamId: winnerId });
        updateMatchInState(updated);
        setMatchScores(prev => { const next = { ...prev }; delete next[id]; return next; });
        setMatchSaved(true);
        setTimeout(() => setMatchSaved(false), 1800);
    };

    const handleDragEnd = async (event: DragEndEvent, gender: 'm' | 'f') => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const gMatches = gender === 'm' ? matchesM : matchesF;
        const setGMatches = gender === 'm' ? setMatchesM : setMatchesF;
        const oldIndex = gMatches.findIndex(m => m.id === active.id);
        const newIndex = gMatches.findIndex(m => m.id === over.id);
        const reordered = arrayMove(gMatches, oldIndex, newIndex);
        setGMatches(reordered);
        await reorderMatches(matchDisc, gender, reordered.map(m => m.id));
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
        fontFamily: 'Cinzel, serif', fontSize: 14, letterSpacing: 0,
        textTransform: 'uppercase' as const, padding: '10px 16px', borderRadius: 2,
        cursor: 'pointer', border: 'none', background: 'var(--gold)',
        color: '#000', whiteSpace: 'nowrap' as const,
    };

    const btnOutline = {
        fontFamily: 'Cinzel, serif', fontSize: 14, letterSpacing: 0,
        textTransform: 'uppercase' as const, padding: '10px 16px', borderRadius: 2,
        cursor: 'pointer', border: '1px solid rgba(240,230,204,.2)',
        background: 'transparent', color: 'var(--cream-dark)', whiteSpace: 'nowrap' as const,
    };


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
        { id: 'teams', label: 'Teams' },
        { id: 'matches', label: 'Begegnungen' },
        { id: 'results', label: 'Ergebnisse' },
        { id: 'tiebreaker', label: 'Stechen' },
    ];

    const tabBar = (
        <>
            {/* Desktop */}
            <div className="tabs-desktop" style={{ display: 'flex', marginBottom: 32, borderBottom: '1px solid rgba(201,148,58,.2)' }}>
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
                                <div style={{ marginBottom: 16 }}>
                                    <label style={labelStyle}>Messung</label>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {([['none', 'Keine'], ['time', 'Zeit'], ['distance', 'Distanz'], ['duel', 'Duell']] as [MeasurementType, string][]).map(([val, label]) => (
                                            <button key={val} onClick={() => setNewDiscMeasurementType(val)} style={{
                                                flex: 1, padding: '8px 4px', borderRadius: 2, cursor: 'pointer',
                                                fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1,
                                                border: newDiscMeasurementType === val ? '1px solid rgba(201,148,58,.6)' : '1px solid rgba(240,230,204,.15)',
                                                background: newDiscMeasurementType === val ? 'rgba(201,148,58,.15)' : 'transparent',
                                                color: newDiscMeasurementType === val ? 'var(--gold)' : 'var(--cream-dark)',
                                                transition: 'all .15s',
                                            }}>{label}</button>
                                        ))}
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
                                {d.measurementType !== 'none' && (
                                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 2, flexShrink: 0, background: 'rgba(240,230,204,.06)', border: '1px solid rgba(240,230,204,.12)', color: 'var(--cream-dark)', opacity: .6 }}>
                                        {d.measurementType === 'time' ? 'Zeit' : d.measurementType === 'distance' ? 'Distanz' : 'Duell'}
                                    </span>
                                )}
                                <button onClick={() => setDeleteTarget({ id: d.id, name: d.name, type: 'discipline' })} style={{ background: 'none', border: 'none', color: 'var(--cream-dark)', opacity: .3, cursor: 'pointer', padding: '4px', flexShrink: 0, lineHeight: 0, transition: 'opacity .15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={e => (e.currentTarget.style.opacity = '.3')}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e07070" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                </button>
                                <div style={{ flex: 1 }} />
                                <select value={d.status} onChange={e => handleStatusChange(d.id, e.target.value)}
                                    style={{ ...selectStyle, flexShrink: 0, minWidth: 160 }}>
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
                    {/* Discipline selector – Desktop */}
                    <div className="tabs-desktop" style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 24 }}>
                        {disciplines.map(d => (
                            <button key={d.id} onClick={() => setMatchDisc(d.id)} style={{
                                fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2,
                                textTransform: 'uppercase', padding: '10px 20px', cursor: 'pointer',
                                transition: 'all .2s', borderRadius: '2px 2px 0 0', borderBottom: 'none',
                                background: matchDisc === d.id ? 'var(--green-dark)' : 'rgba(240,230,204,.06)',
                                color: matchDisc === d.id ? 'var(--gold)' : 'var(--cream-dark)',
                                border: matchDisc === d.id ? '1px solid rgba(201,148,58,.4)' : '1px solid rgba(240,230,204,.12)',
                            }}>
                                {d.name}
                            </button>
                        ))}
                    </div>
                    {/* Discipline selector – Mobile */}
                    <select className="tabs-mobile" value={matchDisc} onChange={e => setMatchDisc(e.target.value)}
                        style={{ ...selectStyle, width: '100%', marginBottom: 24 }}>
                        {disciplines.map(d => <option key={d.id} value={d.id} style={{ background: '#0e2218' }}>Spiel {d.number}: {d.name}</option>)}
                    </select>

                    {/* Add match modal */}
                    {matchModalOpen && createPortal((() => {
                        const genderMatches = matchGender === 'm' ? matchesM : matchesF;
                        const usedTeamIds = new Set(genderMatches.flatMap(m => m.teamBId ? [m.teamAId, m.teamBId] : [m.teamAId]));
                        const sortedTeams = [...teams.filter(t => t.gender === matchGender)]
                            .sort((a, b) => (leaderboardPoints[b.id] ?? -1) - (leaderboardPoints[a.id] ?? -1));
                        const closeModal = () => { setMatchModalOpen(false); setSelectedTeamA(null); };
                        return (
                            <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                                <div onClick={e => e.stopPropagation()} style={{ background: 'var(--green-dark)', border: '1px solid rgba(201,148,58,.3)', borderRadius: 2, width: '100%', maxWidth: 440, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(240,230,204,.07)', flexShrink: 0 }}>
                                        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 6 }}>
                                            Begegnung — {matchGender === 'm' ? '♂ Männer' : '♀ Frauen'}
                                        </div>
                                        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, color: selectedTeamA ? 'var(--gold)' : 'var(--cream-dark)', opacity: selectedTeamA ? .9 : .5 }}>
                                            {selectedTeamA
                                                ? `Duell: ${teams.find(t => t.id === selectedTeamA)?.name} — zweites Team wählen`
                                                : 'Team wählen und Begegnungstyp festlegen'}
                                        </div>
                                    </div>
                                    <div style={{ overflowY: 'auto', flex: 1 }}>
                                        {sortedTeams.length === 0 ? (
                                            <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 12, color: 'var(--cream-dark)', opacity: .3 }}>Keine Teams</div>
                                        ) : sortedTeams.map((t, i) => {
                                            const isSelected = selectedTeamA === t.id;
                                            const isUsed = usedTeamIds.has(t.id);
                                            const pts = leaderboardPoints[t.id];
                                            const btnAction: React.CSSProperties = {
                                                padding: '6px 12px', borderRadius: 2, cursor: 'pointer', flexShrink: 0,
                                                fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
                                                transition: 'all .15s',
                                            };
                                            const rowBg = isSelected ? 'rgba(201,148,58,.07)' : isUsed ? 'rgba(125,196,158,.05)' : 'transparent';
                                            const nameColor = isSelected ? 'var(--gold)' : isUsed ? '#7dc49e' : 'var(--cream)';
                                            return (
                                                <div key={t.id} style={{
                                                    display: 'flex', alignItems: 'center', gap: 10,
                                                    padding: '10px 16px 10px 20px',
                                                    borderBottom: '1px solid rgba(240,230,204,.06)',
                                                    background: rowBg,
                                                    transition: 'background .12s',
                                                }}>
                                                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: 'var(--gold)', opacity: .4, width: 18, flexShrink: 0, textAlign: 'right' }}>{i + 1}</span>
                                                    <span style={{ flex: 1, fontFamily: 'Cinzel, serif', fontSize: 13, color: nameColor, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                                                    {pts !== undefined && <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: 'var(--gold)', opacity: .5, flexShrink: 0 }}>{pts} Pkt</span>}
                                                    <button onClick={() => handleAddIndividual(t.id)} style={{
                                                        ...btnAction,
                                                        border: '1px solid rgba(240,230,204,.15)',
                                                        background: 'transparent',
                                                        color: 'var(--cream-dark)',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(240,230,204,.4)'; e.currentTarget.style.color = 'var(--cream)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(240,230,204,.15)'; e.currentTarget.style.color = 'var(--cream-dark)'; }}>
                                                        Einzeln
                                                    </button>
                                                    <button onClick={() => handleTeamClick(t.id)} style={{
                                                        ...btnAction,
                                                        border: isSelected ? '1px solid rgba(201,148,58,.6)' : '1px solid rgba(201,148,58,.25)',
                                                        background: isSelected ? 'rgba(201,148,58,.2)' : 'transparent',
                                                        color: isSelected ? 'var(--gold)' : 'var(--cream-dark)',
                                                    }}>
                                                        {isSelected ? '✕' : 'Duell'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(240,230,204,.07)', flexShrink: 0 }}>
                                        <button onClick={closeModal} style={btnOutline}>Schließen</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })(), document.body)}

                    {/* Two-column layout */}
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        {(['m', 'f'] as const).map(g => {
                            const gMatches = g === 'm' ? matchesM : matchesF;
                            const disc = disciplines.find(d => d.id === matchDisc);
                            const mt = disc?.measurementType ?? 'none';
                            return (
                                <div key={g} style={{ flex: '1 1 320px', minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: g === 'm' ? '#7aadff' : '#ff8aaa' }}>
                                            {g === 'm' ? '♂ Männer' : '♀ Frauen'}
                                        </span>
                                        <button onClick={() => { setMatchGender(g); setMatchModalOpen(true); }} style={btnPrimary}>+ Begegnung</button>
                                    </div>
                                    {gMatches.length === 0 ? (
                                        <div style={{ padding: '32px 20px', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 2, color: 'var(--cream-dark)', opacity: .3, border: '1px dashed rgba(201,148,58,.2)' }}>
                                            Noch keine Begegnungen
                                        </div>
                                    ) : (
                                        <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={e => handleDragEnd(e, g)}>
                                            <SortableContext items={gMatches.map(m => m.id)} strategy={verticalListSortingStrategy}>
                                                <div style={{ border: '1px solid rgba(201,148,58,.2)', overflow: 'hidden' }}>
                                                    {gMatches.map(m => (
                                                        <SortableMatchRow
                                                            key={m.id}
                                                            match={m}
                                                            measurementType={mt}
                                                            valueA={matchScores[m.id]?.a ?? ''}
                                                            valueB={matchScores[m.id]?.b ?? ''}
                                                            onValueAChange={v => setMatchScores(prev => ({ ...prev, [m.id]: { ...prev[m.id], a: v } }))}
                                                            onValueBChange={v => setMatchScores(prev => ({ ...prev, [m.id]: { ...prev[m.id], b: v } }))}
                                                            onSaveScore={() => handleSaveMatchScore(m.id)}
                                                            onSaveMeasurement={(teamId, rawValue) => handleSaveMeasurement(m.id, teamId, rawValue)}
                                                            onSetWinner={winnerId => handleSetWinner(m.id, winnerId)}
                                                            onSetSoloResult={!m.teamBId ? rawValue => handleSoloResult(m.id, rawValue) : undefined}
                                                            soloResultRawValue={!m.teamBId ? matchResults.find(r => r.teamId === m.teamAId)?.rawValue : undefined}
                                                            onDelete={() => setMatchDeleteTarget(m.id)}
                                                            fieldStyle={fieldStyle}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {matchSaved && <div style={{ textAlign: 'center', marginTop: 12, fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: '#7dc49e', textTransform: 'uppercase' }}>✓ Gespeichert</div>}

                    {matchDeleteTarget && (
                        <ConfirmModal
                            message="Begegnung wirklich löschen?"
                            onConfirm={() => handleDeleteMatch(matchDeleteTarget)}
                            onCancel={() => setMatchDeleteTarget(null)}
                        />
                    )}
                </div>
            )}

            {/* Teams verwalten */}
            {activeTab === 'teams' && (
                <div>
                    {/* Modal */}
                    {teamModalOpen && createPortal(
                        <div onClick={() => setTeamModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                            <div onClick={e => e.stopPropagation()} style={{ background: 'var(--green-dark)', border: '1px solid rgba(201,148,58,.3)', padding: 32, borderRadius: 2, width: '100%', maxWidth: 400 }}>
                                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 24 }}>Team hinzufügen</div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={labelStyle}>Name</label>
                                    <input type="text" value={newTeamName} autoFocus
                                        onChange={e => setNewTeamName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddTeam()}
                                        style={fieldStyle}
                                    />
                                </div>
                                <div style={{ marginBottom: 24 }}>
                                    <label style={labelStyle}>Kategorie</label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {(['m', 'f'] as const).map(g => (
                                            <button key={g} onClick={() => setNewTeamGender(g)} style={{
                                                flex: 1, padding: '10px', borderRadius: 2, cursor: 'pointer',
                                                fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 1,
                                                border: newTeamGender === g ? '1px solid rgba(201,148,58,.6)' : '1px solid rgba(240,230,204,.15)',
                                                background: newTeamGender === g ? 'rgba(201,148,58,.15)' : 'transparent',
                                                color: newTeamGender === g ? 'var(--gold)' : 'var(--cream-dark)',
                                                transition: 'all .15s',
                                            }}>
                                                {g === 'm' ? '♂ Männer' : '♀ Frauen'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <button onClick={() => setTeamModalOpen(false)} style={{ ...btnOutline }}>Schließen</button>
                                    <button onClick={handleAddTeam} disabled={!newTeamName.trim()} style={{ ...btnPrimary, flex: 1, opacity: !newTeamName.trim() ? 0.5 : 1, background: teamAdded ? 'var(--green-light)' : 'var(--gold)', transition: 'background .3s' }}>
                                        {teamAdded ? '✓ Hinzugefügt' : '+ Hinzufügen'}
                                    </button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )}

                    {/* Toolbar */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <button onClick={() => setTeamModalOpen(true)} style={btnPrimary}>+ Team hinzufügen</button>
                    </div>

                    {/* Teams nach Kategorie */}
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    {(['m', 'f'] as const).map(g => {
                        const gTeams = teams.filter(t => t.gender === g);
                        return (
                            <div key={g} style={{ flex: '1 1 280px', minWidth: 0 }}>
                                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: g === 'm' ? '#7aadff' : '#ff8aaa', marginBottom: 10 }}>
                                    {g === 'm' ? '♂ Männer' : '♀ Frauen'} <span style={{ opacity: .5 }}>({gTeams.length})</span>
                                </div>
                                <div style={{ border: '1px solid rgba(201,148,58,.2)', overflow: 'hidden' }}>
                                    {gTeams.length === 0 ? (
                                        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 12, color: 'var(--cream-dark)', opacity: .3 }}>Keine Teams</div>
                                    ) : gTeams.map((t, i) => (
                                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: i < gTeams.length - 1 ? '1px solid rgba(240,230,204,.07)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                                            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: 'var(--gold)', opacity: .4, width: 20, flexShrink: 0 }}>{i + 1}</span>
                                            <span style={{ flex: 1, fontSize: 15, color: 'var(--cream)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                                            <button onClick={() => setDeleteTarget({ id: t.id, name: t.name, type: 'team' })} style={{ background: 'none', border: 'none', color: 'var(--cream-dark)', opacity: .3, cursor: 'pointer', padding: '4px', flexShrink: 0, lineHeight: 0, transition: 'opacity .15s' }}
                                                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                                onMouseLeave={e => (e.currentTarget.style.opacity = '.3')}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e07070" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    </div>
                </div>
            )}

            {/* Ergebnisse eintragen */}
            {activeTab === 'results' && (() => {
                const selectedDiscObj = disciplines.find(d => d.id === selectedDisc);
                const mt = selectedDiscObj?.measurementType ?? 'none';
                const sortedFor = (gender: 'm' | 'f') => [...teams].filter(t => t.gender === gender).sort((a, b) => {
                    if (mt === 'duel') {
                        const ra = points[a.id]?.rawValue ?? '';
                        const rb = points[b.id]?.rawValue ?? '';
                        const rank = (v: string) => v === 'Sieg' ? 0 : v === 'Niederlage' ? 1 : 2;
                        return rank(ra) - rank(rb);
                    }
                    if (mt === 'none') return 0;
                    const rawA = points[a.id]?.rawValue ?? '';
                    const rawB = points[b.id]?.rawValue ?? '';
                    if (!rawA && !rawB) return 0;
                    if (!rawA) return 1;
                    if (!rawB) return -1;
                    const diff = parseRawValue(rawA) - parseRawValue(rawB);
                    return mt === 'time' ? diff : -diff;
                });
                const renderTeamList = (genderTeams: typeof teams) => (
                    <div style={{ border: '1px solid rgba(240,230,204,.1)', overflow: 'hidden' }}>
                        {genderTeams.length === 0 ? (
                            <div style={{ padding: '30px', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--cream-dark)', opacity: .4 }}>Keine Teams</div>
                        ) : genderTeams.map((t, i) => (
                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid rgba(240,230,204,.07)', background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                                {(mt === 'time' || mt === 'distance') && points[t.id]?.rawValue && (
                                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: 'var(--gold)', opacity: .5, width: 20, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                                )}
                                <span style={{ flex: 1, fontSize: 15, color: 'var(--cream)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                                {mt !== 'none' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                        <span style={{ fontFamily: 'EB Garamond, serif', fontSize: 14, color: points[t.id]?.rawValue ? 'var(--cream-dark)' : 'rgba(240,230,204,.2)', background: 'rgba(240,230,204,.04)', border: '1px solid rgba(240,230,204,.1)', borderRadius: 2, padding: '6px 10px', width: 100, textAlign: 'center', boxSizing: 'border-box' as const, userSelect: 'none' as const }}>
                                            {points[t.id]?.rawValue || '—'}
                                        </span>
                                        {mt !== 'duel' && (
                                            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, color: 'var(--cream-dark)', opacity: .4 }}>
                                                {mt === 'time' ? 'min' : 'm'}
                                            </span>
                                        )}
                                    </div>
                                )}
                                <input type="text" inputMode="numeric" placeholder="Pkt"
                                    value={points[t.id]?.points ?? ''}
                                    onChange={e => setPoints(prev => ({ ...prev, [t.id]: { ...prev[t.id], points: e.target.value } }))}
                                    onBlur={() => handleSavePoint(t.id)}
                                    style={{ ...fieldStyle, width: 72, textAlign: 'center', padding: '6px 10px', fontSize: 14, flexShrink: 0 }}
                                />
                            </div>
                        ))}
                    </div>
                );
                return (
                    <div>
                        <div className="tabs-desktop" style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 24 }}>
                            {disciplines.map(d => (
                                <button key={d.id} onClick={() => setSelectedDisc(d.id)} style={{
                                    fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2,
                                    textTransform: 'uppercase', padding: '10px 20px', cursor: 'pointer',
                                    transition: 'all .2s', borderRadius: '2px 2px 0 0', borderBottom: 'none',
                                    background: selectedDisc === d.id ? 'var(--green-dark)' : 'rgba(240,230,204,.06)',
                                    color: selectedDisc === d.id ? 'var(--gold)' : 'var(--cream-dark)',
                                    border: selectedDisc === d.id ? '1px solid rgba(201,148,58,.4)' : '1px solid rgba(240,230,204,.12)',
                                }}>
                                    {d.name}
                                </button>
                            ))}
                        </div>
                        <select className="tabs-mobile" value={selectedDisc} onChange={e => setSelectedDisc(e.target.value)}
                            style={{ ...selectStyle, width: '100%', marginBottom: 24 }}>
                            {disciplines.map(d => <option key={d.id} value={d.id} style={{ background: '#0e2218' }}>{d.name}</option>)}
                        </select>
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 16 }}>
                            {(['m', 'f'] as const).map(g => (
                                <div key={g} style={{ flex: '1 1 320px', minWidth: 0 }}>
                                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: g === 'm' ? '#7aadff' : '#ff8aaa', marginBottom: 10 }}>
                                        {g === 'm' ? '♂ Männer' : '♀ Frauen'}
                                    </div>
                                    {renderTeamList(sortedFor(g))}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })()}

            {activeTab === 'tiebreaker' && (() => {
                const tieGroups = (['m', 'f'] as const).flatMap(g => {
                    const byPoints = new Map<number, string[]>();
                    for (const t of teams.filter(t => t.gender === g)) {
                        const pts = leaderboardPoints[t.id] ?? 0;
                        if (pts === 0) continue;
                        if (!byPoints.has(pts)) byPoints.set(pts, []);
                        byPoints.get(pts)!.push(t.id);
                    }
                    return [...byPoints.entries()]
                        .filter(([, ids]) => ids.length >= 2)
                        .map(([pts, ids]) => ({ gender: g, pts, key: `${g}-${pts}`, ids }));
                });

                if (tieGroups.length === 0) return (
                    <div style={{ textAlign: 'center', padding: '80px 20px', fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--cream-dark)', opacity: .25 }}>
                        Kein Gleichstand
                    </div>
                );

                return (
                    <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                        <button onClick={handleSaveTiebreaker} disabled={!tiebreakerDirty} style={{ ...btnPrimary, opacity: tiebreakerDirty ? 1 : 0.4 }}>Stechen speichern</button>
                    </div>
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        {tieGroups.map(group => {
                            const groupTeams = tiebreakerGroups[group.key]
                                ?? group.ids.map(id => teams.find(t => t.id === id)).filter((t): t is TeamDto => t != null);
                            return (
                                <div key={group.key} style={{ flex: '1 1 280px', minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
                                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: group.gender === 'm' ? '#7aadff' : '#ff8aaa' }}>
                                            {group.gender === 'm' ? '♂ Männer' : '♀ Frauen'}
                                        </span>
                                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: 'var(--gold)', opacity: .5 }}>
                                            {group.pts} Pkt Gleichstand
                                        </span>
                                    </div>
                                    <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={e => handleTiebreakerDragEnd(e, group.key)}>
                                        <SortableContext items={groupTeams.map(t => t.id)} strategy={verticalListSortingStrategy}>
                                            <div style={{ border: '1px solid rgba(201,148,58,.2)', overflow: 'hidden' }}>
                                                {groupTeams.map((team, i) => (
                                                    <SortableTiebreakerRow
                                                        key={team.id}
                                                        teamId={team.id}
                                                        teamName={team.name}
                                                        points={leaderboardPoints[team.id] ?? 0}
                                                        rank={i + 1}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            );
                        })}
                    </div>
                    </div>
                );
            })()}

            {deleteTarget && (
                <ConfirmModal
                    message={`"${deleteTarget.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
                    onConfirm={() => { deleteTarget.type === 'team' ? handleDeleteTeam(deleteTarget.id) : handleDeleteDiscipline(deleteTarget.id); setDeleteTarget(null); }}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
