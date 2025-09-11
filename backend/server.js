const express = require('express')
const path = require('path')

const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const connectSockets = require('./api/socket/socket.routes')

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')));
    
    // Serve React app for all routes
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
    });
} else {
    // Simple CORS for development
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });
}

// routes
connectSockets(io)


const port = process.env.PORT || 3030;
http.listen(port, () => {
    console.log('Server is running on port: ' + port)
});
