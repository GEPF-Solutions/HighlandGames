import { useNavigate } from 'react-router-dom';
import { useLiveDisc } from '../hooks/useLiveDisc';

export function LiveBanner() {
    const navigate = useNavigate();
    const { liveDisc } = useLiveDisc();

    if (!liveDisc) return null;

    return (
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
            <button onClick={() => navigate('/disciplines/' + liveDisc.id)} style={{
                marginLeft: 'auto', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2,
                textTransform: 'uppercase', padding: '6px 16px', borderRadius: 2,
                cursor: 'pointer', background: 'transparent', color: 'var(--cream)',
                border: '1px solid rgba(240,230,204,.4)',
            }}>
                Details ansehen
            </button>
        </div>
    );
}
