# SentinelAI Text Classifier

Sentiment classification API using DistilBERT fine-tuned on SST-2.

## What This Does

- **Model**: `distilbert-base-uncased-finetuned-sst-2-english`
- **Task**: Binary sentiment classification (POSITIVE/NEGATIVE)
- **Framework**: FastAPI + Transformers
- **Deployment**: Hugging Face Spaces, Render, Docker

## Environment Variables

```bash
MODEL_NAME=distilbert-base-uncased-finetuned-sst-2-english
PORT=7860
```

## Local Run

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python -m uvicorn app.main:app --host 0.0.0.0 --port 7860
```

## Docker Run

```bash
# Build
docker build -t sentinelai-backend .

# Run
docker run -p 7860:7860 sentinelai-backend
```

## Hugging Face Spaces Deployment

1. Create new Space (SDK: Docker)
2. Upload all backend files
3. Set Space settings:
   - **Port**: 7860
   - **Environment Variables**: 
     - `MODEL_NAME=distilbert-base-uncased-finetuned-sst-2-english`
     - `PORT=7860`
4. Push to Space repository

## Render Deployment

1. Create new Web Service
2. Connect repository
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `bash start.sh`
4. Add environment variables:
   - `MODEL_NAME=distilbert-base-uncased-finetuned-sst-2-english`
   - `PORT=7860`

## API Endpoints

### Health Check
```
GET /health
Response: {"status": "ok"}
```

### Predict
```
POST /predict
Body: {"text": "I love this!"}
Response: {"label": "POSITIVE", "confidence": 0.9998}
```

## Model Info

- Downloads from Hugging Face Hub at startup
- Cached automatically by transformers library
- No model files stored in repository
- First request may be slower (model download)
