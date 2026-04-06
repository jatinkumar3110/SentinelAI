# SENTINELAI Live Deployment Guide (Render + Vercel)

## Deployment Target
- Backend: Render (Free Web Service)
- Frontend: Vercel (Free Static Hosting)

This is the recommended zero-cost deployment path for this repository.

## Free-Tier Constraints (Important)
- Render free web services have limited RAM and cold starts.
- Full model stack (especially DistilBERT) is not reliable on free tier.
- Use lite mode in backend env vars:
  - ENABLE_LSTM=true
  - ENABLE_GRU=false
  - ENABLE_XGBOOST=true
  - ENABLE_BERT=false

## Project Summary
SENTINELAI is a multi-modal anomaly detection and risk intelligence platform with:
- Time-series anomaly scoring (LSTM/GRU)
- Tabular failure prediction (XGBoost)
- Log risk scoring (DistilBERT)
- Risk fusion and alert severity output
- FastAPI APIs + React dashboard

## Render Backend Deployment (Step-by-Step)

1. Push latest code to GitHub.
2. In Render dashboard, click New + -> Blueprint.
3. Select this repository and branch.
4. Render reads `render.yaml` from repo root and creates backend service.
5. Wait for first deploy to complete.

### Backend Health Checks
After deploy, verify:
- `/health`
- `/api/v1/system/health`

### Required Backend Environment Variables
Configured in `render.yaml`:
- HOST=0.0.0.0
- PORT=8000
- API_V1_PREFIX=/api/v1
- MODEL_DIR=models
- DATA_DIR=data
- DATABASE_URL=sqlite:///./sentinelai.db
- ENABLE_LSTM=true
- ENABLE_GRU=false
- ENABLE_XGBOOST=true
- ENABLE_BERT=false
- ALLOWED_ORIGINS (set manually in Render after frontend URL is known)

## Vercel Frontend Deployment (Step-by-Step)

1. In Vercel dashboard, click Add New -> Project.
2. Import the same repository.
3. Set Root Directory to `frontend`.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variable:
   - VITE_API_URL=https://YOUR_RENDER_BACKEND.onrender.com/api/v1
7. Deploy.

The included `frontend/vercel.json` handles SPA rewrites.

## Final CORS Setup
After frontend is live:
1. Copy frontend URL from Vercel.
2. In Render backend env vars, set:
   - ALLOWED_ORIGINS=https://YOUR_FRONTEND.vercel.app
3. Redeploy backend.

## Validation Checklist
1. Backend `/health` returns `{ "status": "ok" }`.
2. Backend `/api/v1/system/health` returns operational JSON.
3. Frontend loads and can run sample prediction.
4. Response always includes:
   - anomaly_score
   - failure_probability
   - log_risk
   - final_risk_score
5. WebSocket endpoint responds at `/api/v1/ws/stream`.

## Common Errors and Fixes
- Error: frontend cannot reach backend
  - Fix VITE_API_URL and redeploy frontend.
- Error: CORS blocked
  - Set ALLOWED_ORIGINS to exact Vercel domain and redeploy backend.
- Error: backend memory crash
  - Keep ENABLE_BERT=false and ENABLE_GRU=false on free tier.
- Error: slow first request
  - Expected on Render free tier cold starts.
