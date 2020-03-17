import React from 'react';
import Cell from './Cell';


export default function Row(props) {

    return (
        <tr className="flex">
            {props.row.map((cell, j) =>
                <Cell rowIndex={props.rowIndex} colIndex={j} checker={cell} selectCell={props.selectCell} key={j}
                    selectedCell={props.selectedCell} isCellEmpty={props.isCellEmpty}
                     checkCapture={props.checkCapture} checkMove={props.checkMove}
                     isAbleToCapture={props.isAbleToCapture}>
                </Cell>
            )}
        </tr>
    )
}
