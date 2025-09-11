const express = require('express')
const path = require('path')

const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const connectSockets = require('./api/socket/socket.routes')

if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode');
    console.log('Public directory:', path.resolve(__dirname, 'public'));
    
    app.use(express.static(path.resolve(__dirname, 'public')));
    
    // Serve React app for all routes
    app.get('*', (req, res) => {
        console.log('Serving index.html for route:', req.path);
        res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
    });
} else {
    console.log('Running in development mode');
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


const port = process.env.PORT || 3000;
http.listen(port, '0.0.0.0', () => {
    console.log('Server is running on port: ' + port)
});
