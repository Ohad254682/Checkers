import React from 'react';
import Trophy from '../style/award.png';

export default function Winner(props) {

    return (
        <div>
            <img className={props.isWon? 'winner-msg make-bigger':'winner-msg'} src={Trophy}></img>
            
        </div>
    )
}
