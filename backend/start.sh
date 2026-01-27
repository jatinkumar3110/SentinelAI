#!/bin/bash
gunicorn app.main:app \
    --workers 1 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:${PORT:-7860} \
    --timeout 300 \
    --access-logfile - \
    --error-logfile -
