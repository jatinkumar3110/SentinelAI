import xgboost as xgb
import numpy as np
from pathlib import Path
from typing import Tuple, Dict
import pickle


class TabularFailurePredictor:
    def __init__(self):
        self.model = None
        self.scaler_params = None
        self.feature_names = [
            'temperature',
            'pressure',
            'vibration',
            'rotation_speed',
            'power_consumption',
            'operating_hours'
        ]
        
    def load_model(self, model_path: Path):
        self.model = xgb.Booster()
        self.model.load_model(str(model_path))
        
        scaler_path = model_path.parent / "xgboost_scaler.pkl"
        with open(scaler_path, 'rb') as f:
            self.scaler_params = pickle.load(f)
    
    def normalize(self, features: Dict[str, float]) -> np.ndarray:
        feature_array = np.array([features[name] for name in self.feature_names])
        
        normalized = (feature_array - self.scaler_params['mean']) / (self.scaler_params['std'] + 1e-8)
        return normalized
    
    def predict(self, features: Dict[str, float]) -> Tuple[float, np.ndarray]:
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        normalized_features = self.normalize(features)
        
        dmatrix = xgb.DMatrix(normalized_features.reshape(1, -1))
        
        probability = self.model.predict(dmatrix)[0]
        
        return float(probability), normalized_features
    
    def get_feature_importance(self) -> Dict[str, float]:
        if self.model is None:
            raise ValueError("Model not loaded.")
        
        importance_dict = self.model.get_score(importance_type='gain')
        
        feature_importance = {}
        for i, name in enumerate(self.feature_names):
            feature_key = f'f{i}'
            feature_importance[name] = importance_dict.get(feature_key, 0.0)
        
        return feature_importance
