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

// Always serve static files if they exist
const publicPath = path.resolve(__dirname, 'public');
console.log('Public directory:', publicPath);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Check if public directory exists
const fs = require('fs');
if (fs.existsSync(publicPath)) {
    console.log('Serving static files from:', publicPath);
    app.use(express.static(publicPath));
    
    // Serve React app for all routes
    app.get('*', (req, res) => {
        console.log('Serving index.html for route:', req.path);
        res.sendFile(path.resolve(publicPath, 'index.html'));
    });
} else {
    console.log('Public directory does not exist, running in development mode');
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
