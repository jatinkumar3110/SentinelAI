# 🚀 SentinelAI - Production Deployment Guide

## 📋 Prerequisites

- Docker & Docker Compose (for containerized deployment)
- Python 3.10+ (for local deployment)
- Node.js 18+ (for frontend)

## 🔧 Backend Deployment

### Environment Setup

1. **Copy environment template:**
```bash
cd backend
cp .env.example .env
```

2. **Configure environment variables in `.env`:**
```env
MODEL_PATH=backend/models
DATA_PATH=backend/data
DATABASE_URL=sqlite:///./data.db
PORT=8000
HOST=0.0.0.0
API_V1_PREFIX=/api/v1
```

### Local Deployment

```bash
# Install dependencies
pip install -r requirements.txt

# Train models (generates data and models)
python -m app.train.train_all

# Start server
python -m app.main
```

### Docker Deployment

```bash
# Build image
docker build -t sentinelai-backend .

# Run container
docker run -d \
  -p 8000:8000 \
  -v $(pwd)/backend/models:/app/backend/models \
  -v $(pwd)/backend/data:/app/backend/data \
  --env-file .env \
  --name sentinelai \
  sentinelai-backend

# Check health
curl http://localhost:8000/health
```

### Production (Gunicorn)

```bash
# Make start script executable
chmod +x start.sh

# Start with gunicorn
./start.sh
```

## 🌐 Frontend Deployment

### Environment Setup

1. **Copy environment template:**
```bash
cd frontend
cp .env.example .env
```

2. **Configure API URL in `.env`:**
```env
VITE_API_URL=http://localhost:8000/api/v1
# Or for production:
# VITE_API_URL=https://your-api-domain.com/api/v1
```

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy 'dist' folder to static hosting
```

### Netlify Deployment

1. **Connect your repository to Netlify**
2. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variable: `VITE_API_URL`

3. **The `netlify.toml` is already configured for SPAs**

## 🐳 Docker Compose (Full Stack)

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=backend/models
      - DATA_PATH=backend/data
      - PORT=8000
    volumes:
      - ./backend/models:/app/backend/models
      - ./backend/data:/app/backend/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://localhost:8000/api/v1
    depends_on:
      - backend
```

Run with:
```bash
docker-compose up -d
```

## 📊 Model Training

All training scripts now cache data to `backend/data/`:

```bash
# Train individual models
python -m app.train.train_lstm      # Trains LSTM, saves to backend/models/
python -m app.train.train_gru       # Trains GRU, saves to backend/models/
python -m app.train.train_xgboost   # Trains XGBoost, saves to backend/models/

# Train all at once
python -m app.train.train_all
```

## 🔒 Security Notes

- Never commit `.env` files (already in `.gitignore`)
- Use `.env.example` as template only
- In production, use proper secret management
- Enable HTTPS/TLS for API endpoints
- Configure CORS properly for production domains

## 📁 Directory Structure

```
backend/
├── models/          # ML model files (created by training)
├── data/           # Training data cache (created by training)
├── .env           # Environment variables (create from .env.example)
├── .env.example   # Environment template
├── start.sh       # Production startup script
├── Dockerfile     # Container definition
└── .dockerignore  # Docker ignore rules

frontend/
├── dist/          # Production build output
├── .env          # Environment variables (create from .env.example)
├── .env.example  # Environment template
└── netlify.toml  # Netlify deployment config
```

## ✅ Deployment Checklist

### Backend
- [ ] Copy `.env.example` to `.env` and configure
- [ ] Train models: `python -m app.train.train_all`
- [ ] Verify models exist in `backend/models/`
- [ ] Test health endpoint: `curl http://localhost:8000/health`
- [ ] Check API docs: `http://localhost:8000/docs`

### Frontend
- [ ] Copy `.env.example` to `.env` and configure `VITE_API_URL`
- [ ] Install dependencies: `npm install`
- [ ] Build: `npm run build`
- [ ] Test build: `npm run preview`
- [ ] Deploy `dist/` folder

## 🚦 Endpoints

- **Health Check:** `GET /health` → `{"status": "ok"}`
- **API Docs:** `/docs` (Swagger UI)
- **Predict:** `POST /api/v1/predict`
- **System Info:** `GET /api/v1/system/health`

## 🔍 Troubleshooting

### Backend won't start
- Check `.env` file exists and has correct paths
- Verify Python version: `python --version` (need 3.10+)
- Check port availability: `lsof -i :8000`

### Models not loading
- Ensure models are trained: `python -m app.train.train_all`
- Check `MODEL_PATH` in `.env` points to correct directory
- Verify files exist: `ls backend/models/`

### Frontend can't connect to API
- Verify `VITE_API_URL` in `.env` is correct
- Check backend is running: `curl http://localhost:8000/health`
- Check CORS settings in `backend/app/main.py`

## 📈 Monitoring

The application includes:
- Health check endpoint at `/health`
- Built-in metrics aggregation
- Request/response logging (when using gunicorn)

## 🎯 Performance

- **Latency Target:** <50ms P95
- **Throughput:** 100+ req/s
- **Model Accuracy:** ROC-AUC 0.99+

---

**Ready for Production! 🎉**
