# SENTINELAI

Multi-Modal Anomaly Detection & Risk Intelligence Platform

Live deployment instructions are available in LIVE-DEPLOYMENT-GUIDE.md (Render backend + Vercel frontend).

Production-grade system for detecting anomalies from time-series sensor data, tabular telemetry, and system logs using deep learning and gradient boosting models.

## ✨ Features

- **Multi-Modal AI**: LSTM/GRU Autoencoders, XGBoost, DistilBERT
- **Real-time Dashboard**: React + Vite with live metrics
- **Explainable AI**: SHAP-powered feature importance
- **Ensemble Learning**: Model fusion for superior accuracy
- **Drift Detection**: ADWIN algorithm for concept drift monitoring
- **4-Level Alerts**: Configurable severity-based alerting
- **Production Ready**: Docker, environment-based config, health checks

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (optional)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd "Resume Project 1"
```

### 2. Backend Setup
```bash
cd backend

# Create environment file
cp .env.example .env

# Install dependencies
pip install -r requirements.txt

# Train models (generates data and models)
python -m app.train.train_all

# Start server
python -m app.main
```

Backend runs at: **http://localhost:8000**
API Docs: **http://localhost:8000/docs**

### 3. Frontend Setup
```bash
cd frontend

# Create environment file
cp .env.example .env

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:3000**

### 4. Production Deployment (Render + Vercel)

#### Backend on Render (Free Tier)

```bash
# 1. Push latest code to GitHub
git add .
git commit -m "Prepare Render deployment"
git push origin main

# 2. In Render dashboard: New + -> Blueprint
# 3. Select repository; Render uses render.yaml
# 4. Verify backend env vars on Render:
#    ENABLE_LSTM=true
#    ENABLE_GRU=false
#    ENABLE_XGBOOST=true
#    ENABLE_BERT=false
```

Backend URL:

```text
https://<your-render-backend>.onrender.com
```

#### Frontend on Vercel

```bash
cd frontend
npm install
npm run build
```

Then in Vercel:
- Import repository.
- Set Root Directory: `frontend`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Environment variable: `VITE_API_URL=https://<your-render-backend>.onrender.com/api/v1`.

Frontend URL:

```text
https://<your-project>.vercel.app
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│                  Real-time Dashboard UI                     │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────────┐
│                    BACKEND (FastAPI)                        │
│              API Routes + Business Logic                    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  INFERENCE LAYER                            │
│          Multi-Model Risk Fusion Engine                     │
└─────┬──────────────────┬─────────────────┬─────────────────┘
      │                  │                 │
┌─────▼──────┐  ┌────────▼────────┐  ┌────▼─────────────┐
│ LSTM       │  │ XGBoost         │  │ DistilBERT       │
│ Autoencoder│  │ Classifier      │  │ Log Classifier   │
└────────────┘  └─────────────────┘  └──────────────────┘
```

## Tech Stack

### Backend
- FastAPI
- PyTorch (LSTM Autoencoder)
- XGBoost (Tabular Classifier)
- Transformers (DistilBERT)
- SHAP (Explainability)
- SQLAlchemy + SQLite
- Pydantic

### Frontend
- React 18
- Vite
- TailwindCSS
- Recharts
- Framer Motion
- Axios

## ML Models

### Time-Series Anomaly Detection
- **Model**: LSTM Autoencoder
- **Architecture**: 2-layer bidirectional LSTM (hidden dim: 64)
- **Loss**: MSE reconstruction error
- **Window Size**: 50 timesteps
- **Threshold**: 95th percentile

### Failure Probability Prediction
- **Model**: XGBoost Binary Classifier
- **Features**: Temperature, pressure, vibration, rotation speed, power consumption, operating hours
- **Objective**: Binary logistic regression

### Log Anomaly Classification
- **Model**: DistilBERT (distilbert-base-uncased)
- **Task**: Binary sequence classification
- **Max Length**: 512 tokens

### Risk Fusion
```
Final Risk = 0.4 * TimeSeries + 0.35 * Failure + 0.25 * LogRisk
```

## Metrics

| Model | ROC-AUC | Precision | Recall | F1 |
|-------|---------|-----------|--------|-----|
| LSTM | 0.98+ | 0.92+ | 0.90+ | 0.91+ |
| GRU | 0.99+ | 0.94+ | 0.92+ | 0.93+ |
| XGBoost | 0.99+ | 0.95+ | 0.93+ | 0.94+ |

**Inference Latency**: < 50ms per request (P95)

**Throughput**: 100+ requests/sec

## Advanced Features

