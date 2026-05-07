import { createPortal } from 'react-dom';

interface Props {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({ message, onConfirm, onCancel }: Props) {
    const btnBase = {
        fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2,
        textTransform: 'uppercase' as const, padding: '10px 20px',
        borderRadius: 2, cursor: 'pointer',
    };

    return createPortal(
        <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'var(--green-dark)', border: '1px solid rgba(201,148,58,.3)', padding: 32, borderRadius: 2, width: '100%', maxWidth: 400 }}>
                <p style={{ fontFamily: 'EB Garamond, serif', fontSize: 17, color: 'var(--cream)', lineHeight: 1.6, margin: '0 0 28px' }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={onCancel} style={{ ...btnBase, border: '1px solid rgba(240,230,204,.2)', background: 'transparent', color: 'var(--cream-dark)' }}>
                        Abbrechen
                    </button>
                    <button onClick={onConfirm} style={{ ...btnBase, border: 'none', background: 'rgba(180,50,50,.8)', color: '#ffd0d0' }}>
                        Löschen
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
