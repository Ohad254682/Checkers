import React from 'react';

export default function Checker(props) {

    return (
        <div className="flex msg">
            {!props.player ? (
                <>
                    <span>Choose a color</span>
                    <div>
                        <button className="choose-player1" onClick={() => props.choosePlayer('Player1')}>Blue</button>
                        <button className="choose-player2" onClick={() => props.choosePlayer('Player2')}>Green</button>
                    </div>
                </>
            ) : (
                <>
                    {props.turn === props.player ? 'It is your turn' : "It is the opponent's turn"}
                    <div className={props.turn === 'Player1' ? 'turn-checker player1' : 'turn-checker player2'}></div>
                    {props.isAbleToCapture && (
                        <div className="must-capture">
                            {props.turn === props.player ? 'You must capture' : 'Opponent must capture'}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
