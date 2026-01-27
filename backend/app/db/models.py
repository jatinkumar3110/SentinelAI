from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime
from app.db.database import Base


class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    anomaly_score = Column(Float)
    failure_probability = Column(Float)
    log_risk = Column(Float)
    final_risk_score = Column(Float)
    alert_severity = Column(String)

