import { useHomePage } from '../hooks/useHomePage';

interface HomePageProps {
    navigate: (page: string) => void;
}

export function HomePage({ navigate }: HomePageProps) {
    const { liveDisc } = useHomePage();

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

            {/* Live Banner */}
            {liveDisc && (
                <div style={{
                    background: 'rgba(122,28,28,.55)',
                    borderTop: '1px solid rgba(200,60,60,.3)',
                    borderBottom: '1px solid rgba(200,60,60,.3)',
                    padding: '10px 40px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: '#e07070' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#e07070', animation: 'pulse 1.4s ease infinite', display: 'inline-block' }} />
                        LIVE
                    </span>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: 'var(--cream)' }}>
                        Spiel {liveDisc.number}: {liveDisc.name}
                    </span>
                    <button onClick={() => navigate('disc-' + liveDisc.id)} style={{
                        marginLeft: 'auto', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2,
                        textTransform: 'uppercase', padding: '6px 16px', borderRadius: 2,
                        cursor: 'pointer', background: 'transparent', color: 'var(--cream)',
                        border: '1px solid rgba(240,230,204,.4)',
                    }}>
                        Details ansehen
                    </button>
                </div>
            )}

            {/* Hero */}
            <section className="tartan" style={{
                flex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '40px',
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
                        fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 5,
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
                    <p style={{ fontFamily: 'EB Garamond, serif', fontSize: 19, fontStyle: 'italic', color: 'var(--cream-dark)', opacity: .8, marginBottom: 36 }}>
                        Rheinauweg 63b · Höchst, Vorarlberg
                    </p>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('results')} style={{
                            fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2,
                            textTransform: 'uppercase', padding: '14px 32px', borderRadius: 2,
                            cursor: 'pointer', border: 'none',
                            background: 'var(--gold)', color: 'var(--green-dark)',
                            boxShadow: '0 4px 16px rgba(201,148,58,.3)',
                        }}>
                            Zu den Ergebnissen
                        </button>
                        <button onClick={() => navigate('matches')} style={{
                            fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2,
                            textTransform: 'uppercase', padding: '14px 32px', borderRadius: 2,
                            cursor: 'pointer', background: 'transparent', color: 'var(--cream)',
                            border: '1px solid rgba(240,230,204,.4)',
                        }}>
                            Begegnungsplan
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}