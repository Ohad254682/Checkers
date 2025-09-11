# Use Node.js 18 with Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install --prefix frontend
RUN npm install --prefix backend

# Copy source code
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Build frontend with OpenSSL legacy provider
ENV NODE_OPTIONS="--openssl-legacy-provider"
RUN npm run build --prefix frontend

# Create backend public directory and copy built frontend
RUN mkdir -p backend/public
RUN cp -r frontend/build/* backend/public/

# Expose port
EXPOSE 3000

# Start backend server
WORKDIR /app/backend
CMD ["npm", "run", "server:prod"]
