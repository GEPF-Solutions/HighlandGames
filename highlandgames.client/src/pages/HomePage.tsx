import { DISCIPLINES, MATCHES, getTotalPoints } from '../data/mockData';
import { Separator } from '../components/Separator';

interface HomePageProps {
    navigate: (page: string) => void;
}

export function HomePage({ navigate }: HomePageProps) {
    const liveMatch = MATCHES.find(m => m.status === 'live');
    const nextMatch = MATCHES.find(m => m.status === 'next');
    const mLead = getTotalPoints('m')[0];
    const fLead = getTotalPoints('f')[0];

    return (
        <div className="page-enter">

            {/* Hero */}
            <section className="tartan" style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '120px 40px 80px',
                position: 'relative', overflow: 'hidden',
            }}>
                {[600, 820, 1040].map((s, i) => (
                    <div key={i} style={{
                        position: 'absolute', top: '50%', left: '50%',
                        width: s, height: s, borderRadius: '50%',
                        border: '1px solid rgba(201,148,58,.10)',
                        transform: 'translate(-50%,-50%)',
                        animation: `slowRot ${40 + i * 20}s linear infinite ${i % 2 ? 'reverse' : ''}`,
                    }} />
                ))}

                <div style={{ position: 'relative', zIndex: 2 }}>
                    <p style={{
                        fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5,
                        textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20,
                    }}>
                        Pro Western Verein präsentiert
                    </p>
                    <h1 style={{
                        fontFamily: 'Cinzel Decorative, serif',
                        fontSize: 'clamp(40px, 8vw, 90px)',
                        fontWeight: 900, lineHeight: 1.05,
                        textShadow: '0 4px 40px rgba(0,0,0,.6)',
                    }}>
                        Highland<br />
                        <em style={{ fontStyle: 'normal', color: 'var(--gold)' }}>Games</em><br />
                        <span style={{ fontSize: '0.55em', opacity: .85 }}>2026</span>
                    </h1>

                    <div style={{
                        margin: '24px auto', width: 200, height: 2,
                        background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
                        position: 'relative',
                    }}>
                        <span style={{ position: 'absolute', left: -18, top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)' }}>⚜</span>
                        <span style={{ position: 'absolute', right: -18, top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)' }}>⚜</span>
                    </div>

                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: 15, letterSpacing: 3, color: 'var(--cream-dark)', marginBottom: 6 }}>
                        Samstag, 13. Juni 2026
                    </p>
                    <p style={{ fontFamily: 'EB Garamond, serif', fontSize: 17, fontStyle: 'italic', color: 'var(--cream-dark)', opacity: .8, marginBottom: 36 }}>
                        Rheinauweg 63b · Höchst, Vorarlberg
                    </p>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('results')} style={{
                            fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2,
                            textTransform: 'uppercase', padding: '12px 28px', borderRadius: 2,
                            cursor: 'pointer', border: 'none',
                            background: 'var(--gold)', color: 'var(--green-dark)',
                            boxShadow: '0 4px 16px rgba(201,148,58,.3)', transition: 'all .2s',
                        }}>
                            Zu den Ergebnissen
                        </button>
                        <button onClick={() => navigate('matches')} style={{
                            fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2,
                            textTransform: 'uppercase', padding: '12px 28px', borderRadius: 2,
                            cursor: 'pointer', background: 'transparent', color: 'var(--cream)',
                            border: '1px solid rgba(240,230,204,.4)', transition: 'all .2s',
                        }}>
                            Begegnungsplan
                        </button>
                    </div>
                </div>
            </section>

            {/* Live Banner */}
            {liveMatch && (
                <div style={{
                    background: 'rgba(122,28,28,.55)',
                    borderTop: '1px solid rgba(200,60,60,.3)',
                    borderBottom: '1px solid rgba(200,60,60,.3)',
                    padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: '#e07070' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#e07070', animation: 'pulse 1.4s ease infinite', display: 'inline-block' }} />
                        LIVE
                    </span>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: 'var(--cream)' }}>
                        Spiel {liveMatch.id}: {liveMatch.name}
                    </span>
                    <button onClick={() => navigate('disc-' + liveMatch.discId)} style={{
                        marginLeft: 'auto', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2,
                        textTransform: 'uppercase', padding: '8px 18px', borderRadius: 2,
                        cursor: 'pointer', background: 'transparent', color: 'var(--cream)',
                        border: '1px solid rgba(240,230,204,.4)', transition: 'all .2s',
                    }}>
                        Details ansehen
                    </button>
                </div>
            )}

            {/* Score Cards */}
            <section style={{ background: 'var(--navy)', padding: '80px 40px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, display: 'block' }}>
                            Aktueller Stand
                        </span>
                        <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: 'var(--cream)', marginBottom: 16 }}>
                            Führungen
                        </h2>
                        <Separator />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                        {([
                            { label: 'Männer – Führung', lead: mLead, color: '#7aadff', page: 'results' },
                            { label: 'Frauen – Führung', lead: fLead, color: '#ff8aaa', page: 'results' },
                        ] as const).map(({ label, lead, color, page }) => (
                            <div key={label} onClick={() => navigate(page)} style={{
                                background: 'var(--green-dark)', border: '1px solid rgba(201,148,58,.15)',
                                padding: 28, cursor: 'pointer', transition: 'border-color .25s, transform .2s',
                                borderRadius: 2,
                            }}>
                                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color, marginBottom: 8, textTransform: 'uppercase' }}>{label}</div>
                                <div style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 22, color: 'var(--cream)', marginBottom: 4 }}>🥇 {lead.name}</div>
                                <div style={{ fontSize: 16, color: 'var(--cream-dark)', opacity: .8 }}>{lead.total} Punkte · {lead.club}</div>
                                <div style={{ marginTop: 16, fontSize: 13, color, opacity: .7, fontFamily: 'Cinzel, serif', letterSpacing: 1 }}>Vollständige Wertung →</div>
                            </div>
                        ))}

                        <div onClick={() => navigate('matches')} style={{
                            background: 'var(--green-dark)', border: '1px solid rgba(201,148,58,.15)',
                            padding: 28, cursor: 'pointer', transition: 'border-color .25s, transform .2s',
                            borderRadius: 2,
                        }}>
                            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: 'var(--gold)', marginBottom: 8, textTransform: 'uppercase' }}>Nächstes Spiel</div>
                            {nextMatch && <>
                                <div style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 20, color: 'var(--cream)', marginBottom: 4 }}>▶ Spiel {nextMatch.id}</div>
                                <div style={{ fontSize: 16, color: 'var(--cream-dark)', opacity: .8 }}>{nextMatch.name} · {nextMatch.time} Uhr</div>
                            </>}
                            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--gold)', opacity: .7, fontFamily: 'Cinzel, serif', letterSpacing: 1 }}>Alle Begegnungen →</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Discipline Grid */}
            <section style={{ padding: '80px 40px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, display: 'block' }}>
                            Die Wettkämpfe
                        </span>
                        <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: 'var(--cream)', marginBottom: 16 }}>
                            5 Disziplinen
                        </h2>
                        <Separator />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                        {DISCIPLINES.map(d => (
                            <div key={d.id} onClick={() => navigate('disc-' + d.id)} style={{
                                background: 'var(--green-dark)', border: '1px solid rgba(201,148,58,.15)',
                                padding: '28px 22px', cursor: 'pointer',
                                transition: 'border-color .25s, transform .2s', borderRadius: 2,
                            }}>
                                <div style={{ fontSize: 32, marginBottom: 12 }}>{d.icon}</div>
                                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: 'var(--gold)', marginBottom: 4 }}>Spiel {d.num}</div>
                                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 700, color: 'var(--cream)', marginBottom: 8 }}>{d.name}</div>
                                <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--cream-dark)', opacity: .7 }}>{d.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}