from sqlalchemy import Column, Integer, Float, String, DateTime, JSON
from datetime import datetime
from app.db.database import Base


class AnomalyRecord(Base):
    __tablename__ = "anomaly_records"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    anomaly_score = Column(Float, nullable=False)
    failure_probability = Column(Float, nullable=False)
    log_risk = Column(Float, nullable=False)
    final_risk_score = Column(Float, nullable=False)
    
    timeseries_features = Column(JSON, nullable=True)
    tabular_features = Column(JSON, nullable=True)
    log_text = Column(String, nullable=True)
    
    explanation_values = Column(JSON, nullable=True)
    
    alert_triggered = Column(Integer, default=0)
