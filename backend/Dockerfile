# Backend Dockerfile for AWS Lambda
FROM python:3.11.9-slim

# The standard working directory for AWS Lambda is /var/task
WORKDIR /var/task

# Install system dependencies needed for libraries like psycopg2
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application source code
COPY . .

# The command that AWS Lambda will use to start your application
# It looks for the 'handler' object inside the 'server.py' file.
CMD ["server.handler"]