import { useLocation, useNavigate } from 'react-router-dom';

export function Header() {
    const location = useLocation();
    const navigate = useNavigate();

    const navLinks = [
        { path: '/', label: 'Start' },
        { path: '/results', label: 'Ergebnisse' },
        { path: '/disciplines', label: 'Disziplinen' },
        { path: '/teams', label: 'Teams' },
        { path: '/admin', label: 'Admin' },
    ];

    const isActive = (path: string) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    return (
        <header style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 40px',
            background: 'rgba(14,34,24,.95)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(201,148,58,.3)',
        }}>
            <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <img src="/PWLogo.png" alt="Pro Western Logo" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 16, letterSpacing: 2, color: 'var(--cream-dark)', textTransform: 'uppercase' }}>
                    Highland Games
                </span>
            </div>

            <nav style={{ display: 'flex', gap: 28 }}>
                {navLinks.map(l => (
                    <button key={l.path} onClick={() => navigate(l.path)} style={{
                        fontFamily: 'Cinzel, serif', fontSize: 14, letterSpacing: 2,
                        textTransform: 'uppercase', background: 'none', border: 'none',
                        color: isActive(l.path) ? 'var(--gold)' : 'var(--cream-dark)',
                        cursor: 'pointer', transition: 'color .2s',
                    }}>
                        {l.label}
                    </button>
                ))}
            </nav>
        </header>
    );
}
