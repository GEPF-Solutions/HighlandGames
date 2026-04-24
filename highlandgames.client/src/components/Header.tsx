import { MATCHES } from '../data/mockData';

interface HeaderProps {
    navigate: (page: string) => void;
    currentPage: string;
}

export function Header({ navigate, currentPage }: HeaderProps) {
    const liveMatch = MATCHES.find(m => m.status === 'live');

    const navLinks = [
        { id: 'home', label: 'Start' },
        { id: 'results', label: 'Ergebnisse' },
        { id: 'matches', label: 'Begegnungen' },
        { id: 'teams', label: 'Teams' },
        { id: 'admin', label: 'Admin' },
    ];

    return (
        <header style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 40px',
            background: 'rgba(14,34,24,.95)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(201,148,58,.3)',
        }}>
            <div onClick={() => navigate('home')} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <img src="/PWLogo.png" alt="Pro Western Logo" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 16, letterSpacing: 2, color: 'var(--cream-dark)', textTransform: 'uppercase' }}>
                    Highland Games
                </span>
            </div>

            <nav style={{ display: 'flex', gap: 28 }}>
                {navLinks.map(l => (
                    <button key={l.id} onClick={() => navigate(l.id)} style={{
                        fontFamily: 'Cinzel, serif', fontSize: 14, letterSpacing: 2,
                        textTransform: 'uppercase', background: 'none', border: 'none',
                        color: currentPage === l.id ? 'var(--gold)' : 'var(--cream-dark)',
                        cursor: 'pointer', transition: 'color .2s',
                    }}>
                        {l.label}
                    </button>
                ))}
                {liveMatch && (
                    <div onClick={() => navigate('disc-' + liveMatch.discId)} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1,
                        color: '#e07070', padding: '4px 10px',
                        border: '1px solid rgba(224,112,112,.4)', borderRadius: 2, cursor: 'pointer',
                    }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#e07070', animation: 'pulse 1.4s ease infinite', display: 'inline-block' }} />
                        LIVE
                    </div>
                )}
            </nav>
        </header>
    );
}