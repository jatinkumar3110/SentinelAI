import numpy as np
from typing import Dict, List
from collections import deque
from datetime import datetime, timedelta


class MetricsAggregator:
    """Aggregate and compute system metrics"""
    
    def __init__(self):
        self.latencies = deque(maxlen=1000)
        self.predictions = deque(maxlen=1000)
        self.daily_stats = []
        
    def record_prediction(
        self,
        y_true: int,
        y_pred: int,
        latency_ms: float
    ):
        """Record prediction for metrics calculation"""
        self.latencies.append(latency_ms)
        self.predictions.append({
            'y_true': y_true,
            'y_pred': y_pred,
            'timestamp': datetime.utcnow()
        })
    
    def compute_confusion_matrix(self) -> Dict:
        """Compute confusion matrix"""
        if not self.predictions:
            return {'TP': 0, 'FP': 0, 'TN': 0, 'FN': 0}
        
        tp = sum(1 for p in self.predictions if p['y_true'] == 1 and p['y_pred'] == 1)
        fp = sum(1 for p in self.predictions if p['y_true'] == 0 and p['y_pred'] == 1)
        tn = sum(1 for p in self.predictions if p['y_true'] == 0 and p['y_pred'] == 0)
        fn = sum(1 for p in self.predictions if p['y_true'] == 1 and p['y_pred'] == 0)
        
        return {'TP': tp, 'FP': fp, 'TN': tn, 'FN': fn}
    
    def compute_pr_auc(self) -> float:
        """Estimate PR-AUC from recent predictions"""
        cm = self.compute_confusion_matrix()
        
        precision = cm['TP'] / (cm['TP'] + cm['FP']) if (cm['TP'] + cm['FP']) > 0 else 0
        recall = cm['TP'] / (cm['TP'] + cm['FN']) if (cm['TP'] + cm['FN']) > 0 else 0
        
        # Simplified PR-AUC estimation
        return (precision + recall) / 2 if (precision + recall) > 0 else 0
    
    def compute_mtbf(self) -> float:
        """Mean Time Between Failures (in hours)"""
        failures = [p for p in self.predictions if p['y_true'] == 1]
        
        if len(failures) < 2:
            return 0.0
        
        time_diffs = []
        for i in range(1, len(failures)):
            diff = (failures[i]['timestamp'] - failures[i-1]['timestamp']).total_seconds() / 3600
            time_diffs.append(diff)
        
        return np.mean(time_diffs) if time_diffs else 0.0
    
    def compute_latency_stats(self) -> Dict:
        """Compute latency statistics"""
        if not self.latencies:
            return {
                'mean': 0.0,
                'p50': 0.0,
                'p95': 0.0,
                'p99': 0.0,
                'max': 0.0
            }
        
        latencies_array = np.array(list(self.latencies))
        
        return {
            'mean': float(np.mean(latencies_array)),
            'p50': float(np.percentile(latencies_array, 50)),
            'p95': float(np.percentile(latencies_array, 95)),
            'p99': float(np.percentile(latencies_array, 99)),
            'max': float(np.max(latencies_array))
        }
    
    def get_throughput(self) -> float:
        """Compute requests per second"""
        if not self.predictions:
            return 0.0
        
        recent = [p for p in self.predictions if (datetime.utcnow() - p['timestamp']).total_seconds() < 60]
        
        return len(recent) / 60.0 if recent else 0.0
    
    def aggregate_daily_stats(self) -> Dict:
        """Aggregate stats for the current day"""
        today = datetime.utcnow().date()
        today_predictions = [p for p in self.predictions if p['timestamp'].date() == today]
        
        if not today_predictions:
            return {}
        
        anomaly_count = sum(1 for p in today_predictions if p['y_pred'] == 1)
        
        stats = {
            'date': today.isoformat(),
            'total_predictions': len(today_predictions),
            'anomaly_count': anomaly_count,
            'anomaly_rate': anomaly_count / len(today_predictions),
            'avg_latency': np.mean([self.latencies[i] for i in range(min(len(self.latencies), len(today_predictions)))])
        }
        
        self.daily_stats.append(stats)
        return stats
    
    def get_summary(self) -> Dict:
        """Get comprehensive metrics summary"""
        cm = self.compute_confusion_matrix()
        
        precision = cm['TP'] / (cm['TP'] + cm['FP']) if (cm['TP'] + cm['FP']) > 0 else 0
        recall = cm['TP'] / (cm['TP'] + cm['FN']) if (cm['TP'] + cm['FN']) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        
        return {
            'confusion_matrix': cm,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'pr_auc': self.compute_pr_auc(),
            'mtbf_hours': self.compute_mtbf(),
            'latency': self.compute_latency_stats(),
            'throughput_per_sec': self.get_throughput(),
            'total_predictions': len(self.predictions)
        }
