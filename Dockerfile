# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd frontend && npm install
RUN cd backend && npm install

# Copy source code
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Build frontend
RUN cd frontend && npm run build

# Copy built frontend to backend public folder
RUN cp -r frontend/build/* backend/public/

# Expose port
EXPOSE 3000

# Start backend server
WORKDIR /app/backend
CMD ["npm", "run", "server:prod"]
