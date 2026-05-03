import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLiveDisc } from '../hooks/useLiveDisc';

const navLinks = [
    { path: '/', label: 'Start' },
    { path: '/results', label: 'Ergebnisse' },
    { path: '/disciplines', label: 'Disziplinen' },
    { path: '/teams', label: 'Teams' },
    { path: '/admin', label: 'Admin' },
];

export function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { liveDisc, nextDisc } = useLiveDisc();
    const [menuOpen, setMenuOpen] = useState(false);

    const isActive = (path: string) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    const go = (path: string) => { navigate(path); setMenuOpen(false); };

    const disc = liveDisc ?? nextDisc;
    const isLive = !!liveDisc;

    return (
        <>
            <header className="site-header" style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 40px',
                background: 'rgba(14,34,24,.95)',
                backdropFilter: 'blur(8px)',
                borderBottom: '1px solid rgba(201,148,58,.3)',
                gap: 24,
            }}>
                {/* Logo + title */}
                <div onClick={() => go('/')} style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', flexShrink: 0 }}>
                    <img src="/PWLogo.png" alt="Pro Western Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                    <div>
                        <div className="header-subtitle" style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 4, color: 'var(--gold)', textTransform: 'uppercase', opacity: .8, lineHeight: 1, marginBottom: 3 }}>
                            Pro Western Verein
                        </div>
                        <div className="header-title" style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 14, color: 'var(--cream)', lineHeight: 1 }}>
                            Highland Games
                        </div>
                    </div>
                </div>

                {/* Desktop nav */}
                <nav className="header-nav-desktop" style={{ display: 'flex', gap: 24, flex: 1, justifyContent: 'center' }}>
                    {navLinks.map(l => (
                        <button key={l.path} onClick={() => go(l.path)} style={{
                            fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 2,
                            textTransform: 'uppercase', background: 'none', border: 'none',
                            color: isActive(l.path) ? 'var(--gold)' : 'var(--cream-dark)',
                            cursor: 'pointer', transition: 'color .2s', whiteSpace: 'nowrap',
                        }}>
                            {l.label}
                        </button>
                    ))}
                </nav>

                {/* Right side: live/next badge + hamburger */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <div
                        onClick={() => disc && go('/disciplines/' + disc.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            cursor: disc ? 'pointer' : 'default',
                            visibility: disc ? 'visible' : 'hidden',
                            background: isLive ? 'rgba(122,28,28,.55)' : 'rgba(201,148,58,.1)',
                            border: isLive ? '1px solid rgba(200,60,60,.4)' : '1px solid rgba(201,148,58,.3)',
                            padding: '7px 14px', borderRadius: 2,
                        }}
                    >
                        {isLive && (
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#e07070', animation: 'pulse 1.4s ease infinite', display: 'inline-block', flexShrink: 0 }} />
                        )}
                        <span className="header-badge-label" style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: isLive ? '#e07070' : 'var(--gold)', whiteSpace: 'nowrap' }}>
                            {isLive ? 'Live' : 'Als nächstes'}
                        </span>
                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--cream)', whiteSpace: 'nowrap' }}>
                            {disc?.icon} <span className="header-disc-name">{disc?.name}</span>
                        </span>
                    </div>

                    {/* Hamburger — mobile only */}
                    <button
                        className="header-hamburger"
                        onClick={() => setMenuOpen(o => !o)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            display: 'none', flexDirection: 'column', gap: 5, padding: 4,
                        }}
                        aria-label="Menu"
                    >
                        {[0, 1, 2].map(i => (
                            <span key={i} style={{ display: 'block', width: 22, height: 2, background: 'var(--cream-dark)', borderRadius: 1 }} />
                        ))}
                    </button>
                </div>
            </header>

            {/* Mobile nav dropdown */}
            {menuOpen && (
                <div
                    className="header-mobile-menu"
                    style={{
                        position: 'fixed', top: 65, left: 0, right: 0, zIndex: 199,
                        background: 'rgba(14,34,24,.98)',
                        borderBottom: '1px solid rgba(201,148,58,.3)',
                        display: 'none', flexDirection: 'column',
                    }}
                >
                    {navLinks.map(l => (
                        <button key={l.path} onClick={() => go(l.path)} style={{
                            fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2,
                            textTransform: 'uppercase', background: 'none',
                            border: 'none', borderBottom: '1px solid rgba(240,230,204,.06)',
                            color: isActive(l.path) ? 'var(--gold)' : 'var(--cream-dark)',
                            cursor: 'pointer', padding: '16px 40px', textAlign: 'left',
                        }}>
                            {l.label}
                        </button>
                    ))}
                </div>
            )}
        </>
    );
}
