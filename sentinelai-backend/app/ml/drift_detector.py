import numpy as np
from typing import Dict, List, Optional
from collections import deque


class ADWINDriftDetector:
    """ADWIN (Adaptive Windowing) drift detector"""
    
    def __init__(self, delta: float = 0.002):
        self.delta = delta
        self.window = deque(maxlen=1000)
        self.drift_detected = False
        self.drift_points = []
        self.drift_score = 0.0
        
    def add_element(self, value: float) -> bool:
        """Add new value and check for drift"""
        self.window.append(value)
        
        if len(self.window) < 10:
            return False
        
        # Simple drift detection: compare recent vs historical mean
        recent_size = min(50, len(self.window) // 4)
        recent_mean = np.mean(list(self.window)[-recent_size:])
        historical_mean = np.mean(list(self.window)[:-recent_size])
        
        # Calculate drift score
        if historical_mean > 0:
            self.drift_score = abs(recent_mean - historical_mean) / (historical_mean + 1e-8)
        else:
            self.drift_score = abs(recent_mean - historical_mean)
        
        # Detect significant drift
        threshold = 0.3
        if self.drift_score > threshold:
            self.drift_detected = True
            self.drift_points.append(len(self.window))
            return True
        
        self.drift_detected = False
        return False
    
    def get_drift_info(self) -> Dict:
        """Get drift detection information"""
        return {
            'drift_detected': self.drift_detected,
            'drift_score': float(self.drift_score),
            'window_size': len(self.window),
            'drift_points_count': len(self.drift_points)
        }
    
    def reset(self):
        """Reset detector"""
        self.window.clear()
        self.drift_detected = False
        self.drift_points.clear()
        self.drift_score = 0.0


class DriftMonitor:
    """Monitor concept drift across multiple metrics"""
    
    def __init__(self):
        self.detectors = {
            'anomaly_score': ADWINDriftDetector(),
            'failure_probability': ADWINDriftDetector(),
            'log_risk': ADWINDriftDetector()
        }
        self.drift_history = []
        
    def update(self, metrics: Dict[str, float]) -> Dict:
        """Update all detectors with new metrics"""
        drift_alerts = {}
        
        for metric_name, value in metrics.items():
            if metric_name in self.detectors:
                drift_detected = self.detectors[metric_name].add_element(value)
                if drift_detected:
                    drift_alerts[metric_name] = self.detectors[metric_name].get_drift_info()
        
        if drift_alerts:
            self.drift_history.append({
                'timestamp': len(self.drift_history),
                'alerts': drift_alerts
            })
        
        return drift_alerts
    
    def get_summary(self) -> Dict:
        """Get drift monitoring summary"""
        summary = {}
        for name, detector in self.detectors.items():
            summary[name] = detector.get_drift_info()
        
        return {
            'detectors': summary,
            'total_drift_events': len(self.drift_history),
            'recent_drift_events': self.drift_history[-10:] if self.drift_history else []
        }
