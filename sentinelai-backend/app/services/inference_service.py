import time
import numpy as np
from typing import Dict, Optional, Tuple
from pathlib import Path

from app.ml.timeseries_model import TimeSeriesAnomalyDetector
from app.ml.gru_model import GRUAnomalyDetector
from app.ml.tabular_model import TabularFailurePredictor
from app.ml.log_model import LogAnomalyClassifier
from app.ml.fusion import RiskFusionEngine
from app.ml.explainability import ExplainabilityEngine
from app.ml.drift_detector import DriftMonitor
from app.ml.root_cause import RootCauseAnalyzer
from app.services.alert_manager import AlertManager
from app.services.metrics_service import MetricsAggregator
from app.core.config import settings


class InferenceService:
    def __init__(self):
        self.ts_detector = TimeSeriesAnomalyDetector()
        self.gru_detector = GRUAnomalyDetector()
        self.tabular_predictor = TabularFailurePredictor()
        self.log_classifier = LogAnomalyClassifier()
        self.fusion_engine = RiskFusionEngine()
        self.explainer = ExplainabilityEngine()
        self.drift_monitor = DriftMonitor()
        self.root_cause_analyzer = RootCauseAnalyzer()
        self.alert_manager = AlertManager()
        self.metrics_aggregator = MetricsAggregator()
        
        self._load_models()
    
    def _load_models(self):
        try:
            if settings.LSTM_MODEL_PATH.exists():
                self.ts_detector.load_model(settings.LSTM_MODEL_PATH)
        except Exception as e:
            print(f"Warning: Could not load LSTM model: {e}")
        
        try:
            gru_path = settings.MODEL_DIR / "gru_autoencoder.pth"
            if gru_path.exists():
                self.gru_detector.load_model(gru_path)
        except Exception as e:
            print(f"Warning: Could not load GRU model: {e}")
        
        try:
            if settings.XGBOOST_MODEL_PATH.exists():
                self.tabular_predictor.load_model(settings.XGBOOST_MODEL_PATH)
        except Exception as e:
            print(f"Warning: Could not load XGBoost model: {e}")
        
        try:
            if settings.BERT_MODEL_PATH.exists():
                self.log_classifier.load_model(settings.BERT_MODEL_PATH)
        except Exception as e:
            print(f"Warning: Could not load BERT model: {e}")
    
    def predict(
        self,
        timeseries_data: Optional[np.ndarray] = None,
        tabular_features: Optional[Dict[str, float]] = None,
        log_text: Optional[str] = None
    ) -> Tuple[Dict[str, float], float]:
        
        start_time = time.time()
        
        anomaly_score = None
        ts_reconstruction = None
        ts_explanation = None
        
        if timeseries_data is not None and self.ts_detector.model is not None:
            lstm_score, lstm_recon = self.ts_detector.predict(timeseries_data)
            
            if self.gru_detector.model is not None:
                gru_score, gru_recon = self.gru_detector.predict(timeseries_data)
                anomaly_score = (lstm_score + gru_score) / 2
                ts_reconstruction = (lstm_recon + gru_recon) / 2
            else:
                anomaly_score = lstm_score
                ts_reconstruction = lstm_recon
            
            ts_explanation = self.explainer.explain_timeseries_prediction(
                timeseries_data[-settings.TIMESERIES_WINDOW_SIZE:],
                ts_reconstruction
            )
        
        failure_probability = None
        tabular_normalized = None
        tabular_explanation = None
        
        if tabular_features is not None and self.tabular_predictor.model is not None:
            failure_probability, tabular_normalized = self.tabular_predictor.predict(tabular_features)
            tabular_explanation = self.explainer.explain_tabular_prediction(
                tabular_normalized,
                self.tabular_predictor.feature_names
            )
        
        log_risk = None
        log_attention = None
        log_explanation = None
        
        if log_text is not None and self.log_classifier.model is not None:
            log_risk, log_attention = self.log_classifier.predict(log_text)
            log_explanation = self.explainer.explain_log_prediction(log_attention)
        
        fusion_result = self.fusion_engine.calculate_final_risk(
            timeseries_score=anomaly_score,
            failure_probability=failure_probability,
            log_risk=log_risk
        )
        
        final_risk_score = fusion_result['final_risk_score']
        alert_triggered = self.fusion_engine.trigger_alert(final_risk_score)
        
        explanations = self.explainer.aggregate_explanations(
            timeseries_exp=ts_explanation,
            tabular_exp=tabular_explanation,
            log_exp=log_explanation
        )
        
        tabular_ranking = []
        ts_ranking = []
        log_ranking = []
        root_cause_summary = None
        
        if tabular_explanation and tabular_features:
            tabular_ranking = self.root_cause_analyzer.analyze_tabular(
                tabular_features, tabular_explanation
            )
        
        if ts_reconstruction is not None:
            reconstruction_error = np.abs(timeseries_data[-settings.TIMESERIES_WINDOW_SIZE:] - ts_reconstruction)
            ts_ranking = self.root_cause_analyzer.analyze_timeseries(reconstruction_error)
        
        if log_explanation:
            log_ranking = self.root_cause_analyzer.analyze_logs(
                log_explanation.get('top_tokens', [])
            )
        
        root_cause_summary = self.root_cause_analyzer.generate_summary(
            tabular_ranking, ts_ranking, log_ranking
        )
        
        drift_info = self.drift_monitor.update({
            'anomaly_score': anomaly_score if anomaly_score is not None else 0.0,
            'failure_probability': failure_probability if failure_probability is not None else 0.0,
            'log_risk': log_risk if log_risk is not None else 0.0
        })
        
        alert = self.alert_manager.create_alert(
            risk_score=final_risk_score,
            anomaly_details={
                'anomaly_score': anomaly_score,
                'failure_probability': failure_probability,
                'log_risk': log_risk
            },
            root_cause=root_cause_summary.get('primary_cause') if root_cause_summary else None
        )
        
        inference_latency = (time.time() - start_time) * 1000
        
        y_pred = 1 if alert_triggered else 0
        y_true = 1 if final_risk_score > 0.7 else 0
        self.metrics_aggregator.record_prediction(y_true, y_pred, inference_latency)
        
        result = {
            'anomaly_score': anomaly_score if anomaly_score is not None else 0.0,
            'failure_probability': failure_probability if failure_probability is not None else 0.0,
            'log_risk': log_risk if log_risk is not None else 0.0,
            'final_risk_score': final_risk_score,
            'explanation_values': explanations,
            'alert_triggered': alert_triggered,
            'risk_level': fusion_result.get('risk_level', 'unknown'),
            'root_cause': root_cause_summary,
            'drift_detected': len(drift_info) > 0,
            'drift_info': drift_info,
            'alert': alert
        }
        
        return result, inference_latency
