import { useState, useEffect } from 'react';
import type { TeamDto, Gender } from '../api/types';
import { teamsApi } from '../api/teamsApi';
import { Separator } from '../components/Separator';

export function TeamsPage() {
    const [teams, setTeams] = useState<TeamDto[]>([]);
    const [gender, setGender] = useState<Gender>('m');

    useEffect(() => {
        teamsApi.getByGender(gender).then(setTeams);
    }, [gender]);

    return (
        <div className="page-enter" style={{ padding: '60px 40px', maxWidth: 900, margin: '0 auto' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, display: 'block' }}>
                Athleten 2026
            </span>
            <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: 'var(--cream)', marginBottom: 16 }}>
                Teams
            </h2>
            <Separator />

            {/* Gender Toggle */}
            <div style={{ display: 'flex', gap: 2, marginBottom: 28 }}>
                {(['m', 'f'] as const).map(g => (
                    <button key={g} onClick={() => setGender(g)} style={{
                        flex: 1, maxWidth: 200, padding: '10px 24px', cursor: 'pointer',
                        fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
                        borderRadius: 2, transition: 'all .2s',
                        background: gender === g
                            ? g === 'm' ? 'rgba(30,80,200,.2)' : 'rgba(200,30,80,.2)'
                            : 'transparent',
                        color: gender === g
                            ? g === 'm' ? '#7aadff' : '#ff8aaa'
                            : 'var(--cream-dark)',
                        border: gender === g
                            ? g === 'm' ? '1px solid rgba(30,80,200,.4)' : '1px solid rgba(200,30,80,.4)'
                            : '1px solid rgba(240,230,204,.2)',
                    }}>
                        {g === 'm' ? '♂ Männer' : '♀ Frauen'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div style={{ border: '1px solid rgba(201,148,58,.2)', overflow: 'hidden' }}>
                {teams.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                        <thead style={{ background: 'var(--green-dark)' }}>
                            <tr>
                                <th style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', padding: '14px 18px', textAlign: 'left', borderBottom: '1px solid rgba(201,148,58,.25)' }}>#</th>
                                <th style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', padding: '14px 18px', textAlign: 'left', borderBottom: '1px solid rgba(201,148,58,.25)' }}>Team</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map((team, i) => (
                                <tr key={team.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                                    <td style={{ padding: '12px 18px', color: 'var(--cream-dark)', opacity: .5, fontFamily: 'Cinzel, serif', borderBottom: '1px solid rgba(240,230,204,.07)' }}>{i + 1}</td>
                                    <td style={{ padding: '12px 18px', color: 'var(--cream)', borderBottom: '1px solid rgba(240,230,204,.07)' }}>{team.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, color: 'var(--cream-dark)', opacity: .4, border: '1px dashed rgba(201,148,58,.2)' }}>
                        Keine Teams eingetragen
                    </div>
                )}
            </div>

            <div style={{ marginTop: 12, fontSize: 14, color: 'var(--cream-dark)', opacity: .5, textAlign: 'right', fontStyle: 'italic' }}>
                {teams.length} Teams
            </div>
        </div>
    );
}