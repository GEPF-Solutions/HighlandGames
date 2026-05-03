export function Footer() {
    return (
        <footer style={{
            background: 'var(--text-dark)',
            padding: '16px 40px',
            borderTop: '1px solid rgba(201,148,58,.2)',
        }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 16,
                fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 1,
                color: 'var(--cream-dark)', opacity: .5,
            }}>
                <a href="https://prowestern.at" target="_blank" rel="noopener noreferrer" style={{
                    color: 'var(--cream-dark)', textDecoration: 'none', transition: 'opacity .2s',
                }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                >
                    © 2026 Pro Western Verein
                </a>
                <a href="https://gepf.at" target="_blank" rel="noopener noreferrer" style={{
                    color: 'var(--cream-dark)', textDecoration: 'none', transition: 'opacity .2s',
                }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                >
                    Developed by GEPF
                </a>
            </div>
        </footer>
    );
}