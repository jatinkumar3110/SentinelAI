import numpy as np
from typing import Dict, Optional
from app.core.config import settings


class RiskFusionEngine:
    def __init__(self):
        self.weight_timeseries = settings.RISK_WEIGHT_TIMESERIES
        self.weight_failure = settings.RISK_WEIGHT_FAILURE
        self.weight_log = settings.RISK_WEIGHT_LOG
        
        self.risk_thresholds = {
            'low': 0.3,
            'medium': 0.6,
            'high': 0.85
        }
    
    def calculate_final_risk(
        self,
        timeseries_score: Optional[float] = None,
        failure_probability: Optional[float] = None,
        log_risk: Optional[float] = None
    ) -> Dict[str, float]:
        
        scores = []
        weights = []
        components = {}
        
        if timeseries_score is not None:
            scores.append(timeseries_score)
            weights.append(self.weight_timeseries)
            components['timeseries_contribution'] = timeseries_score * self.weight_timeseries
        
        if failure_probability is not None:
            scores.append(failure_probability)
            weights.append(self.weight_failure)
            components['failure_contribution'] = failure_probability * self.weight_failure
        
        if log_risk is not None:
            scores.append(log_risk)
            weights.append(self.weight_log)
            components['log_contribution'] = log_risk * self.weight_log
        
        if not scores:
            return {
                'final_risk_score': 0.0,
                'risk_level': 'unknown',
                'components': {}
            }
        
        total_weight = sum(weights)
        normalized_weights = [w / total_weight for w in weights]
        
        final_risk = sum(s * w for s, w in zip(scores, normalized_weights))
        
        risk_level = self._categorize_risk(final_risk)
        
        components['final_risk_score'] = final_risk
        components['risk_level'] = risk_level
        components['weights_used'] = {
            'timeseries': self.weight_timeseries if timeseries_score is not None else 0.0,
            'failure': self.weight_failure if failure_probability is not None else 0.0,
            'log': self.weight_log if log_risk is not None else 0.0
        }
        
        return components
    
    def _categorize_risk(self, risk_score: float) -> str:
        if risk_score < self.risk_thresholds['low']:
            return 'low'
        elif risk_score < self.risk_thresholds['medium']:
            return 'medium'
        elif risk_score < self.risk_thresholds['high']:
            return 'high'
        else:
            return 'critical'
    
    def trigger_alert(self, final_risk_score: float) -> bool:
        return final_risk_score >= self.risk_thresholds['high']
