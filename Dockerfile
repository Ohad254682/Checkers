# Use Node.js 18 with Alpine
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

# Build frontend with OpenSSL legacy provider
ENV NODE_OPTIONS="--openssl-legacy-provider"
RUN cd frontend && npm run build

# Create backend public directory and copy built frontend
RUN mkdir -p backend/public
RUN cp -r frontend/build/* backend/public/

# Expose port
EXPOSE 3000

# Start backend server
WORKDIR /app/backend
CMD ["npm", "run", "server:prod"]
