# Backend Dockerfile for App Runner
FROM python:3.11.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Make init script executable
RUN chmod +x init_db_docker.py

# Expose port 8000
EXPOSE 8000

# Health check for App Runner
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Create startup script
RUN echo '#!/bin/bash\n\
echo "🚀 Starting IFlyChat Backend..."\n\
echo "🔄 Initializing database..."\n\
python init_db_docker.py\n\
if [ $? -eq 0 ]; then\n\
    echo "✅ Database initialized successfully"\n\
    echo "🚀 Starting FastAPI server..."\n\
    uvicorn server:app --host 0.0.0.0 --port 8000\n\
else\n\
    echo "❌ Database initialization failed"\n\
    exit 1\n\
fi' > /app/start.sh && chmod +x /app/start.sh

# Start the app
CMD ["/app/start.sh"]
