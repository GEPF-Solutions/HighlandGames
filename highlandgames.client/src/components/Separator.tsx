export function Separator() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '0 auto 48px', maxWidth: 360 }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold))' }} />
            <div style={{ color: 'var(--gold)', fontSize: 16 }}>⚜</div>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, var(--gold))' }} />
        </div>
    );
}