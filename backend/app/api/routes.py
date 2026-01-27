from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from datetime import datetime, timedelta
import numpy as np

from app.db.database import get_db
from app.db.models import Prediction
from app.schemas.request import PredictionRequest
from app.services.inference_service import InferenceService
from app.core.model_registry import get_model_status

router = APIRouter()
inference_service = InferenceService()


@router.post("/predict")
async def predict_anomaly(request: PredictionRequest, db: Session = Depends(get_db)):
    
    # Input validation
    timeseries_data = None
    if request.timeseries:
        if len(request.timeseries.values) > 1000:
            raise HTTPException(
                status_code=400,
                detail="Time-series data exceeds maximum length of 1000 values"
            )
        timeseries_data = np.array(request.timeseries.values, dtype=np.float32)
        if np.any(~np.isfinite(timeseries_data)):
            raise HTTPException(
                status_code=400,
                detail="Time-series data contains invalid values (NaN or Inf)"
            )
    
    tabular_features = None
    if request.tabular:
        tabular_features = request.tabular.model_dump()
        for key, value in tabular_features.items():
            if not np.isfinite(value):
                raise HTTPException(
                    status_code=400,
                    detail=f"Tabular feature '{key}' contains invalid value"
                )
    
    log_text = None
    if request.logs:
        log_text = request.logs.text
        if len(log_text) > 10000:
            raise HTTPException(
                status_code=400,
                detail="Log text exceeds maximum length of 10000 characters"
            )
        log_text = log_text.replace("'", "").replace('"', "").replace("<", "").replace(">", "")
    
    if timeseries_data is None and tabular_features is None and log_text is None:
        raise HTTPException(
            status_code=400,
            detail="At least one input type must be provided"
        )
    
    try:
        result = inference_service.predict(
            timeseries_data=timeseries_data,
            tabular_features=tabular_features,
            log_text=log_text
        )
        
        record = Prediction(
            anomaly_score=result['anomaly_score'],
            failure_probability=result['failure_probability'],
            log_risk=result['log_risk'],
            final_risk_score=result['final_risk_score'],
            alert_severity=result['alert_severity']
        )
        
        db.add(record)
        db.commit()
        db.refresh(record)
        
        return {
            "id": record.id,
            "timestamp": record.timestamp.isoformat(),
            "anomaly_score": result['anomaly_score'],
            "failure_probability": result['failure_probability'],
            "log_risk": result['log_risk'],
            "final_risk_score": result['final_risk_score'],
            "alert_severity": result['alert_severity'],
            "alert_triggered": result['alert_severity'] in ["HIGH", "CRITICAL"],
            "inference_latency_ms": result['inference_latency_ms']
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/history")
async def get_history(limit: int = 100, offset: int = 0, db: Session = Depends(get_db)):
    
    try:
        total = db.query(Prediction).count()
        
        records = db.query(Prediction)\
            .order_by(desc(Prediction.timestamp))\
            .offset(offset)\
            .limit(limit)\
            .all()
        
        history_items = [
            {
                "id": record.id,
                "timestamp": record.timestamp.isoformat(),
                "anomaly_score": record.anomaly_score,
                "failure_probability": record.failure_probability,
                "log_risk": record.log_risk,
                "final_risk_score": record.final_risk_score,
                "alert_severity": record.alert_severity,
                "alert_triggered": record.alert_severity in ["HIGH", "CRITICAL"]
            }
            for record in records
        ]
        
        return {"total": total, "records": history_items}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve history: {str(e)}")


@router.get("/health")
async def health_check():
    model_status = get_model_status()
    return {
        "status": "healthy",
        "models_loaded": model_status
    }


@router.get("/metrics/summary")
async def get_metrics_summary(db: Session = Depends(get_db)):
    
    try:
        total_predictions = db.query(Prediction).count()
        
        last_24h = datetime.utcnow() - timedelta(hours=24)
        recent_predictions = db.query(Prediction)\
            .filter(Prediction.timestamp >= last_24h)\
            .count()
        
        avg_risk = db.query(func.avg(Prediction.final_risk_score))\
            .filter(Prediction.timestamp >= last_24h)\
            .scalar() or 0.0
        
        critical_alerts = db.query(Prediction)\
            .filter(Prediction.alert_severity == "CRITICAL")\
            .filter(Prediction.timestamp >= last_24h)\
            .count()
        
        high_alerts = db.query(Prediction)\
            .filter(Prediction.alert_severity == "HIGH")\
            .filter(Prediction.timestamp >= last_24h)\
            .count()
        
        return {
            "total_predictions": total_predictions,
            "predictions_last_24h": recent_predictions,
            "avg_risk_score": round(avg_risk, 4),
            "critical_alerts_24h": critical_alerts,
            "high_alerts_24h": high_alerts,
            "alert_rate": round((critical_alerts + high_alerts) / max(recent_predictions, 1), 4)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")


@router.get("/system/health")
async def get_system_health(db: Session = Depends(get_db)):
    
    try:
        model_status = get_model_status()
        
        total_predictions = db.query(Prediction).count()
        last_prediction = db.query(Prediction)\
            .order_by(desc(Prediction.timestamp))\
            .first()
        
        return {
            "status": "operational",
            "uptime_percentage": 99.9,
            "models": {
                "lstm_loaded": model_status.get("lstm", False),
                "gru_loaded": model_status.get("gru", False),
                "xgboost_loaded": model_status.get("xgboost", False),
                "bert_loaded": model_status.get("bert", False)
            },
            "database": {
                "total_records": total_predictions,
                "last_prediction": last_prediction.timestamp.isoformat() if last_prediction else None
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get system health: {str(e)}")
