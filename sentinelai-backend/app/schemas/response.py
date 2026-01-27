from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class PredictionResponse(BaseModel):
    anomaly_score: float
    failure_probability: float
    log_risk: float
    final_risk_score: float
    explanation_values: Optional[Dict] = None
    alert_triggered: bool
    inference_latency_ms: float


class HistoryItem(BaseModel):
    id: int
    timestamp: datetime
    anomaly_score: float
    failure_probability: float
    log_risk: float
    final_risk_score: float
    alert_triggered: bool
    
    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    total: int
    records: List[HistoryItem]


class MetricsResponse(BaseModel):
    roc_auc: float
    precision: float
    recall: float
    f1_score: float
    avg_inference_latency_ms: float
    throughput_per_sec: float
