#!/bin/bash
# Production startup script for SentinelAI backend on AWS EC2

# Load environment variables if .env exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Default to port 8000 if not set
PORT=${PORT:-8000}

# Start the application using gunicorn
gunicorn app.main:app \
    -k uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:$PORT \
    --workers 4 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
