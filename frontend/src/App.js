import React, { Component } from 'react';
import Row from './cmps/Row'
import Message from './cmps/Message'
import './App.css';
import Winner from './cmps/Winner';
import SocketService from '../src/services/SocketService';


export default class App extends Component {

  state = {
    size: 8,
    board: [],
    selectedCell: null,
    isAbleToCapture: false,
    turn: 'Player1',
    undoBoardStates: [],
    numOfTurnIndex: 0,
    isMultipleCapture: false,
    isWon: false,
    player: null
  }

  componentDidMount() {
    this.createBoard();
    SocketService.setup();
    SocketService.on('setBoard', this.updateBoard)
    SocketService.on('setWon', this.updateWon)
    SocketService.on('setRestartGame', this.updateRestart)
    SocketService.on('setMultipleCapture', this.updateWithoutSwitchTurn);
    SocketService.on('setKing', this.updateWithoutSwitchTurn);
    SocketService.on('setPlayer', this.setPlayer);
  }

  setPlayer = (player) => {
    this.setState({ player })
  }

  updateRestart = () => {
    this.createBoard();
    this.setState({ turn: 'Player1' },
      this.setState({ selectedCell: null },
        this.setState({ isAbleToCapture: false },
          this.setState({ isWon: false }))))
  }
  updateWon = () => {
    this.setState({ isWon: true })
  }

  updateWithoutSwitchTurn = (board) => {
    this.setState({ board })
  }

  updateBoard = (board) => {
    this.setState({ board }, () => {
      this.setState({ isAbleToCapture: false },
        this.switchTurn)
    })
  }

  createBoard = () => {
    let board = [];
    for (let i = 0; i < this.state.size; i++) {
      board[i] = [];
      for (let j = 0; j < this.state.size; j++) {
        if (i >= 0 && i <= 2 && (i + j) % 2 !== 0) {
          board[i][j] = 'Player1'
        }
        else if (i >= 5 && i <= 7 && (i + j) % 2 !== 0) {
          board[i][j] = 'Player2'
        }
        else {
          board[i][j] = '';
        }
      }
    }
    this.setState({ board })
  }

  selectCell = (selectedCell) => {

    selectedCell.checker = this.state.board[selectedCell.row][selectedCell.col];
    if (this.isCellEmpty(selectedCell)) {
      if (this.state.selectedCell) {
        this.moveTo(selectedCell);
      }
      else
        return;
    }
    else if (!selectedCell.checker.includes(this.state.turn) || !selectedCell.checker.includes(this.state.player)) {
      return;
    }
    else {
      if (!this.state.isMultipleCapture) {
        this.setState({ selectedCell })
      }
    }
  }

  isCellEmpty = (cell) => {
    return !this.state.board[cell.row][cell.col];
  }

  cellValue = (cell) => {
    return this.state.board[cell.row][cell.col];
  }

  setAbleToCapture = () => {
    this.setState({ isAbleToCapture: true })
  }

  moveTo = (cell) => {
    if (!this.state.isAbleToCapture && this.checkMove(cell)) {
      let undoBoardStates = this.state.undoBoardStates;
      let copyOfBoard = this.state.board.map((row) => {
        return row.slice();
      });
      undoBoardStates.push(copyOfBoard);
      this.setState({ undoBoardStates }, this.moveChecker(cell));
    }
    else if (this.checkCapture(cell)) {
      let undoBoardStates = this.state.undoBoardStates;
      let copyOfBoard = this.state.board.map((row) => {
        return row.slice();
      });
      undoBoardStates.push(copyOfBoard);
      this.setState({ undoBoardStates }, this.captureChecker(cell));
    }
    else {
      return;
    }
  }

  isKing = (cell) => {
    let board = this.state.board;
    if ((board[cell.row][cell.col].includes('Player1') && cell.row === this.state.size - 1) ||
      (board[cell.row][cell.col].includes('Player2') && cell.row === 0)) {
      board[cell.row][cell.col] += ' King';
      SocketService.emit('sendKing', board);
      this.setState({ board })
    }
  }

