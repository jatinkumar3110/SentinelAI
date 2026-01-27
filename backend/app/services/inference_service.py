import time
import numpy as np
import torch
import xgboost as xgb
from typing import Dict, Optional
from app.core.model_registry import get_models, get_model_status


def run_inference(input_payload: Dict) -> Dict:
    start_time = time.time()
    
    models = get_models()
    
    anomaly_score = 0.0
    failure_probability = 0.0
    log_risk = 0.0
    
    # Time-series inference (LSTM + GRU)
    if input_payload.get("time_series_data") and models.get("lstm") and models.get("gru"):
        ts_data = np.array(input_payload["time_series_data"], dtype=np.float32)
        ts_tensor = torch.FloatTensor(ts_data).unsqueeze(0).unsqueeze(-1)
        
        with torch.no_grad():
            lstm_recon = models["lstm"](ts_tensor)
            gru_recon = models["gru"](ts_tensor)
            
            lstm_error = torch.mean((ts_tensor - lstm_recon) ** 2).item()
            gru_error = torch.mean((ts_tensor - gru_recon) ** 2).item()
            
            anomaly_score = float((lstm_error + gru_error) / 2)
    
    # Tabular inference (XGBoost)
    if input_payload.get("tabular_features") and models.get("xgboost"):
        features = input_payload["tabular_features"]
        feature_array = np.array([[
            features.get("cpu_usage", 0),
            features.get("memory_usage", 0),
            features.get("disk_io", 0),
            features.get("network_throughput", 0),
            features.get("request_latency", 0)
        ]], dtype=np.float32)
        
        dmatrix = xgb.DMatrix(feature_array)
        pred = models["xgboost"].predict(dmatrix)
        failure_probability = float(pred[0])
    
    # Log inference (DistilBERT)
    if input_payload.get("log_text") and models.get("bert_model") and models.get("bert_tokenizer"):
        log_text = input_payload["log_text"][:512]
        
        inputs = models["bert_tokenizer"](
            log_text, 
            return_tensors="pt", 
            truncation=True, 
            max_length=128,
            padding=True
        )
        
        with torch.no_grad():
            outputs = models["bert_model"](**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=-1)
            log_risk = float(probs[0][2].item())
    
    # Fusion
    weights = {"timeseries": 0.4, "failure": 0.35, "log": 0.25}
    final_risk_score = (
        anomaly_score * weights["timeseries"] +
        failure_probability * weights["failure"] +
        log_risk * weights["log"]
    )
    
    # Alert severity
    if final_risk_score >= 0.85:
        alert_severity = "CRITICAL"
    elif final_risk_score >= 0.70:
        alert_severity = "HIGH"
    elif final_risk_score >= 0.50:
        alert_severity = "MEDIUM"
    else:
        alert_severity = "LOW"
    
    latency_ms = (time.time() - start_time) * 1000
    
    return {
        "anomaly_score": round(anomaly_score, 4),
        "failure_probability": round(failure_probability, 4),
        "log_risk": round(log_risk, 4),
        "final_risk_score": round(final_risk_score, 4),
        "alert_severity": alert_severity,
        "inference_latency_ms": round(latency_ms, 2)
    }


class InferenceService:
    def predict(
        self,
        timeseries_data: Optional[np.ndarray] = None,
        tabular_features: Optional[Dict[str, float]] = None,
        log_text: Optional[str] = None
    ) -> Dict:
        
        payload = {}
        if timeseries_data is not None:
            payload["time_series_data"] = timeseries_data.tolist()
        if tabular_features is not None:
            payload["tabular_features"] = tabular_features
        if log_text is not None:
            payload["log_text"] = log_text
        
        return run_inference(payload)

