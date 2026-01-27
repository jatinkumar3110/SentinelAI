from fastapi import APIRouter
from pydantic import BaseModel
from app.services.inference import get_prediction

router = APIRouter()


class PredictRequest(BaseModel):
    text: str


class PredictResponse(BaseModel):
    label: str
    confidence: float


@router.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    result = get_prediction(request.text)
    return result


@router.get("/history", response_model=HistoryResponse)
async def get_history(limit: int = 100, offset: int = 0, db: Session = Depends(get_db)):
    """
    Retrieve historical anomaly detection records.
    """
    
    try:
        total = db.query(AnomalyRecord).count()
        
        records = db.query(AnomalyRecord)\
            .order_by(AnomalyRecord.timestamp.desc())\
            .offset(offset)\
            .limit(limit)\
            .all()
        
        history_items = [
            HistoryItem(
                id=record.id,
                timestamp=record.timestamp,
                anomaly_score=record.anomaly_score,
                failure_probability=record.failure_probability,
                log_risk=record.log_risk,
                final_risk_score=record.final_risk_score,
                alert_triggered=bool(record.alert_triggered)
            )
            for record in records
        ]
        
        return HistoryResponse(total=total, records=history_items)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve history: {str(e)}")


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {
        "status": "healthy",
        "models_loaded": {
            "lstm": inference_service.ts_detector.model is not None,
            "gru": inference_service.gru_detector.model is not None,
            "xgboost": inference_service.tabular_predictor.model is not None,
            "bert": inference_service.log_classifier.model is not None
        }
    }


@router.get("/metrics/summary")
async def get_metrics_summary():
    """
    Get comprehensive metrics summary including confusion matrix, PR-AUC, MTBF.
    """
    try:
        summary = inference_service.metrics_aggregator.get_summary()
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")


@router.get("/metrics/drift")
async def get_drift_metrics():
    """
    Get drift detection metrics and status.
    """
    try:
        drift_summary = inference_service.drift_monitor.get_summary()
        return drift_summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get drift metrics: {str(e)}")


@router.get("/alerts/recent")
async def get_recent_alerts(limit: int = 50):
    """
    Get recent alerts with severity levels.
    """
    try:
        alerts = inference_service.alert_manager.get_recent_alerts(limit)
        stats = inference_service.alert_manager.get_alert_stats()
        return {
            "alerts": alerts,
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get alerts: {str(e)}")


@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: int):
    """
    Acknowledge a specific alert.
    """
    try:
        success = inference_service.alert_manager.acknowledge_alert(alert_id)
        if success:
            return {"status": "success", "alert_id": alert_id}
        else:
            raise HTTPException(status_code=404, detail="Alert not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to acknowledge alert: {str(e)}")


@router.get("/system/health")
async def get_system_health():
    """
    Get comprehensive system health information.
    """
    try:
        metrics = inference_service.metrics_aggregator.get_summary()
        drift = inference_service.drift_monitor.get_summary()
        alerts = inference_service.alert_manager.get_alert_stats()
        
        return {
            "status": "operational",
            "uptime_percentage": 99.9,
            "models": {
                "lstm_loaded": inference_service.ts_detector.model is not None,
                "gru_loaded": inference_service.gru_detector.model is not None,
                "xgboost_loaded": inference_service.tabular_predictor.model is not None,
                "bert_loaded": inference_service.log_classifier.model is not None
            },
            "performance": {
                "throughput_per_sec": metrics.get('throughput_per_sec', 0),
                "avg_latency_ms": metrics.get('latency', {}).get('mean', 0),
                "p95_latency_ms": metrics.get('latency', {}).get('p95', 0)
            },
            "drift_status": {
                "total_events": drift.get('total_drift_events', 0),
                "active_drifts": sum(1 for d in drift.get('detectors', {}).values() if d.get('drift_detected', False))
            },
            "alert_summary": alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get system health: {str(e)}")
