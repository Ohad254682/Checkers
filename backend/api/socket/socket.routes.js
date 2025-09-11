
module.exports = connectSockets

function connectSockets(io) {
    io.on('connection', socket => {
        socket.on('sendBoard', payload => {
            socket.broadcast.emit('setBoard', payload)
        })
        socket.on('sendWon', (winner) => {
            io.emit('setWon', winner);
        })
        socket.on('sendRestartGame', () => {
            socket.broadcast.emit('setRestartGame');
        })
        socket.on('sendMultipleCapture', payload => {
            socket.broadcast.emit('setMultipleCapture', payload);
        })
        socket.on('sendKing', payload => {
            socket.broadcast.emit('setKing', payload);
        })
        socket.on('sendPlayer', player => {
            socket.broadcast.emit('setPlayer', player);
        })
    })
}