# SENTINELAI - Technical Documentation

## System Architecture

### Overview
SentinelAI is a production-grade multi-modal anomaly detection platform that combines deep learning autoencoders, gradient boosting, and transformer models to detect anomalies across time-series sensor data, tabular telemetry features, and system logs.

### Deployment Reality Check (Important)

On low-memory instances, loading all models at startup can exceed available RAM. To support reliable Render free-tier deployments, SentinelAI supports environment-based model toggles:

```bash
ENABLE_LSTM=true
ENABLE_GRU=true
ENABLE_XGBOOST=true
ENABLE_BERT=true
```

For a lightweight demo on low-memory instances, disable heavy components (especially BERT and one of the sequence models):

```bash
ENABLE_LSTM=true
ENABLE_GRU=false
ENABLE_XGBOOST=true
ENABLE_BERT=false
```

This preserves the API contract while reducing cold-start and peak RAM usage.

### Deployment Standard (Render + Vercel)

1. Backend: Deploy FastAPI on Render Web Service (free tier supported in lite mode).
2. Frontend: Deploy React static site on Vercel.
3. Runtime mode: Use lightweight model toggles first, then enable full stack after memory validation.

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Vercel                              │
│              (React SPA - Static Hosting)                   │
│              https://<your-project>.vercel.app              │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS REST API
                         │ /api/v1/*
┌────────────────────────▼────────────────────────────────────┐
│                 Render Web Service                          │
│               (Free tier, 512MB constrained)                │
│      https://<your-render-backend>.onrender.com             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │             FastAPI Backend                          │   │
│  │   • Uvicorn ASGI Server                             │   │
│  │   • REST API + WebSocket                            │   │
│  │   • SQLite Database                                 │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                       │
│  ┌──────────────────▼──────────────────────────────────┐   │
│  │         Inference Service (Multi-Model)             │   │
│  │   • LSTM Autoencoder (Time-series)                  │   │
│  │   • GRU Autoencoder (Time-series)                   │   │
│  │   • XGBoost (Tabular features)                      │   │
│  │   • DistilBERT (Log classification)                 │   │
│  │   • Fusion Engine (Risk aggregation)                │   │
│  │   • Drift Detection (ADWIN)                         │   │
│  │   • Root Cause Analysis                             │   │
│  │   • SHAP Explainability                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Backend Components

### 1. API Layer (`app/api/`)

#### routes.py
- **POST /api/v1/predict**: Multi-modal anomaly detection
- **GET /api/v1/history**: Retrieve historical records (paginated)
- **GET /api/v1/metrics/summary**: Performance metrics (ROC-AUC, confusion matrix, latency)
- **GET /api/v1/metrics/drift**: Drift detection status
- **GET /api/v1/alerts/recent**: Recent alerts with severity levels
- **GET /api/v1/system/health**: Comprehensive system health check
- **POST /api/v1/store_result**: Manual result storage

#### websocket_routes.py
- **WS /api/v1/ws/stream**: Real-time metrics streaming

### 2. Machine Learning Models (`app/ml/`)

#### timeseries_model.py - LSTM Autoencoder
- **Architecture**: Encoder-Decoder with 64 hidden units
- **Input**: 50-point time-series sequences
- **Output**: Reconstruction error as anomaly score
- **Training**: Trained on normal operational data
- **Threshold**: 95th percentile of reconstruction errors

#### gru_model.py - GRU Autoencoder
- **Architecture**: GRU-based encoder-decoder
- **Purpose**: Alternative time-series anomaly detection
- **Feature**: Captures different temporal patterns than LSTM

#### tabular_model.py - XGBoost Classifier
- **Features**: temperature, pressure, vibration, rotation_speed, power_consumption, operating_hours
- **Output**: Failure probability [0-1]
- **Parameters**: max_depth=6, n_estimators=100, learning_rate=0.1

#### log_model.py - DistilBERT Classifier
- **Model**: distilbert-base-uncased fine-tuned
- **Input**: System log text (max 512 tokens)
- **Output**: Log risk score [0-1]
- **Classes**: Normal vs. Anomalous logs

#### fusion.py - Risk Fusion Engine
Combines scores from all models with weighted ensemble:
- **Weights**: 
  - Time-series: 40%
  - Failure probability: 35%
  - Log risk: 25%
- **Formula**: `final_risk = 0.4*anomaly + 0.35*failure + 0.25*log_risk`

#### drift_detector.py - ADWIN Algorithm
- **Purpose**: Detect concept drift in data distributions
- **Method**: Adaptive Windowing (ADWIN)
- **Tracks**: Anomaly score drift, failure probability drift, log risk drift

#### root_cause.py - Feature Importance
- **Method**: SHAP (SHapley Additive exPlanations)
- **Output**: Top-5 contributing features ranked by importance

#### explainability.py - SHAP Engine
- **Models Explained**: XGBoost tabular features
- **Output**: Feature contribution values

### 3. Services (`app/services/`)

#### inference_service.py
- **Orchestration**: Manages all model loading and prediction pipeline
- **Lazy Loading**: Models loaded once on startup
- **Caching**: Maintains model instances in memory
- **Error Handling**: Graceful degradation if models fail to load

#### alert_manager.py
- **Severity Levels**: CRITICAL (>0.85), HIGH (>0.70), MEDIUM (>0.50), LOW (<0.50)
- **Storage**: In-memory alert queue
- **Features**: Alert acknowledgment, statistics tracking

#### metrics_service.py
- **Metrics Tracked**:
  - ROC-AUC, Precision, Recall, F1-Score
  - Confusion Matrix (TP, FP, TN, FN)
  - Latency (mean, P50, P95, P99)
  - Throughput (requests/second)
  - MTBF (Mean Time Between Failures)

### 4. Database (`app/db/`)

#### models.py - AnomalyRecord Schema
```python
{
    "id": int,
    "timestamp": datetime,
    "anomaly_score": float,
    "failure_probability": float,
    "log_risk": float,
    "final_risk_score": float,
    "explanation_values": dict,
    "alert_triggered": bool,
    "timeseries_features": list,
    "tabular_features": dict,
    "log_text": str
}
```

#### database.py
- **Engine**: SQLAlchemy + SQLite
- **Connection**: Session-based with dependency injection
- **Initialization**: Auto-creates tables on startup

### 5. Configuration (`app/core/config.py`)

Environment variables:
```bash
MODEL_DIR=./models              # ML model directory
DATA_DIR=./data                 # Training data cache
DATABASE_URL=sqlite:///./sentinelai.db
PORT=8000
HOST=0.0.0.0
API_V1_PREFIX=/api/v1
ENABLE_LSTM=true
ENABLE_GRU=true
ENABLE_XGBOOST=true
ENABLE_BERT=true
```

## Frontend Components

### Pages (`src/pages/`)

#### Dashboard.jsx
- **Primary View**: Main anomaly detection interface
- **Components**:
  - Multi-modal input panel
  - Risk gauge (animated circular)
  - Donut chart (risk breakdown)
  - Metric cards (4-grid layout)
  - Alert status indicators

#### History.jsx
- **Purpose**: Historical anomaly records
- **Features**:
  - Paginated table
  - Sortable columns
  - Expandable rows with details
  - Date/time filtering

#### Alerts.jsx
- **Purpose**: Alert management dashboard
- **Features**:
  - Severity-coded badges
  - Alert acknowledgment
  - Alert statistics (total, by severity)

#### SystemInfo.jsx
- **Purpose**: System health monitoring
- **Displays**:
  - Model status (loaded/not loaded)
  - Performance metrics
  - Drift detection status
  - Uptime statistics

### Components (`src/components/`)

#### UploadPanel.jsx
- **Inputs**: Time-series, tabular features, log text
- **Sample Data**: 5 pre-configured test datasets
- **Validation**: Pads time-series to 50 values
- **API Call**: Sends multi-modal JSON payload

#### RiskGauge.jsx
- **Visualization**: Circular SVG gauge
- **Colors**: Green (<0.4), Orange (0.4-0.7), Red (>0.7)
- **Animation**: Smooth transitions with framer-motion

#### DonutChart.jsx
- **Purpose**: Risk breakdown by modality
- **Segments**: Anomaly score, failure probability, log risk
- **Interactive**: Hover tooltips

#### MetricCard.jsx
- **Layout**: Icon + Title + Value
- **Colors**: Configurable (blue, green, orange, red, purple)

#### AnomalyTable.jsx
- **Features**: Expandable rows, pagination, sorting
- **Details**: Explanation values, root cause analysis

## API Request/Response Formats

### POST /api/v1/predict

**Request**:
```json
{
  "timeseries": {
    "values": [1.2, 1.5, 1.3, ... (50 values)]
  },
  "tabular": {
    "temperature": 85.0,
    "pressure": 110.0,
    "vibration": 0.7,
    "rotation_speed": 1600,
    "power_consumption": 280,
    "operating_hours": 6000
  },
  "logs": {
    "text": "ERROR: Connection timeout at 192.168.1.1"
  }
}
```

**Response**:
```json
{
  "anomaly_score": 0.72,
  "failure_probability": 0.68,
  "log_risk": 0.81,
  "final_risk_score": 0.73,
  "explanation_values": {
    "temperature": 0.42,
    "vibration": 0.28,
    "pressure": 0.15
  },
  "alert_triggered": true,
  "inference_latency_ms": 42.1
}
```

## Model Training

### Prerequisites
```bash
cd backend
python -m app.train.train_lstm      # Train LSTM autoencoder
python -m app.train.train_gru       # Train GRU autoencoder
python -m app.train.train_xgboost   # Train XGBoost classifier
```

Or train all at once:
```bash
python -m app.train.train_all
```

### Data Generation
- **Synthetic data** generated automatically if no training data exists
- **Cached** in `backend/data/` for faster subsequent training
- **Formats**: .npz (time-series), .csv (tabular)

### Model Storage
- **Location**: `backend/models/`
- **Formats**: 
  - LSTM/GRU: `.pth` (PyTorch)
  - XGBoost: `.json`
  - DistilBERT: Transformers cache

## Performance Metrics

### Expected Performance
- **ROC-AUC**: >0.95
- **Precision**: >0.92
- **Recall**: >0.90
- **Inference Latency**: <50ms (P95)
- **Throughput**: 100+ req/sec

### Resource Usage (Render Free Tier Lite Mode)
- **RAM**: ~800MB (all models loaded)
- **CPU**: 1 vCPU (sufficient for inference)
- **Disk**: ~2GB (models + data + code)
- **Bandwidth**: Minimal (<1GB/month for typical usage)

## Security Considerations

### Backend
- **CORS**: Configured to allow Vercel frontend origin
- **Environment Variables**: Never commit .env files
- **Secrets**: Use Render/Vercel environment variables for backend and frontend secrets

### Frontend
- **API URL**: Configured via environment variable
- **HTTPS**: Vercel provides managed SSL for frontend
- **Input Validation**: Client and server-side validation

## Monitoring & Logging

### System Health Check
```bash
curl https://<your-render-backend>.onrender.com/api/v1/system/health
```

Returns:
```json
{
  "status": "operational",
  "uptime_percentage": 99.9,
  "models": {
    "lstm_loaded": true,
    "gru_loaded": true,
    "xgboost_loaded": true,
    "bert_loaded": true
  },
  "performance": {
    "throughput_per_sec": 120,
    "avg_latency_ms": 38.2,
    "p95_latency_ms": 48.7
  },
  "drift_status": {
    "total_events": 3,
    "active_drifts": 0
  },
  "alert_summary": {
    "total": 15,
    "critical": 2,
    "high": 5,
    "medium": 6,
    "low": 2
  }
}
```

### Logs
- **Location**: `/var/log/sentinelai/` (if systemd)
- **Format**: JSON structured logs
- **Rotation**: Daily with 7-day retention

## Troubleshooting

### Backend Not Starting
```bash
# Check service status
sudo systemctl status sentinelai

# View logs
sudo journalctl -u sentinelai -f

# Test manually
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Models Not Loading
```bash
# Verify model files exist
ls -lh backend/models/

# Retrain if missing
python -m app.train.train_all
```

### High Latency
- Check Render memory usage and logs
- Consider upgrading Render plan if enabling heavier models
- Enable model caching (already implemented)

### CORS Errors
- Verify `VITE_API_URL` in frontend .env
- Check FastAPI CORS middleware configuration
- Ensure backend CORS allows Vercel domain

## Render + Vercel Deployment Checklist

1. Render service is running in lite model mode for free-tier memory limits.
2. Backend environment variables are configured (`MODEL_DIR`, `DATA_DIR`, `ENABLE_*`, `DATABASE_URL`).
3. Backend responds at `/health` and `/api/v1/system/health`.
4. Frontend environment variable `VITE_API_URL` points to backend `/api/v1`.
5. `ALLOWED_ORIGINS` includes Vercel frontend domain.
6. Render health check `/health` is passing continuously.
7. At least one prediction request is persisted and retrievable from `/api/v1/history`.
8. Monitoring and backups are enabled for production workloads.

## Deployment Profiles

Two deployment profiles are supported in this repository:

1. `render.yaml` (current default)
- Backend on Render free web service
- Lightweight model toggles enabled by default
- SQLite for demo persistence

2. Vercel frontend deployment
- Frontend hosted from `frontend/`
- API base URL configured via `VITE_API_URL`

## Scaling Considerations

### Horizontal Scaling
- Deploy multiple backend instances on Render paid plans
- Use managed PostgreSQL when moving beyond demo persistence
- Implement Redis for model caching

### Vertical Scaling
- Upgrade Render instance size (CPU/RAM)
- Move heavy NLP inference to a separate model service if required

### Production Optimizations
- Use Gunicorn with multiple workers
- Enable HTTP/2 at reverse proxy level
- Use Vercel CDN for static frontend assets
- Use external object storage for model artifact storage
- Add periodic backups and monitoring alerts

## License
MIT
