# Checkers Game

A real-time multiplayer checkers game built with React and Node.js using Socket.IO.

## Features

- Real-time multiplayer gameplay
- Modern UI with animations
- King promotion with visual effects
- Win celebration with confetti
- Responsive design
- Game instructions panel

## Tech Stack

- **Frontend**: React, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO
- **Styling**: CSS3 with animations

## Local Development

1. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Start the backend:
   ```bash
   cd backend && npm run server:dev
   ```

3. Start the frontend:
   ```bash
   cd frontend && npm start
   ```

## Deployment

The app is configured for deployment on Heroku. The backend serves the built React app in production.

### Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-checkers-app`
4. Deploy: `git push heroku main`

Your app will be available at `https://your-checkers-app.herokuapp.com`

## Game Rules

- Players take turns moving diagonally on dark squares
- Capture by jumping over opponent pieces
- Multiple jumps are allowed in one turn
- Reach the opposite side to become a King
- Kings move and capture both forward and backward
- If a capture is available, you must take it
- Win by capturing all opponent pieces
