import { useState, useEffect, useRef } from 'react';
import type { LeaderboardEntryDto } from '../api/types';
import confetti from 'canvas-confetti';
import { useHomePage } from '../hooks/useHomePage';
import { Footer } from '../components/Footer';

const isTied = (_entries: LeaderboardEntryDto[], entry: LeaderboardEntryDto) =>
    entry.tiebreakerApplied === true;

const rankMedal = (i: number) => String(i + 1);

const rankColor = (i: number) =>
    i === 0 ? '#f0c040' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--cream-dark)';

function useShimmer(leaderboard: LeaderboardEntryDto[]) {
    const [shimmerIds, setShimmerIds] = useState<Set<string>>(new Set());
    const prev = useRef<LeaderboardEntryDto[]>([]);

    useEffect(() => {
        if (prev.current.length === 0) {
            prev.current = leaderboard;
            return;
        }
        const changed = new Set<string>();
        leaderboard.forEach((entry, i) => {
            const oldIdx = prev.current.findIndex(e => e.teamId === entry.teamId);
            if (oldIdx !== i || prev.current[oldIdx]?.totalPoints !== entry.totalPoints)
                changed.add(entry.teamId);
        });
        if (changed.size > 0) {
            setShimmerIds(changed);
            setTimeout(() => setShimmerIds(new Set()), 1100);
        }
        prev.current = leaderboard;
    }, [leaderboard]);

    return shimmerIds;
}

function AnimatedScore({ value, color }: { value: number; color: string }) {
    const [display, setDisplay] = useState(value);
    const prevValue = useRef(value);
    const raf = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (prevValue.current === value) return;
        const from = prevValue.current;
        const to = value;
        prevValue.current = value;

        const duration = 900;
        const start = performance.now();

        const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(Math.round(from + (to - from) * eased));
            if (t < 1) raf.current = requestAnimationFrame(tick);
        };

        if (raf.current) cancelAnimationFrame(raf.current);
        raf.current = requestAnimationFrame(tick);
        return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    }, [value]);

    return (
        <span style={{
            fontFamily: 'Cinzel, serif', fontSize: 26, fontWeight: 700,
            color, flexShrink: 0, display: 'inline-block', minWidth: 50, textAlign: 'right',
        }}>
            {display}
        </span>
    );
}

interface ColumnProps {
    label: string;
    accentColor: string;
    entries: LeaderboardEntryDto[];
    shimmerIds: Set<string>;
}

function LeaderboardColumn({ label, accentColor, entries, shimmerIds }: ColumnProps) {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0 38px' }}>
            <div style={{
                fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 5,
                textTransform: 'uppercase', color: accentColor,
                paddingBottom: 12,
                borderBottom: `2px solid ${accentColor}`,
            }}>
                {label}
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {entries.length === 0 ? (
                    <div style={{
                        padding: '60px 0', textAlign: 'center',
                        fontFamily: 'Cinzel, serif', fontSize: 15, letterSpacing: 3,
                        color: 'var(--cream-dark)', opacity: .25,
                    }}>
                        Noch keine Ergebnisse
                    </div>
                ) : entries.map((entry, i) => (
                    <div key={entry.teamId} style={{
                        position: 'relative', overflow: 'hidden',
                        display: 'flex', alignItems: 'center',
                        padding: '13px 22px',
                        borderBottom: '1px solid rgba(240,230,204,.06)',
                        background: i % 2 === 0 ? 'transparent' : 'rgba(240,230,204,.025)',
                    }}>
                        {shimmerIds.has(entry.teamId) && (
                            <div style={{
                                position: 'absolute', top: 0, bottom: 0, left: 0,
                                width: '40%',
                                background: 'linear-gradient(90deg, transparent, rgba(201,148,58,.35) 50%, transparent)',
                                animation: 'shimmerSlide 1s ease-in-out forwards',
                                pointerEvents: 'none',
                            }} />
                        )}

                        <span style={{
                            position: 'relative',
                            width: 50, fontFamily: 'Cinzel, serif',
                            fontSize: 21, color: rankColor(i),
                            flexShrink: 0,
                        }}>
                            {rankMedal(i)}
                        </span>
                        <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
                            <span style={{
                                fontFamily: 'Cinzel, serif', fontSize: 22, color: 'var(--cream)',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block',
                            }}>
                                {entry.teamName}
                                {isTied(entries, entry) && <sup style={{ color: 'var(--gold)', fontSize: 15, marginLeft: 4 }}>*</sup>}
                            </span>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <AnimatedScore value={entry.totalPoints} color={accentColor} />
                        </div>
                    </div>
                ))}
            </div>
            {entries.some(e => isTied(entries, e)) && (
                <div style={{ padding: '8px 22px', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1.5, color: 'var(--cream-dark)', opacity: .35 }}>
                    * Reihung durch Stechen bestimmt
                </div>
            )}
        </div>
    );
}

