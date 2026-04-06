# SENTINELAI Live Deployment Guide (DigitalOcean)

## Can frontend and backend both be deployed on DigitalOcean?
Yes. You can deploy both on DigitalOcean in two common ways:

1. App Platform only:
- Backend as a web service
- Frontend as a static site

2. Hybrid (recommended for low-cost trial/free-credit stability):
- Backend on a Droplet (more control for ML runtime)
- Frontend on App Platform static site

## Project Summary (Resume-Ready)
SENTINELAI is a multi-modal anomaly detection and risk intelligence platform that combines:
- Time-series anomaly scoring using LSTM/GRU autoencoder models
- Tabular failure probability using XGBoost
- Log risk scoring using DistilBERT
- Risk fusion into a unified final risk score with alert severity
- Dashboard visualization, system health monitoring, and historical record APIs

The architecture was redesigned for constrained infrastructure by adding model toggles and deployment profiles, enabling stable low-cost deployments.

## What is already prepared in this repository
- DigitalOcean app spec (low-cost/trial profile): .do/app.yaml
- DigitalOcean app spec (production profile): .do/app.prod.yaml
- Root-level App Spec fallback for auto-detection: app.yaml
- Root-level backend Dockerfile fallback for auto-detection: Dockerfile
- Lightweight model toggles for low-memory deployments
- Frontend API base URL through VITE_API_URL
- Backend health endpoint and API routing under /api/v1

## If DigitalOcean shows "No components detected"

Use one of these two options:

1. App Spec import (recommended)
- In App Platform, choose to deploy from App Spec and select `app.yaml` from repo root.

2. Root Dockerfile fallback
- Create backend as Web Service using root `Dockerfile`.
- Then add frontend Static Site component with source directory `frontend`.

This repository now includes both root files so App Platform can move forward even when monorepo auto-detection fails.

## Fastest way to go live (DigitalOcean, low-cost profile)

### Step 1: Push current repo to GitHub
- Ensure latest code is committed and pushed.

### Step 2: Create App in DigitalOcean App Platform
- In DigitalOcean, choose Create App.
- Connect your GitHub repo.
- Import app spec from:
  - .do/app.yaml

### Step 3: Set required placeholder values in .do/app.yaml before deploy
Replace these values:
- REPLACE_WITH_BACKEND_DOMAIN
- REPLACE_WITH_FRONTEND_DOMAIN

Practical order:
1. First deploy backend service.
2. Copy backend live URL from DigitalOcean.
3. Update frontend VITE_API_URL with backend URL + /api/v1.
4. Redeploy frontend static site.

### Step 4: Verify backend endpoints
- Health: /health
- System health: /api/v1/system/health
- Predict: POST /api/v1/predict

### Step 5: Verify frontend integration
- Open frontend app URL.
- Run one sample prediction from dashboard.
- Confirm charts and metric cards populate.

## Backend env defaults for low-cost mode
Use these in low-memory plans:
- ENABLE_LSTM=true
- ENABLE_GRU=false
- ENABLE_XGBOOST=true
- ENABLE_BERT=false

This profile keeps API contract intact while reducing startup and memory pressure.

## Production upgrade path (when budget allows)
Use .do/app.prod.yaml to enable:
- Managed PostgreSQL
- Health-check settings
- Autoscaling limits

Also ensure backend dependency includes PostgreSQL driver (already added):
- psycopg2-binary

## One-time deployment checklist
1. Frontend VITE_API_URL points to backend /api/v1 base URL.
2. Backend ALLOWED_ORIGINS includes frontend URL.
3. Backend /api/v1/system/health returns operational.
4. One prediction request succeeds from UI.
5. /api/v1/history returns at least one stored record.

## Common issues and quick fixes
- Blank frontend UI:
  - Usually wrong VITE_API_URL or wrong API prefix.
- CORS errors:
  - Add frontend origin to ALLOWED_ORIGINS.
- Backend memory crashes:
  - Keep BERT disabled in low-cost mode.
- Slow cold start:
  - Use lightweight profile and avoid loading all models.