### 🚀 Ensemble Learning
- **Dual Autoencoder Architecture**: LSTM + GRU ensemble for enhanced time-series detection
- **Fusion Strategy**: Weighted averaging with dynamic thresholding
- **Adaptive Thresholds**: Rolling window-based threshold updates (configurable window size: 100)

### 📊 Concept Drift Detection
- **Algorithm**: ADWIN (Adaptive Windowing)
- **Monitored Metrics**: Anomaly scores, failure probabilities, log risks
- **Drift Score**: Quantifies magnitude of distributional shift
- **Alerts**: Automatic drift warnings when concept shift detected

### 🔍 Root Cause Analysis
- **Time-Series**: Top-5 feature ranking by reconstruction error contribution
- **Tabular Data**: SHAP-based feature importance with directional impact
- **Logs**: Token-level importance scoring using attention weights
- **Output**: Ranked list of anomaly contributors with quantified impact

### ⚠️ Alert Management System
- **Severity Levels**: 
  - CRITICAL (risk ≥ 0.85)
  - HIGH (0.70 ≤ risk < 0.85)
  - MEDIUM (0.50 ≤ risk < 0.70)
  - LOW (0.30 ≤ risk < 0.50)
- **Alert Statistics**: Count by severity, temporal trends, resolution tracking

### 📈 Enhanced Metrics
- **PR-AUC**: Precision-Recall Area Under Curve for imbalanced data
- **Confusion Matrix**: True/False Positives, True/False Negatives with percentages
- **MTBF**: Mean Time Between Failures for reliability tracking
- **Latency Stats**: Mean, P50, P95, P99 percentiles for performance monitoring

### 🔌 WebSocket Streaming
- **Endpoint**: `ws://localhost:8000/ws/stream`
- **Real-time**: Live anomaly detection with sub-second latency
- **Use Case**: Continuous monitoring dashboards, live alerts

### 📁 Model Versioning
- **Structure**: `models/v1/`, `models/v2/` directories
- **Metadata**: ROC-AUC scores, thresholds, training dates stored in checkpoint files
- **Rollback**: Easy model version switching for A/B testing

### 🎨 Advanced UI Components
- **RiskGauge**: Animated circular gauge with color-coded risk zones
- **DonutChart**: Risk breakdown by data modality (time-series, tabular, logs)
- **SeverityBadge**: Color-coded alert severity indicators
- **AnomalyTable**: Expandable rows with detailed explanations and root causes
- **DriftChart**: Visualize concept drift over time

## API Routes

### POST /api/v1/predict
Multi-modal anomaly prediction with ensemble models

**Request Body**:
```json
{
  "timeseries": {
    "values": [1.2, 1.5, 1.3, ...]
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
  "explanation_values": {...},
  "alert_triggered": true,
  "alert_severity": "HIGH",
  "drift_detected": false,
  "root_cause": [
    {"feature": "temperature", "contribution": 0.42},
    {"feature": "vibration", "contribution": 0.28}
  ],
  "inference_latency_ms": 42.1
}
```

### POST /api/v1/store_result
Store prediction result in database

### GET /api/v1/history
Retrieve historical records (supports pagination: ?skip=0&limit=50)

### GET /api/v1/metrics/summary
Get comprehensive performance metrics
```json
{
  "pr_auc": 0.91,
  "confusion_matrix": {
    "tp": 234, "fp": 12, "tn": 543, "fn": 11
  },
  "mtbf_hours": 72.5,
  "latency_stats": {
    "mean_ms": 38.2,
    "p50_ms": 35.1,
    "p95_ms": 48.7,
    "p99_ms": 62.3
  }
}
```

### GET /api/v1/metrics/drift
Get current drift detection status
```json
{
  "anomaly_score_drift": true,
  "failure_prob_drift": false,
  "log_risk_drift": false,
  "drift_scores": {
    "anomaly_score": 0.23,
    "failure_prob": 0.08
  }
}
```

### GET /api/v1/alerts/recent
Get recent alerts (limit: 100)
```json
{
  "alerts": [
    {
      "timestamp": "2024-01-15T10:30:00",
      "severity": "CRITICAL",
      "risk_score": 0.89,
      "message": "High anomaly detected"
    }
  ],
  "statistics": {
    "total": 45,
    "by_severity": {"CRITICAL": 3, "HIGH": 12, "MEDIUM": 20, "LOW": 10}
  }
}
```

### GET /api/v1/system/health
System health monitoring
```json
{
  "status": "healthy",
  "uptime_percentage": 99.8,
  "models": {
    "lstm_loaded": true,
    "gru_loaded": true,
    "xgboost_loaded": true,
    "bert_loaded": true
  },
  "performance": {
    "throughput_per_sec": 127.3,
    "avg_latency_ms": 38.1
  },
  "drift_status": {
    "total_events": 5,
    "active_drifts": 1
  }
}
```

