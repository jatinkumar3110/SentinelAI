import numpy as np
from typing import Dict, List, Tuple


class RootCauseAnalyzer:
    """Rank top contributing features for anomalies"""
    
    def __init__(self):
        self.feature_names = [
            'temperature',
            'pressure',
            'vibration',
            'rotation_speed',
            'power_consumption',
            'operating_hours'
        ]
    
    def analyze_tabular(
        self, 
        feature_values: Dict[str, float],
        shap_values: Dict[str, float]
    ) -> List[Dict]:
        """Rank tabular features by SHAP importance"""
        
        rankings = []
        for feature_name in self.feature_names:
            if feature_name in shap_values:
                rankings.append({
                    'feature': feature_name,
                    'value': feature_values.get(feature_name, 0.0),
                    'importance': abs(shap_values[feature_name]),
                    'contribution': shap_values[feature_name]
                })
        
        # Sort by absolute importance
        rankings.sort(key=lambda x: x['importance'], reverse=True)
        
        return rankings[:5]  # Top 5
    
    def analyze_timeseries(
        self,
        reconstruction_error: np.ndarray
    ) -> List[Dict]:
        """Identify most anomalous time windows"""
        
        if len(reconstruction_error) == 0:
            return []
        
        # Find top 5 anomalous points
        top_indices = np.argsort(reconstruction_error)[-5:][::-1]
        
        rankings = []
        for idx in top_indices:
            rankings.append({
                'time_index': int(idx),
                'error_magnitude': float(reconstruction_error[idx]),
                'severity': self._get_severity(reconstruction_error[idx])
            })
        
        return rankings
    
    def analyze_logs(
        self,
        token_importance: List[Dict]
    ) -> List[Dict]:
        """Extract most important log tokens"""
        
        if not token_importance:
            return []
        
        # Already sorted by importance
        return token_importance[:5]
    
    def _get_severity(self, error: float) -> str:
        """Map error to severity level"""
        if error > 0.8:
            return 'CRITICAL'
        elif error > 0.6:
            return 'HIGH'
        elif error > 0.3:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def generate_summary(
        self,
        tabular_ranking: List[Dict],
        timeseries_ranking: List[Dict],
        log_ranking: List[Dict]
    ) -> Dict:
        """Generate comprehensive root cause summary"""
        
        return {
            'top_tabular_features': tabular_ranking,
            'top_timeseries_windows': timeseries_ranking,
            'top_log_tokens': log_ranking,
            'primary_cause': self._identify_primary_cause(
                tabular_ranking,
                timeseries_ranking,
                log_ranking
            )
        }
    
    def _identify_primary_cause(
        self,
        tabular: List[Dict],
        timeseries: List[Dict],
        logs: List[Dict]
    ) -> str:
        """Identify most likely primary cause"""
        
        if tabular and tabular[0]['importance'] > 0.5:
            return f"Tabular: {tabular[0]['feature']}"
        elif timeseries and len(timeseries) > 0:
            return f"Time-series anomaly at index {timeseries[0]['time_index']}"
        elif logs and len(logs) > 0:
            return f"Log pattern: {logs[0].get('token', 'unknown')}"
        else:
            return "Unknown"
