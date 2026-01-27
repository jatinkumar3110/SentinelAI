from typing import Dict, List
from datetime import datetime
from collections import deque


class AlertSeverity:
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AlertManager:
    """Manage alerts with severity levels"""
    
    def __init__(self):
        self.alerts = deque(maxlen=1000)
        self.severity_thresholds = {
            AlertSeverity.LOW: 0.3,
            AlertSeverity.MEDIUM: 0.5,
            AlertSeverity.HIGH: 0.7,
            AlertSeverity.CRITICAL: 0.85
        }
        
    def determine_severity(self, risk_score: float) -> str:
        """Determine alert severity based on risk score"""
        if risk_score >= self.severity_thresholds[AlertSeverity.CRITICAL]:
            return AlertSeverity.CRITICAL
        elif risk_score >= self.severity_thresholds[AlertSeverity.HIGH]:
            return AlertSeverity.HIGH
        elif risk_score >= self.severity_thresholds[AlertSeverity.MEDIUM]:
            return AlertSeverity.MEDIUM
        else:
            return AlertSeverity.LOW
    
    def create_alert(
        self,
        risk_score: float,
        anomaly_details: Dict,
        root_cause: str = None
    ) -> Dict:
        """Create new alert"""
        
        severity = self.determine_severity(risk_score)
        
        alert = {
            'id': len(self.alerts) + 1,
            'timestamp': datetime.utcnow().isoformat(),
            'severity': severity,
            'risk_score': risk_score,
            'message': self._generate_message(severity, risk_score),
            'details': anomaly_details,
            'root_cause': root_cause,
            'acknowledged': False
        }
        
        if severity in [AlertSeverity.HIGH, AlertSeverity.CRITICAL]:
            self.alerts.append(alert)
        
        return alert
    
    def get_recent_alerts(self, limit: int = 50) -> List[Dict]:
        """Get recent alerts"""
        return list(self.alerts)[-limit:]
    
    def get_alerts_by_severity(self, severity: str) -> List[Dict]:
        """Get alerts filtered by severity"""
        return [alert for alert in self.alerts if alert['severity'] == severity]
    
    def acknowledge_alert(self, alert_id: int) -> bool:
        """Acknowledge an alert"""
        for alert in self.alerts:
            if alert['id'] == alert_id:
                alert['acknowledged'] = True
                return True
        return False
    
    def get_alert_stats(self) -> Dict:
        """Get alert statistics"""
        total = len(self.alerts)
        if total == 0:
            return {
                'total': 0,
                'by_severity': {},
                'acknowledged': 0,
                'unacknowledged': 0
            }
        
        stats = {
            'total': total,
            'by_severity': {
                AlertSeverity.CRITICAL: sum(1 for a in self.alerts if a['severity'] == AlertSeverity.CRITICAL),
                AlertSeverity.HIGH: sum(1 for a in self.alerts if a['severity'] == AlertSeverity.HIGH),
                AlertSeverity.MEDIUM: sum(1 for a in self.alerts if a['severity'] == AlertSeverity.MEDIUM),
                AlertSeverity.LOW: sum(1 for a in self.alerts if a['severity'] == AlertSeverity.LOW)
            },
            'acknowledged': sum(1 for a in self.alerts if a.get('acknowledged', False)),
            'unacknowledged': sum(1 for a in self.alerts if not a.get('acknowledged', False))
        }
        
        return stats
    
    def _generate_message(self, severity: str, risk_score: float) -> str:
        """Generate alert message"""
        messages = {
            AlertSeverity.CRITICAL: f"CRITICAL anomaly detected with risk score {risk_score:.3f}",
            AlertSeverity.HIGH: f"High risk anomaly detected with score {risk_score:.3f}",
            AlertSeverity.MEDIUM: f"Medium risk anomaly detected with score {risk_score:.3f}",
            AlertSeverity.LOW: f"Low risk anomaly detected with score {risk_score:.3f}"
        }
        return messages.get(severity, f"Anomaly detected: {risk_score:.3f}")
