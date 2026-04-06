import os
from pydantic_settings import BaseSettings
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str = "SENTINELAI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = os.getenv("API_V1_PREFIX", "/api/v1")
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sentinelai.db")
    
    # Model/data paths: prefer MODEL_DIR + DATA_DIR, keep MODEL_PATH + DATA_PATH for backward compatibility
    MODEL_DIR: Path = Path(os.getenv("MODEL_DIR", os.getenv("MODEL_PATH", "models")))
    DATA_DIR: Path = Path(os.getenv("DATA_DIR", os.getenv("DATA_PATH", "data")))
    
    # Model paths
    LSTM_MODEL_PATH: Path = MODEL_DIR / "lstm_autoencoder.pth"
    XGBOOST_MODEL_PATH: Path = MODEL_DIR / "xgboost_classifier.json"
    BERT_MODEL_PATH: Path = MODEL_DIR / "distilbert_logs"
    
    # Server configuration for AWS EC2
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    TIMESERIES_WINDOW_SIZE: int = 50
    LSTM_HIDDEN_DIM: int = 64
    ANOMALY_THRESHOLD_PERCENTILE: int = 95
    
    RISK_WEIGHT_TIMESERIES: float = 0.4
    RISK_WEIGHT_FAILURE: float = 0.35
    RISK_WEIGHT_LOG: float = 0.25
    
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024
    
    class Config:
        case_sensitive = True


settings = Settings()
