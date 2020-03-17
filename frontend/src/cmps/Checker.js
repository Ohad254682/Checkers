import React from 'react';

export default function Checker(props) {

    return (
        <div className={props.checker.includes('Player1 King') ? 'checker player1 king'
            : props.checker.includes('Player2 King') ? 'checker player2 king'
                : props.checker.includes('Player1') ? 'checker player1'
                    : 'checker player2'}>
        </div>
    )
}
