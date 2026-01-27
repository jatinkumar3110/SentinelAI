# SENTINELAI - Quick Start Guide

## Prerequisites
- Python 3.10
- Node.js 18+
- 4GB+ RAM recommended

## Initial Setup

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train all models (this will take 5-10 minutes)
python train_all.py

# Start backend server
uvicorn app.main:app --reload
```

Backend will be running at: http://localhost:8000

API Documentation: http://localhost:8000/docs

### 2. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be running at: http://localhost:3000

## Testing the System

### Option 1: Using the UI
1. Open http://localhost:3000 in your browser
2. Navigate to Dashboard
3. Enter sample data in the Input Panel:
   - Time-Series: `1.2, 1.5, 1.3, 1.8, 2.1, 1.9, 1.7, 1.6, 1.4, 1.3`
   - Tabular: Use default values or modify
   - Log Text: `ERROR: Connection timeout at 192.168.1.1`
4. Click "Predict Anomaly"
5. View results in real-time

### Option 2: Using cURL

```bash
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{
    "tabular": {
      "temperature": 95.0,
      "pressure": 120.0,
      "vibration": 0.9,
      "rotation_speed": 1800,
      "power_consumption": 320,
      "operating_hours": 8000
    }
  }'
```

## Project Features

✓ LSTM Autoencoder for time-series anomaly detection
✓ XGBoost for failure probability prediction
✓ DistilBERT for log anomaly classification
✓ SHAP-based explainability
✓ Risk fusion engine
✓ Real-time dashboard
✓ Historical anomaly tracking
✓ Alert management system

## Production Deployment

### Backend → Render
1. Push code to GitHub
2. Create new Web Service on Render
3. Select Dockerfile deployment
4. Set port to 8000
5. Deploy

### Frontend → Netlify
1. Run `npm run build` in frontend directory
2. Drag `dist/` folder to Netlify
3. Set environment variable: `VITE_API_URL=<your-backend-url>`
4. Deploy

## Troubleshooting

### Backend Issues
- If models fail to load: Run `python train_all.py`
- If port 8000 is busy: Change port in `app/main.py`
- CUDA errors: Models will fall back to CPU automatically

### Frontend Issues
- If API calls fail: Check backend is running and CORS is enabled
- Build errors: Delete `node_modules` and run `npm install` again
- Port 3000 busy: Vite will automatically use port 3001

## Support
For issues, check the logs:
- Backend: Terminal output where uvicorn is running
- Frontend: Browser console (F12)

## Next Steps
- Customize risk fusion weights in `backend/app/core/config.py`
- Add custom data sources
- Fine-tune models on your domain-specific data
- Implement authentication
- Add email/SMS alert notifications
