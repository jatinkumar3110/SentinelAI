#!/bin/bash

PORT=${PORT:-7860}

gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:$PORT \
  --workers 1 \
  --timeout 300
