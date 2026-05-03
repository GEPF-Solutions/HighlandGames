import { useState, useEffect } from 'react';
import type { TeamDto } from '../api/types';
import { teamsApi } from '../api/teamsApi';
import { Separator } from '../components/Separator';

const thStyle: React.CSSProperties = {
    fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2,
    textTransform: 'uppercase', color: 'var(--gold)',
    padding: '14px 18px', textAlign: 'left',
    borderBottom: '1px solid rgba(201,148,58,.25)',
};

const tdStyle: React.CSSProperties = {
    padding: '12px 18px',
    borderBottom: '1px solid rgba(240,230,204,.07)',
};

function TeamTable({ teams }: { teams: TeamDto[] }) {
    if (teams.length === 0) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, color: 'var(--cream-dark)', opacity: .4 }}>
                Keine Teams eingetragen
            </div>
        );
    }
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead style={{ background: 'var(--green-dark)' }}>
                <tr>
                    <th style={{ ...thStyle, width: 48 }}>#</th>
                    <th style={thStyle}>Team</th>
                </tr>
            </thead>
            <tbody>
                {teams.map((team, i) => (
                    <tr key={team.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.03)' }}>
                        <td style={{ ...tdStyle, color: 'var(--cream-dark)', opacity: .5, fontFamily: 'Cinzel, serif' }}>{i + 1}</td>
                        <td style={{ ...tdStyle, color: 'var(--cream)' }}>{team.name}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function TeamsPage() {
    const [mTeams, setMTeams] = useState<TeamDto[]>([]);
    const [fTeams, setFTeams] = useState<TeamDto[]>([]);

    useEffect(() => {
        teamsApi.getByGender('m').then(setMTeams);
        teamsApi.getByGender('f').then(setFTeams);
    }, []);

    return (
        <div className="page-enter page-content" style={{ padding: '60px 40px', width: '100%', maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, display: 'block' }}>
                Athleten
            </span>
            <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: 'var(--cream)', marginBottom: 16 }}>
                Teams
            </h2>
            <Separator />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                {[{ label: '♂ Männer', color: '#7aadff', teams: mTeams }, { label: '♀ Frauen', color: '#ff8aaa', teams: fTeams }].map(({ label, color, teams }) => (
                    <div key={label} style={{ flex: '1 1 300px', minWidth: 0 }}>
                        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color, marginBottom: 12 }}>
                            {label}
                        </div>
                        <div style={{ border: '1px solid rgba(201,148,58,.2)', overflow: 'hidden' }}>
                            <TeamTable teams={teams} />
                        </div>
                        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--cream-dark)', opacity: .4, textAlign: 'right', fontStyle: 'italic' }}>
                            {teams.length} Teams
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
