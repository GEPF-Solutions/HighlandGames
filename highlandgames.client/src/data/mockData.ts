export type Gender = 'm' | 'f';
export type MatchStatus = 'upcoming' | 'next' | 'live' | 'done';

export interface Discipline {
    id: string;
    num: number;
    name: string;
    icon: string;
    desc: string;
}

export interface Participant {
    id: string;
    name: string;
    club: string;
}

export interface Match {
    id: number;
    discId: string;
    name: string;
    status: MatchStatus;
    time: string;
}

export const DISCIPLINES: Discipline[] = [
    { id: 'sync', num: 1, name: 'Synchronlauf', icon: '🏃', desc: 'Paarlauf in perfekter Synchronität – bewertet nach Technik und Gleichklang.' },
    { id: 'weight', num: 2, name: 'Gewichtlauf', icon: '🏋️', desc: 'Wer trägt das Gewicht am weitesten? Ausdauer und Stärke gefragt.' },
    { id: 'caber', num: 3, name: 'Baumstammwerfen', icon: '🪵', desc: 'Der Klassiker – ein Baumstamm wird auf Präzision geworfen.' },
    { id: 'rope', num: 4, name: 'Seilziehen', icon: '💪', desc: 'Team gegen Team – wer zieht wen über die Linie?' },
    { id: 'fire', num: 5, name: 'Dustlöschen', icon: '🔥', desc: 'So schnell wie möglich das Feuer löschen – Schnelligkeit entscheidet.' },
];

export const PARTICIPANTS: Record<Gender, Participant[]> = {
    m: [
        { id: 'm1', name: 'Max Mustermann', club: 'Verein A' },
        { id: 'm2', name: 'Hans Beispiel', club: 'Verein B' },
        { id: 'm3', name: 'Klaus Sportmann', club: 'Verein A' },
        { id: 'm4', name: 'Peter Stark', club: 'Verein C' },
        { id: 'm5', name: 'Anton Berg', club: 'Verein B' },
    ],
    f: [
        { id: 'f1', name: 'Anna Muster', club: 'Verein A' },
        { id: 'f2', name: 'Eva Beispiel', club: 'Verein C' },
        { id: 'f3', name: 'Lena Kraft', club: 'Verein B' },
        { id: 'f4', name: 'Maria Wald', club: 'Verein A' },
        { id: 'f5', name: 'Sophie Berg', club: 'Verein C' },
    ],
};

export const RESULTS: Record<Gender, Record<string, Record<string, number>>> = {
    m: {
        sync: { m1: 10, m2: 8, m3: 6, m4: 4, m5: 2 },
        weight: { m1: 8, m2: 10, m3: 4, m4: 6, m5: 2 },
        caber: { m1: 10, m2: 6, m3: 8, m4: 2, m5: 4 },
    },
    f: {
        sync: { f1: 10, f2: 6, f3: 8, f4: 2, f5: 4 },
        weight: { f1: 8, f2: 10, f3: 4, f4: 6, f5: 2 },
    },
};

export const MATCHES: Match[] = [
    { id: 1, discId: 'sync', name: 'Synchronlauf', status: 'done', time: '10:30' },
    { id: 2, discId: 'weight', name: 'Gewichtlauf', status: 'done', time: '11:30' },
    { id: 3, discId: 'caber', name: 'Baumstammwerfen', status: 'live', time: '13:30' },
    { id: 4, discId: 'rope', name: 'Seilziehen', status: 'next', time: '14:30' },
    { id: 5, discId: 'fire', name: 'Dustlöschen', status: 'upcoming', time: '15:30' },
];

export function getTotalPoints(gender: Gender) {
    const pts: Record<string, number> = {};
    PARTICIPANTS[gender].forEach(p => { pts[p.id] = 0; });
    Object.values(RESULTS[gender]).forEach(disc => {
        Object.entries(disc).forEach(([id, p]) => { if (pts[id] !== undefined) pts[id] += p; });
    });
    return PARTICIPANTS[gender]
        .map(p => ({ ...p, total: pts[p.id] }))
        .sort((a, b) => b.total - a.total);
}