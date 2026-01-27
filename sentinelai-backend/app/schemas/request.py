from pydantic import BaseModel, Field
from typing import List, Optional


class TimeSeriesInput(BaseModel):
    values: List[float] = Field(..., description="Time series values")


class TabularInput(BaseModel):
    temperature: float
    pressure: float
    vibration: float
    rotation_speed: float
    power_consumption: float
    operating_hours: int


class LogInput(BaseModel):
    text: str = Field(..., description="System log text")


class PredictionRequest(BaseModel):
    timeseries: Optional[TimeSeriesInput] = None
    tabular: Optional[TabularInput] = None
    logs: Optional[LogInput] = None


class StoreResultRequest(BaseModel):
    anomaly_score: float
    failure_probability: float
    log_risk: float
    final_risk_score: float
    explanation_values: Optional[dict] = None