  finishMove = (cell) => {
    if (!this.state.isMultipleCapture) {
      this.setState({ selectedCell: null },
        this.setState({ isAbleToCapture: false },
          this.setState({ numOfTurnIndex: ++this.state.numOfTurnIndex },
            this.switchTurn())));
    }
    else {
      this.setState({ selectedCell: cell },
        this.setState({ numOfTurnIndex: ++this.state.numOfTurnIndex }))
    }
    this.isKing(cell);
    if (this.isGameWon()) {
      this.setState({ isWon: true })
      SocketService.emit('sendWon')
    }
  }

  switchTurn = () => {
    if (this.state.turn === 'Player1') {
      this.setState({ turn: 'Player2' }, this.isSomeAbleToCapture)
    }
    else {
      this.setState({ turn: 'Player1' }, this.isSomeAbleToCapture)
    }
  }

  moveChecker = (cell) => {
    let { selectedCell } = this.state;
    let board = this.state.board;
    board[cell.row][cell.col] = selectedCell.checker;
    board[selectedCell.row][selectedCell.col] = '';
    SocketService.emit('sendBoard', board);
    this.setState({ board }, this.finishMove(cell));
  }

  isSelectedCellAbleToCapture = (selectedCell) => {
    if (!this.isCellEmpty(selectedCell)) {
      if (selectedCell.checker.includes('King')) {
        if (selectedCell.row + 2 <= 7 && selectedCell.col + 2 <= 7) {
          if (this.isCellEmpty({ row: selectedCell.row + 2, col: selectedCell.col + 2 }) && this.checkCapture({ row: selectedCell.row + 2, col: selectedCell.col + 2 }, selectedCell)) {
            return true;
          }
        }
        if (selectedCell.row + 2 <= 7 && selectedCell.col - 2 >= 0) {
          if (this.isCellEmpty({ row: selectedCell.row + 2, col: selectedCell.col - 2 }) && this.checkCapture({ row: selectedCell.row + 2, col: selectedCell.col - 2 }, selectedCell)) {
            return true;
          }
        }
        if (selectedCell.row - 2 >= 0 && selectedCell.col + 2 <= 7) {
          if (this.isCellEmpty({ row: selectedCell.row - 2, col: selectedCell.col + 2 }) && this.checkCapture({ row: selectedCell.row - 2, col: selectedCell.col + 2 }, selectedCell)) {
            return true;
          }
        }
        if (selectedCell.row - 2 >= 0 && selectedCell.col - 2 >= 0) {
          if (this.isCellEmpty({ row: selectedCell.row - 2, col: selectedCell.col - 2 }) && this.checkCapture({ row: selectedCell.row - 2, col: selectedCell.col - 2 }, selectedCell)) {
            return true;
          }
        }
      }
      else {
        if (selectedCell.checker.includes('Player1')) {
          if (selectedCell.row + 2 <= 7 && selectedCell.col + 2 <= 7) {
            if (this.isCellEmpty({ row: selectedCell.row + 2, col: selectedCell.col + 2 }) && this.checkCapture({ row: selectedCell.row + 2, col: selectedCell.col + 2 }, selectedCell)) {
              return true;
            }
          }
          if (selectedCell.row + 2 <= 7 && selectedCell.col - 2 >= 0) {
            if (this.isCellEmpty({ row: selectedCell.row + 2, col: selectedCell.col - 2 }) && this.checkCapture({ row: selectedCell.row + 2, col: selectedCell.col - 2 }, selectedCell)) {
              return true;
            }
          }
        }
        else {
          if (selectedCell.row - 2 >= 0 && selectedCell.col + 2 <= 7) {
            if (this.isCellEmpty({ row: selectedCell.row - 2, col: selectedCell.col + 2 }) && this.checkCapture({ row: selectedCell.row - 2, col: selectedCell.col + 2 }, selectedCell)) {
              return true;
            }
          }
          if (selectedCell.row - 2 >= 0 && selectedCell.col - 2 >= 0) {
            if (this.isCellEmpty({ row: selectedCell.row - 2, col: selectedCell.col - 2 }) && this.checkCapture({ row: selectedCell.row - 2, col: selectedCell.col - 2 }, selectedCell)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  isSomeAbleToCapture = () => {
    for (let i = 0; i < this.state.size; i++) {
      for (let j = 0; j < this.state.size; j++) {
        let simulationSelectedCell = { row: i, col: j, checker: this.state.board[i][j] }
        if (simulationSelectedCell.checker.includes(this.state.turn))
          if (this.isSelectedCellAbleToCapture(simulationSelectedCell)) {
            this.setState({ isAbleToCapture: true })
          }
      }
    }
  }

  captureChecker = (cell) => {
    let { selectedCell } = this.state;
    let board = this.state.board;
    board[cell.row][cell.col] = selectedCell.checker;
    board[selectedCell.row][selectedCell.col] = '';
    if (selectedCell.checker.includes('King')) {
      switch (selectedCell.row - cell.row) {
        case -2: {
          if (selectedCell.col - cell.col === 2) {
            board[cell.row - 1][cell.col + 1] = '';
          }
          else {
            board[cell.row - 1][cell.col - 1] = '';
          } break;
        }
        case 2: {
          if (selectedCell.col - cell.col === 2) {
            board[cell.row + 1][cell.col + 1] = '';
          }
          else {
            board[cell.row + 1][cell.col - 1] = '';
          } break;
        }
      }
    }
    else {
      if (selectedCell.checker.includes('Player1')) {
        if (selectedCell.col - cell.col === 2) {
          board[cell.row - 1][cell.col + 1] = '';
        }
        else {
          board[cell.row - 1][cell.col - 1] = '';
        }
      }
      else {
        if (selectedCell.col - cell.col === 2) {
          board[cell.row + 1][cell.col + 1] = '';
        }
        else {
          board[cell.row + 1][cell.col - 1] = '';
        }
      }
    }

    this.setState({ board }, () => {
      cell.checker = board[cell.row][cell.col];
      if (this.isSelectedCellAbleToCapture(cell)) {
        this.setState({ isMultipleCapture: true }, () => {
          this.finishMove(cell)
          SocketService.emit('sendMultipleCapture', board);
        })
      }
      else {
        this.setState({ isMultipleCapture: false }, () => {
          this.finishMove(cell)
          SocketService.emit('sendBoard', board);
        })
      }
    });
  }

  checkMove = (cell) => {
    let { selectedCell } = this.state;
    return (selectedCell.checker.includes('King') ?
      (selectedCell.row === cell.row - 1 || selectedCell.row === cell.row + 1) &&
      (selectedCell.col === cell.col + 1 || selectedCell.col === cell.col - 1) :
      ((selectedCell.checker.includes('Player1') ?
        selectedCell.row === cell.row - 1 : selectedCell.row === cell.row + 1) &&
        (selectedCell.col === cell.col + 1 || selectedCell.col === cell.col - 1)
      ))
  }

  checkCapture = (cell, simulationSelectedCell) => {
    let selectedCell;
    if (simulationSelectedCell) {
      selectedCell = simulationSelectedCell;
    }
    else {
      selectedCell = this.state.selectedCell;
    }
    return selectedCell.checker.includes('Player1 King') ?
      (((selectedCell.row === cell.row - 2) &&
        ((selectedCell.col === cell.col + 2 &&
          ((this.cellValue({ row: cell.row - 1, col: cell.col + 1 })).includes('Player2'))) ||
          (selectedCell.col === cell.col - 2 &&
            ((this.cellValue({ row: cell.row - 1, col: cell.col - 1 })).includes('Player2')))))

        ||
        ((selectedCell.row === cell.row + 2) &&
          ((selectedCell.col === cell.col + 2 &&
            ((this.cellValue({ row: cell.row + 1, col: cell.col + 1 })).includes('Player2'))) ||
            (selectedCell.col === cell.col - 2 &&
              ((this.cellValue({ row: cell.row + 1, col: cell.col - 1 })).includes('Player2'))))))
      :
      selectedCell.checker.includes('Player2 King') ?
        (((selectedCell.row === cell.row - 2) &&
          ((selectedCell.col === cell.col + 2 &&
            ((this.cellValue({ row: cell.row - 1, col: cell.col + 1 })).includes('Player1'))) ||
            (selectedCell.col === cell.col - 2 &&
              ((this.cellValue({ row: cell.row - 1, col: cell.col - 1 })).includes('Player1')))))

          ||
          ((selectedCell.row === cell.row + 2) &&
            ((selectedCell.col === cell.col + 2 &&
              ((this.cellValue({ row: cell.row + 1, col: cell.col + 1 })).includes('Player1'))) ||
              (selectedCell.col === cell.col - 2 &&
                ((this.cellValue({ row: cell.row + 1, col: cell.col - 1 })).includes('Player1'))))))
        :
        selectedCell.checker.includes('Player1') ?
          ((selectedCell.row === cell.row - 2) &&
            ((selectedCell.col === cell.col + 2 &&
              ((this.cellValue({ row: cell.row - 1, col: cell.col + 1 })).includes('Player2'))) ||
              (selectedCell.col === cell.col - 2 &&
                ((this.cellValue({ row: cell.row - 1, col: cell.col - 1 })).includes('Player2')))))
          :
          ((selectedCell.row === cell.row + 2) &&
            ((selectedCell.col === cell.col + 2 &&
              ((this.cellValue({ row: cell.row + 1, col: cell.col + 1 })).includes('Player1'))) ||
              (selectedCell.col === cell.col - 2 &&
                ((this.cellValue({ row: cell.row + 1, col: cell.col - 1 })).includes('Player1')))))

  }

  isGameWon = () => {
    let winnerPlayer1 = true, winnerPlayer2 = true;
    for (let i = 0; i < this.state.size; i++) {
      for (let j = 0; j < this.state.size; j++) {
        if (this.state.board[i][j].includes('Player1')) {
          winnerPlayer2 = false;
        }
        if (this.state.board[i][j].includes('Player2')) {
          winnerPlayer1 = false;
        }
      }
    }
    return winnerPlayer1 || winnerPlayer2;
  }

  restartGame = () => {
    this.createBoard();
    this.setState({ turn: 'Player1' },
      this.setState({ selectedCell: null },
        this.setState({ isAbleToCapture: false },
          this.setState({ isWon: false }))))
    SocketService.emit('sendRestartGame');
  }

  undoBoard = () => {
    if (this.state.numOfTurnIndex > 0) {
      this.setState({ numOfTurnIndex: --this.state.numOfTurnIndex },
        this.setState({ board: this.state.undoBoardStates[this.state.numOfTurnIndex] },
          this.setState({ selectedCell: null },
            this.setState({ isAbleToCapture: false },
              this.switchTurn()))));
    }
  }

  choosePlayer = (player) => {
    this.setState({ player });
    if (player === 'Player1') {
      SocketService.emit('sendPlayer', 'Player2');
    }
    else {
      SocketService.emit('sendPlayer', 'Player1');
    }
  }

  render() {
    return (
      <div className="flex column justify-center align-center">
        <Message turn={this.state.turn} choosePlayer={this.choosePlayer} player={this.state.player} ></Message>
        <div className="board-game">
          <Winner isWon={this.state.isWon}></Winner>
          <table>
            <tbody className="flex column">
              {this.state.board.map((row, i) =>
                <Row row={row} rowIndex={i} selectCell={this.selectCell} selectedCell={this.state.selectedCell} key={i}
                  isCellEmpty={this.isCellEmpty} checkMove={this.checkMove} checkCapture={this.checkCapture}
                  isAbleToCapture={this.state.isAbleToCapture}>
                </Row>)}
            </tbody>
          </table>
        </div>
        <button className="restart-game" onClick={this.restartGame}>Restart Game</button>
        {/* <button onClick={this.undoBoard}>Undo</button> */}
      </div>
    )
  }
}

