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
    winner: null,
    player: null,
    showInstructionsModal: false
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

  buildInitialBoard = () => {
    const size = this.state.size;
    const board = [];
    for (let i = 0; i < size; i++) {
      board[i] = [];
      for (let j = 0; j < size; j++) {
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
    return board;
  }

  setPlayer = (player) => {
    if (this.state.player) return;
    const other = player === 'Player1' ? 'Player2' : 'Player1';
    this.setState({ player: other })
  }

  updateRestart = () => {
    const board = this.buildInitialBoard();
    this.setState({
      board,
      selectedCell: null,
      isAbleToCapture: false,
      isWon: false,
      isMultipleCapture: false,
      undoBoardStates: [],
      numOfTurnIndex: 0,
      turn: 'Player1',
      player: null
    })
  }
  updateWon = (winner) => {
    if (!winner) return;
    this.setState({ isWon: true, winner })
  }

  updateWithoutSwitchTurn = (payload) => {
    const board = payload.board || payload;
    const turn = payload.turn || this.state.turn;
    this.setState({ board, turn }, () => {
      const winnerFromBoard = this.isGameWon();
      if (winnerFromBoard && !this.state.isWon) {
        this.setState({ isWon: true, winner: winnerFromBoard });
      }
    })
  }

  updateBoard = (payload) => {
    const board = payload.board || payload;
    const turn = payload.turn || this.state.turn;
    this.setState({ board, turn }, () => {
      this.setState({ isAbleToCapture: false },
        this.switchTurn)
      const winnerFromBoard = this.isGameWon();
      if (winnerFromBoard && !this.state.isWon) {
        this.setState({ isWon: true, winner: winnerFromBoard });
      }
    })
  }

  testCelebrate = () => {
    const winner = this.state.player || this.state.turn;
    this.setState({ isWon: true, winner });
  }

  createBoard = () => {
    const board = this.buildInitialBoard();
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

  isKing = (cell, nextTurn) => {
    let board = this.state.board;
    if ((board[cell.row][cell.col].includes('Player1') && cell.row === this.state.size - 1) ||
      (board[cell.row][cell.col].includes('Player2') && cell.row === 0)) {
      board[cell.row][cell.col] += ' King';
      const turnToBroadcast = nextTurn || this.state.turn;
      SocketService.emit('sendKing', { board, turn: turnToBroadcast });
      this.setState({ board })
    }
  }

  finishMove = (cell) => {
    const movingPlayer = this.state.turn; // capture the player who just moved
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
    const currentTurn = this.state.turn;
    const nextTurn = this.state.isMultipleCapture ? currentTurn : (currentTurn === 'Player1' ? 'Player2' : 'Player1');
    this.isKing(cell, nextTurn);
    const winnerFromBoard = this.isGameWon();
    if (winnerFromBoard) {
      // Show locally and broadcast so opponent also celebrates
      this.setState({ isWon: true, winner: winnerFromBoard });
      SocketService.emit('sendWon', winnerFromBoard)
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
    SocketService.emit('sendBoard', { board, turn: this.state.turn });
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
    SocketService.emit('sendBoard', { board, turn: this.state.turn });
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
          SocketService.emit('sendMultipleCapture', { board, turn: this.state.turn });
        })
      }
      else {
        this.setState({ isMultipleCapture: false }, () => {
          this.finishMove(cell)
          SocketService.emit('sendBoard', { board, turn: this.state.turn });
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
    let hasPlayer1 = false;
    let hasPlayer2 = false;
    for (let i = 0; i < this.state.size; i++) {
      for (let j = 0; j < this.state.size; j++) {
        if (this.state.board[i][j].includes('Player1')) hasPlayer1 = true;
        if (this.state.board[i][j].includes('Player2')) hasPlayer2 = true;
        if (hasPlayer1 && hasPlayer2) break;
      }
      if (hasPlayer1 && hasPlayer2) break;
    }
    if (!hasPlayer2 && hasPlayer1) return 'Player1';
    if (!hasPlayer1 && hasPlayer2) return 'Player2';
    return null;
  }

  restartGame = () => {
    const board = this.buildInitialBoard();
    this.setState({
      board,
      selectedCell: null,
      isAbleToCapture: false,
      isWon: false,
      isMultipleCapture: false,
      undoBoardStates: [],
      numOfTurnIndex: 0,
      turn: 'Player1',
      player: null
    })
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
    if (this.state.player) return;
    this.setState({ player });
    SocketService.emit('sendPlayer', player);
  }

  toggleInstructionsModal = () => {
    this.setState({ showInstructionsModal: !this.state.showInstructionsModal });
  }

  closeInstructionsModal = () => {
    this.setState({ showInstructionsModal: false });
  }

  render() {
    return (
      <div className="flex column justify-center align-center">
        <div className="controls-row">
          <button className="restart-game" onClick={this.restartGame}>Restart Game</button>
          <Message turn={this.state.turn} choosePlayer={this.choosePlayer} player={this.state.player} isAbleToCapture={this.state.isAbleToCapture}></Message>
        </div>
        <div className="content">
          <div className="board-game">
          <Winner isWon={this.state.isWon} winner={this.state.winner}></Winner>
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
          <aside className="instructions-panel">
            <h3>How to Play Checkers</h3>
            <ul>
              <li>Select a player to begin.</li>
              <li>Pieces move diagonally on dark squares.</li>
              <li>Capture by jumping over opponent pieces.</li>
              <li>Multiple jumps are allowed in one turn.</li>
              <li>Reach the opposite side to become a King.</li>
              <li>Kings move and capture both forward and backward.</li>
              <li>If a capture is available, you must take it.</li>
              <li>Win by capturing all opponent pieces.</li>
            </ul>
          </aside>
        </div>
        {/* <button onClick={this.undoBoard}>Undo</button> */}
        
        {/* Help Button for Mobile/Tablet */}
        <button className="help-button" onClick={this.toggleInstructionsModal}>?</button>
        
        {/* Instructions Modal */}
        <div className={`instructions-modal ${this.state.showInstructionsModal ? 'show' : ''}`} onClick={this.closeInstructionsModal}>
          <div className="instructions-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={this.closeInstructionsModal}>×</button>
            <h3>How to Play Checkers</h3>
            <ul>
              <li>Select a player to begin.</li>
              <li>Pieces move diagonally on dark squares.</li>
              <li>Capture by jumping over opponent pieces.</li>
              <li>Multiple jumps are allowed in one turn.</li>
              <li>Reach the opposite side to become a King.</li>
              <li>Kings move and capture both forward and backward.</li>
              <li>If a capture is available, you must take it.</li>
              <li>Win by capturing all opponent pieces.</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

