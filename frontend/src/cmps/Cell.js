import React from 'react';
import Checker from './Checker';

export default function Cell(props) {

    let color = (props.colIndex + props.rowIndex) % 2 === 0 ? 'white ' : 'black ';
    let isSelected = props.selectedCell && props.selectedCell.row === props.rowIndex &&
        props.selectedCell.col === props.colIndex ? ' selected-cell' : '';
    let isMarkedToMove = (props.selectedCell && props.isCellEmpty({ row: props.rowIndex, col: props.colIndex }) &&
        props.checkMove({ row: props.rowIndex, col: props.colIndex })) ? ' mark-to-move' : '';

    let isMarkedToCapture = (props.selectedCell && props.isCellEmpty({ row: props.rowIndex, col: props.colIndex }) &&
        props.checkCapture({ row: props.rowIndex, col: props.colIndex })) ? ' mark-to-capture' : '';

    let cellClasses = color + isSelected + isMarkedToCapture + ' cell flex justify-center align-center';
    
    if (!props.isAbleToCapture) {
        cellClasses += isMarkedToMove;
    }

    return (
        <td className={cellClasses}
            onClick={() => props.selectCell({ row: props.rowIndex, col: props.colIndex })}>
            {props.checker && <Checker checker={props.checker}></Checker>}
        </td >
    )
}
