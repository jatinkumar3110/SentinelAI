import shap
import numpy as np
from typing import Dict, Optional, List
import xgboost as xgb


class ExplainabilityEngine:
    def __init__(self):
        self.xgb_explainer = None
        
    def initialize_xgb_explainer(self, model: xgb.Booster, background_data: np.ndarray):
        self.xgb_explainer = shap.TreeExplainer(model, background_data)
    
    def explain_tabular_prediction(
        self,
        features: np.ndarray,
        feature_names: List[str]
    ) -> Dict[str, float]:
        
        if self.xgb_explainer is None:
            return self._generate_mock_explanations(feature_names, features)
        
        try:
            shap_values = self.xgb_explainer.shap_values(features.reshape(1, -1))
            
            explanations = {}
            for i, name in enumerate(feature_names):
                explanations[name] = float(shap_values[0][i])
            
            return explanations
        except Exception:
            return self._generate_mock_explanations(feature_names, features)
    
    def explain_timeseries_prediction(
        self,
        original_sequence: np.ndarray,
        reconstruction: np.ndarray
    ) -> Dict[str, any]:
        
        reconstruction_error = np.abs(original_sequence - reconstruction)
        
        top_indices = np.argsort(reconstruction_error)[-5:][::-1]
        
        explanations = {
            'mean_reconstruction_error': float(np.mean(reconstruction_error)),
            'max_reconstruction_error': float(np.max(reconstruction_error)),
            'top_anomalous_indices': top_indices.tolist(),
            'top_anomalous_errors': reconstruction_error[top_indices].tolist()
        }
        
        return explanations
    
    def explain_log_prediction(
        self,
        attention_data: dict
    ) -> Dict[str, any]:
        
        tokens = attention_data.get('tokens', [])
        attention_weights = attention_data.get('attention_weights', [])
        
        token_importance = []
        for i, (token, weight) in enumerate(zip(tokens, attention_weights)):
            if token not in ['[CLS]', '[SEP]', '[PAD]']:
                token_importance.append({
                    'token': token,
                    'importance': float(weight),
                    'position': i
                })
        
        token_importance = sorted(token_importance, key=lambda x: x['importance'], reverse=True)[:10]
        
        return {
            'top_tokens': token_importance,
            'total_tokens': len(tokens)
        }
    
    def _generate_mock_explanations(self, feature_names: List[str], features: np.ndarray) -> Dict[str, float]:
        explanations = {}
        feature_magnitudes = np.abs(features)
        normalized_importance = feature_magnitudes / (np.sum(feature_magnitudes) + 1e-8)
        
        for i, name in enumerate(feature_names):
            explanations[name] = float(normalized_importance[i])
        
        return explanations
    
    def aggregate_explanations(
        self,
        timeseries_exp: Optional[Dict] = None,
        tabular_exp: Optional[Dict] = None,
        log_exp: Optional[Dict] = None
    ) -> Dict[str, any]:
        
        aggregated = {}
        
        if timeseries_exp:
            aggregated['timeseries'] = timeseries_exp
        
        if tabular_exp:
            aggregated['tabular'] = tabular_exp
        
        if log_exp:
            aggregated['logs'] = log_exp
        
        return aggregated
