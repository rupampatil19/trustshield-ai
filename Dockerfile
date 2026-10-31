# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend & Nginx
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies: nginx, supervisor, and build tools for Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    build-essential \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/app ./app

# Copy the built frontend from Stage 1 to the Nginx directory
COPY --from=frontend-builder /app/frontend/dist /app/static

# Copy Nginx configuration
COPY frontend/nginx.conf /etc/nginx/sites-available/default
RUN rm -f /etc/nginx/sites-enabled/default && ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

# Copy Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose port 7860 (Hugging Face requirement)
EXPOSE 7860

# Start Supervisor to run both Nginx and Uvicorn
CMD ["/usr/bin/supervisord"]