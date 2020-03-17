
module.exports = connectSockets

function connectSockets(io) {
    io.on('connection', socket => {
        socket.on('sendBoard', board => {
            socket.broadcast.emit('setBoard', board)
        })
        socket.on('sendWon', () => {
            socket.broadcast.emit('setWon');
        })
        socket.on('sendRestartGame', () => {
            socket.broadcast.emit('setRestartGame');
        })
        socket.on('sendMultipleCapture', board => {
            socket.broadcast.emit('setMultipleCapture', board);
        })
        socket.on('sendKing', board => {
            socket.broadcast.emit('setKing', board);
        })
        socket.on('sendPlayer', player => {
            socket.broadcast.emit('setPlayer', player);
        })
    })
}