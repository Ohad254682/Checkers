import React, { useEffect, useRef } from 'react';

export default function Checker(props) {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;
        if (props.checker.includes('King')) {
            ref.current.classList.add('king-animate');
            const t = setTimeout(() => ref.current && ref.current.classList.remove('king-animate'), 900);
            return () => clearTimeout(t);
        }
    }, [props.checker]);

    const cls = props.checker.includes('Player1 King') ? 'checker player1 king'
        : props.checker.includes('Player2 King') ? 'checker player2 king'
            : props.checker.includes('Player1') ? 'checker player1'
                : 'checker player2';

    return (
        <div ref={ref} className={cls}></div>
    )
}
