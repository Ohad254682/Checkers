import React from 'react';

export default function Checker(props) {

    return (
        <div className="flex msg">It is {props.turn} turn <div className={props.turn === 'Player1' ? 'turn-checker player1' : 'turn-checker player2'}>
        </div>
            {!props.player && <div>
                <button className="choose-player1" onClick={() => props.choosePlayer('Player1')}>Player 1</button>
                <button className="choose-player2" onClick={() => props.choosePlayer('Player2')}>Player 2</button>
            </div>}
        </div>
    )
}
