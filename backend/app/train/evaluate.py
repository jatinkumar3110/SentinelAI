import numpy as np
import pandas as pd
from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score
import json
from pathlib import Path

from app.core.config import settings
from app.ml.timeseries_model import TimeSeriesAnomalyDetector
from app.ml.tabular_model import TabularFailurePredictor


def evaluate_timeseries_model():
    """Evaluate LSTM Autoencoder performance."""
    
    print("Evaluating Time-Series Model...")
    
    detector = TimeSeriesAnomalyDetector()
    
    if not settings.LSTM_MODEL_PATH.exists():
        print("LSTM model not found. Skipping evaluation.")
        return None
    
    detector.load_model(settings.LSTM_MODEL_PATH)
    
    normal_samples = []
    for _ in range(100):
        t = np.linspace(0, 4 * np.pi, settings.TIMESERIES_WINDOW_SIZE)
        signal = np.sin(t) + 0.1 * np.random.randn(settings.TIMESERIES_WINDOW_SIZE)
        normal_samples.append(signal)
    
    anomaly_samples = []
    for _ in range(100):
        t = np.linspace(0, 4 * np.pi, settings.TIMESERIES_WINDOW_SIZE)
        signal = np.sin(t) + 0.5 * np.random.randn(settings.TIMESERIES_WINDOW_SIZE)
        spike_idx = np.random.randint(10, settings.TIMESERIES_WINDOW_SIZE - 10)
        signal[spike_idx:spike_idx + 5] += np.random.uniform(2, 5)
        anomaly_samples.append(signal)
    
    normal_scores = []
    for sample in normal_samples:
        score, _ = detector.predict(sample)
        normal_scores.append(score)
    
    anomaly_scores = []
    for sample in anomaly_samples:
        score, _ = detector.predict(sample)
        anomaly_scores.append(score)
    
    y_true = [0] * len(normal_scores) + [1] * len(anomaly_scores)
    y_scores = normal_scores + anomaly_scores
    
    y_pred = [1 if score > 0.5 else 0 for score in y_scores]
    
    metrics = {
        'roc_auc': roc_auc_score(y_true, y_scores),
        'precision': precision_score(y_true, y_pred),
        'recall': recall_score(y_true, y_pred),
        'f1_score': f1_score(y_true, y_pred)
    }
    
    print(f"LSTM Metrics: {metrics}")
    return metrics


def evaluate_xgboost_model():
    """Evaluate XGBoost classifier performance."""
    
    print("Evaluating XGBoost Model...")
    
    predictor = TabularFailurePredictor()
    
    if not settings.XGBOOST_MODEL_PATH.exists():
        print("XGBoost model not found. Skipping evaluation.")
        return None
    
    predictor.load_model(settings.XGBOOST_MODEL_PATH)
    
    test_data = []
    test_labels = []
    
    for _ in range(100):
        features = {
            'temperature': np.random.normal(70, 10),
            'pressure': np.random.normal(95, 15),
            'vibration': np.random.normal(0.4, 0.15),
            'rotation_speed': np.random.normal(1500, 200),
            'power_consumption': np.random.normal(240, 40),
            'operating_hours': np.random.randint(0, 5000)
        }
        test_data.append(features)
        test_labels.append(0)
    
    for _ in range(100):
        features = {
            'temperature': np.random.normal(95, 10),
            'pressure': np.random.normal(125, 15),
            'vibration': np.random.normal(0.9, 0.15),
            'rotation_speed': np.random.normal(1800, 200),
            'power_consumption': np.random.normal(320, 40),
            'operating_hours': np.random.randint(7000, 10000)
        }
        test_data.append(features)
        test_labels.append(1)
    
    predictions = []
    for features in test_data:
        prob, _ = predictor.predict(features)
        predictions.append(prob)
    
    y_pred = [1 if p > 0.5 else 0 for p in predictions]
    
    metrics = {
        'roc_auc': roc_auc_score(test_labels, predictions),
        'precision': precision_score(test_labels, y_pred),
        'recall': recall_score(test_labels, y_pred),
        'f1_score': f1_score(test_labels, y_pred)
    }
    
    print(f"XGBoost Metrics: {metrics}")
    return metrics


def save_evaluation_results():
    """Run evaluation and save results."""
    
    lstm_metrics = evaluate_timeseries_model()
    xgboost_metrics = evaluate_xgboost_model()
    
    results = {
        'lstm_autoencoder': lstm_metrics if lstm_metrics else {},
        'xgboost_classifier': xgboost_metrics if xgboost_metrics else {}
    }
    
    metrics_path = settings.MODEL_DIR / "metrics.json"
    with open(metrics_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"Evaluation results saved to {metrics_path}")


if __name__ == "__main__":
    save_evaluation_results()
