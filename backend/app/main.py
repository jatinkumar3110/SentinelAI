import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.websocket_routes import router as websocket_router
from app.db.database import init_db
from app.core.config import settings
from app.core.model_registry import load_all_models

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multi-Modal Anomaly Detection & Risk Intelligence Platform"
)

# CORS Configuration
raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
allow_all_origins = "*" in allowed_origins

# If wildcard is used, credentials must be disabled for standards-compliant browser behavior.
cors_allow_origins = ["*"] if allow_all_origins else allowed_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_allow_origins,
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix=settings.API_PREFIX)
app.include_router(websocket_router, prefix=settings.API_PREFIX)


@app.on_event("startup")
def startup_event():
    # Preload resources once per process to reduce first-request cold-start latency.
    init_db()
    settings.MODEL_DIR.mkdir(parents=True, exist_ok=True)
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    load_all_models()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
