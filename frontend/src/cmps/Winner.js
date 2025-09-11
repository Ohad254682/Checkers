import React, { useMemo } from 'react';

export default function Winner(props) {
    const confetti = useMemo(() => {
        const colors = ['#f43f5e', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7'];
        const pieces = Array.from({ length: 90 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 0.8,
            duration: 2.2 + Math.random() * 1.8,
            color: colors[i % colors.length]
        }));
        return pieces;
    }, []);

    const winnerLabel = props.winner === 'Player1' ? 'Blue wins!' : props.winner === 'Player2' ? 'Green wins!' : 'Winner!';

    return (
        <div>
            {props.isWon && (
                <>
                    <div className="winner-overlay">
                        <div className="winner-banner">
                            {winnerLabel}
                        </div>
                    </div>
                    <div className="confetti-container">
                        {confetti.map(p => (
                            <div
                                key={p.id}
                                className="confetti-piece"
                                style={{
                                    left: p.left + '%',
                                    background: p.color,
                                    animationDelay: p.delay + 's',
                                    animationDuration: p.duration + 's'
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