function useAllDoneConfetti(disciplines: { status: string }[]) {
    const fired = useRef(false);

    useEffect(() => {
        if (fired.current || disciplines.length === 0) return;
        if (!disciplines.every(d => d.status === 'done')) return;

        fired.current = true;

        const colors = ['#c9943a', '#e8b85a', '#f0e6cc', '#2d6b47', '#7dc49e'];

        const end = Date.now() + 30000;
        let tick = 0;
        const frame = () => {
            tick++;
            if (tick % 5 === 0) {
                confetti({
                    particleCount: 1,
                    startVelocity: 6,
                    spread: 360,
                    origin: { x: Math.random(), y: 0 },
                    colors,
                    ticks: 1400,
                    gravity: 0.35,
                    scalar: 1.1,
                    drift: (Math.random() - 0.5) * 0.3,
                });
            }
            if (Date.now() < end) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    }, [disciplines]);
}

export function TvPage() {
    const { mLeaderboard, fLeaderboard, liveDisc, nextDisc, disciplines } = useHomePage();
    const mShimmer = useShimmer(mLeaderboard);
    const fShimmer = useShimmer(fLeaderboard);
    useAllDoneConfetti(disciplines);

    return (
        <div style={{
            width: '100vw', height: '100vh',
            display: 'flex', flexDirection: 'column',
            background: 'var(--green-dark)', overflow: 'hidden',
        }}>
            {/* Top bar */}
            <div style={{
                display: 'flex', alignItems: 'center',
                padding: '12px 40px', flexShrink: 0,
                borderBottom: '1px solid rgba(201,148,58,.3)',
                background: 'rgba(0,0,0,.2)',
            }}>
                <img src="/PWLogo.png" alt="" style={{ width: 44, height: 44, objectFit: 'contain', marginRight: 16 }} />
                <div>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 2 }}>
                        Pro Western Verein
                    </div>
                    <div style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 22, color: 'var(--cream)', lineHeight: 1 }}>
                        Highland Games 2026
                    </div>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
                    {liveDisc && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'rgba(122,28,28,.55)',
                            border: '1px solid rgba(200,60,60,.4)',
                            padding: '8px 20px', borderRadius: 2,
                        }}>
                            <span style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: '#e07070', animation: 'pulse 1.4s ease infinite',
                                display: 'inline-block', flexShrink: 0,
                            }} />
                            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: '#e07070', textTransform: 'uppercase' }}>Live</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Cinzel, serif', fontSize: 17, color: 'var(--cream)', marginLeft: 4 }}>
                                {liveDisc.icon?.startsWith('/') ? (
                                    <img src={liveDisc.icon} alt="" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
                                ) : liveDisc.icon ? liveDisc.icon : null}
                                {liveDisc.name}
                            </span>
                        </div>
                    )}
                    {nextDisc && !liveDisc && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'rgba(201,148,58,.1)',
                            border: '1px solid rgba(201,148,58,.3)',
                            padding: '8px 20px', borderRadius: 2,
                        }}>
                            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase' }}>Als nächstes</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Cinzel, serif', fontSize: 17, color: 'var(--cream)', marginLeft: 4 }}>
                                {nextDisc.icon?.startsWith('/') ? (
                                    <img src={nextDisc.icon} alt="" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
                                ) : nextDisc.icon ? nextDisc.icon : null}
                                {nextDisc.name}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Leaderboards */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', paddingTop: 20, paddingBottom: 12 }}>
                <LeaderboardColumn
                    label="♂ Männer"
                    accentColor="#7aadff"
                    entries={mLeaderboard}
                    shimmerIds={mShimmer}
                />
                <div style={{ width: 1, background: 'rgba(201,148,58,.15)', flexShrink: 0 }} />
                <LeaderboardColumn
                    label="♀ Frauen"
                    accentColor="#ff8aaa"
                    entries={fLeaderboard}
                    shimmerIds={fShimmer}
                />
            </div>

            <Footer />
        </div>
    );
}