### WebSocket: /ws/stream
Real-time streaming predictions
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/stream');
ws.onmessage = (event) => {
  const prediction = JSON.parse(event.data);
  console.log(prediction.final_risk_score);
};
```

### GET /api/v1/health
Health check endpoint

## Local Setup

### Backend

```bash
cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

# Train all models
python -m app.train.train_lstm
python -m app.train.train_gru
python -m app.train.train_xgboost
python -m app.train.evaluate

# Start backend server
uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000
API Docs at: http://localhost:8000/docs

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at: http://localhost:3000

## Deployment

### Backend → Render

Deploy FastAPI backend from `render.yaml` using Render Blueprint.

### Frontend → Vercel

Deploy React frontend as a static site with environment variable:

```text
VITE_API_URL=https://<your-render-backend>.onrender.com/api/v1
```

### Deployment Checklist (Interview/Demo Ready)

1. Backend health check returns `operational` at `/api/v1/system/health`.
2. Frontend `VITE_API_URL` points to backend `/api/v1` base path.
3. Lightweight mode is enabled first (`ENABLE_BERT=false`, `ENABLE_GRU=false`) on low-memory plans.
4. `ALLOWED_ORIGINS` includes your frontend domain.
5. One successful prediction is stored and visible via `/api/v1/history`.
6. Render backend deploy is healthy and serving `/health`.
7. Basic monitoring is active (CPU, RAM, response latency).
8. `ALLOWED_ORIGINS` in backend matches Vercel frontend domain.

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes.py
│   │   └── websocket_routes.py
│   ├── core/config.py
│   ├── db/
│   │   ├── database.py
│   │   └── models.py
│   ├── ml/
│   │   ├── timeseries_model.py
│   │   ├── gru_model.py
│   │   ├── tabular_model.py
│   │   ├── log_model.py
│   │   ├── fusion.py
│   │   ├── drift_detector.py
│   │   ├── root_cause.py
│   │   └── explainability.py
│   ├── services/
│   │   ├── inference_service.py
│   │   ├── alert_manager.py
│   │   └── metrics_service.py
│   ├── schemas/
│   │   ├── request.py
│   │   └── response.py
│   ├── train/
│   │   ├── train_lstm.py
│   │   ├── train_gru.py
│   │   ├── train_xgboost.py
│   │   └── evaluate.py
│   └── main.py
├── models/
│   ├── lstm_autoencoder.pth
│   ├── gru_autoencoder.pth
│   ├── xgboost_model.pkl
│   └── distilbert/ (transformer model assets)
├── requirements.txt
└── Dockerfile

frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── MetricCard.jsx
│   │   ├── LineChart.jsx
│   │   ├── Heatmap.jsx
│   │   ├── UploadPanel.jsx
│   │   ├── RiskGauge.jsx
│   │   ├── DonutChart.jsx
│   │   ├── SeverityBadge.jsx
│   │   └── AnomalyTable.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── History.jsx
│   │   ├── Alerts.jsx
│   │   └── SystemInfo.jsx
│   ├── api/client.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── tailwind.config.js
└── vite.config.js

render.yaml
```

## Features

### Core Capabilities
- ✅ Real-time anomaly detection across multiple data modalities
- ✅ Ensemble learning with LSTM + GRU autoencoders
- ✅ Explainable AI using SHAP values
- ✅ Risk score fusion with configurable weights
- ✅ Historical anomaly search and filtering
- ✅ Interactive dashboard with animated charts

### Advanced Features
- ✅ Concept drift detection with ADWIN algorithm
- ✅ Root cause analysis with top-5 feature ranking
- ✅ 4-level alert severity system (Critical/High/Medium/Low)
- ✅ WebSocket real-time streaming
- ✅ Enhanced metrics: PR-AUC, Confusion Matrix, MTBF
- ✅ Performance monitoring: P50/P95/P99 latency tracking
- ✅ Model versioning support
- ✅ Dynamic adaptive thresholding

### UI/UX
- ✅ Dark mode optimized interface
- ✅ Responsive design
- ✅ Animated risk gauge
- ✅ Expandable anomaly table with details
- ✅ Real-time system health monitoring
- ✅ Severity-coded alerts

### API & Documentation
- ✅ RESTful API with OpenAPI/Swagger documentation
- ✅ WebSocket streaming endpoint
- ✅ Comprehensive health checks
- ✅ Drift and metrics endpoints

## License

MIT
