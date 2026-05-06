import { useNavigate } from 'react-router-dom';
import { useMatchesPage } from '../hooks/useMatchesPage';
import { Separator } from '../components/Separator';

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

const accentColor: Record<string, string> = {
    live: '#e07070',
    next: '#c9943a',
    done: '#7dc49e',
    upcoming: 'rgba(240,230,204,.15)',
};


export function MatchesPage() {
    const navigate = useNavigate();
    const { disciplines } = useMatchesPage();

    return (
        <div className="page-enter page-content" style={{ padding: '60px 40px', width: '100%', maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, display: 'block' }}>
                Spielplan
            </span>
            <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: 'var(--cream)', marginBottom: 16 }}>
                Disziplinen
            </h2>
            <Separator />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(480px, 100%), 1fr))', gap: 16 }}>
                {disciplines.map(d => {
                    const st = statusStyle[d.status] ?? statusStyle.upcoming;

                    return (
                        <div
                            key={d.id}
                            onClick={() => navigate('/disciplines/' + d.id)}
                            style={{ border: '1px solid rgba(201,148,58,.2)', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'border-color .15s', overflow: 'hidden' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,148,58,.55)'; e.currentTarget.style.background = 'rgba(201,148,58,.04)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,148,58,.2)'; e.currentTarget.style.background = 'transparent'; }}
                        >
                            {/* Status accent strip */}
                            <div style={{ height: 3, background: accentColor[d.status] ?? accentColor.upcoming, flexShrink: 0 }} />

                            {/* Card header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px' }}>
                                {d.icon?.startsWith('/') ? (
                                    <img src={d.icon} alt={d.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />
                                ) : d.icon ? (
                                    <span style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{d.icon}</span>
                                ) : null}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: 'var(--gold)', opacity: .7, marginBottom: 4 }}>
                                        {String(d.number).padStart(2, '0')}
                                    </div>
                                    <div style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 16, color: 'var(--cream)' }}>
                                        {d.name}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                    {d.status === 'live' && (
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e07070', animation: 'pulse 1.4s ease infinite', display: 'inline-block' }} />
                                    )}
                                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, padding: '3px 10px', borderRadius: 2, textTransform: 'uppercase', ...st }}>
                                        {statusLabel[d.status] ?? 'Geplant'}
                                    </span>
                                </div>
                            </div>


                        </div>
                    );
                })}
            </div>
        </div>
    );
}
