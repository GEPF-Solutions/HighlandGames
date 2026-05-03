import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DisciplineDto } from '../api/types';
import { disciplinesApi } from '../api/disciplinesApi';
import { Separator } from '../components/Separator';

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

export function MatchesPage() {
    const navigate = useNavigate();
    const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);

    useEffect(() => {
        disciplinesApi.getAll().then(setDisciplines);
    }, []);

    return (
        <div className="page-enter" style={{ padding: '60px 40px', maxWidth: 900, margin: '0 auto' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, display: 'block' }}>
                Spielplan
            </span>
            <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: 'var(--cream)', marginBottom: 16 }}>
                Begegnungen
            </h2>
            <Separator />

            <div style={{ border: '1px solid rgba(201,148,58,.2)', overflow: 'hidden' }}>
                {disciplines.map(d => {
                    const style = statusStyle[d.status] ?? statusStyle.upcoming;
                    return (
                        <div key={d.id} onClick={() => navigate('/discipline/' + d.id)} style={{
                            display: 'flex', alignItems: 'center', gap: 16,
                            padding: '16px 20px', borderBottom: '1px solid rgba(240,230,204,.07)',
                            cursor: 'pointer', transition: 'background .15s',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,148,58,.06)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: 'var(--gold)', minWidth: 20, opacity: .7 }}>{d.number}</div>
                            <div style={{ fontSize: 22 }}>{d.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: 'var(--cream)', marginBottom: 3 }}>{d.name}</div>
                                {d.description && (
                                    <div style={{ fontSize: 14, color: 'var(--cream-dark)', opacity: .7, fontStyle: 'italic' }}>{d.description}</div>
                                )}
                            </div>
                            {d.status === 'live' && (
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#e07070', animation: 'pulse 1.4s ease infinite', display: 'inline-block', marginRight: 4 }} />
                            )}
                            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, padding: '3px 10px', borderRadius: 2, textTransform: 'uppercase', ...style }}>
                                {statusLabel[d.status] ?? 'Geplant'}
                            </span>
                            <span style={{ color: 'var(--gold)', opacity: .5 }}>›</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}