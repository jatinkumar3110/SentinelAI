import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import xgboost as xgb
import os
from pathlib import Path
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


def _is_enabled(env_name: str, default: bool = True) -> bool:
    raw = os.getenv(env_name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


class LSTMAutoencoder(nn.Module):
    def __init__(self, input_dim=1, hidden_dim=64, num_layers=2):
        super().__init__()
        self.encoder = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True)
        self.decoder = nn.LSTM(hidden_dim, input_dim, num_layers, batch_first=True)
        
    def forward(self, x):
        _, (hidden, _) = self.encoder(x)
        decoded, _ = self.decoder(hidden.repeat(x.size(1), 1, 1).permute(1, 0, 2))
        return decoded


class GRUAutoencoder(nn.Module):
    def __init__(self, input_dim=1, hidden_dim=64, num_layers=2):
        super().__init__()
        self.encoder = nn.GRU(input_dim, hidden_dim, num_layers, batch_first=True)
        self.decoder = nn.GRU(hidden_dim, input_dim, num_layers, batch_first=True)
        
    def forward(self, x):
        _, hidden = self.encoder(x)
        decoded, _ = self.decoder(hidden.repeat(x.size(1), 1, 1).permute(1, 0, 2))
        return decoded


class ModelRegistry:
    _instance: Optional['ModelRegistry'] = None
    
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.model_loaded: Dict[str, bool] = {
            "lstm": False,
            "gru": False,
            "xgboost": False,
            "bert": False
        }
        
    @classmethod
    def get_instance(cls) -> 'ModelRegistry':
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def load_all_models(self):
        model_dir = Path(os.getenv("MODEL_DIR", "models"))
        enable_lstm = _is_enabled("ENABLE_LSTM", True)
        enable_gru = _is_enabled("ENABLE_GRU", True)
        enable_xgboost = _is_enabled("ENABLE_XGBOOST", True)
        enable_bert = _is_enabled("ENABLE_BERT", True)
        
        if enable_lstm:
            try:
                self._load_lstm(model_dir)
            except Exception as e:
                logger.warning(f"LSTM not loaded: {e}")
        else:
            logger.info("LSTM disabled via ENABLE_LSTM")
            
        if enable_gru:
            try:
                self._load_gru(model_dir)
            except Exception as e:
                logger.warning(f"GRU not loaded: {e}")
        else:
            logger.info("GRU disabled via ENABLE_GRU")
            
        if enable_xgboost:
            try:
                self._load_xgboost(model_dir)
            except Exception as e:
                logger.warning(f"XGBoost not loaded: {e}")
        else:
            logger.info("XGBoost disabled via ENABLE_XGBOOST")
            
        if enable_bert:
            try:
                self._load_bert(model_dir)
            except Exception as e:
                logger.warning(f"BERT not loaded: {e}")
        else:
            logger.info("BERT disabled via ENABLE_BERT")

    def _load_torch_checkpoint(self, model: nn.Module, model_path: Path):
        checkpoint = torch.load(model_path, map_location="cpu")
        if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
            model.load_state_dict(checkpoint["model_state_dict"])
        else:
            model.load_state_dict(checkpoint)
    
    def _load_lstm(self, model_dir: Path):
        lstm_path = model_dir / "lstm_autoencoder.pth"
        if not lstm_path.exists():
            lstm_path = model_dir / "lstm_autoencoder.pt"

        if lstm_path.exists():
            self.models["lstm"] = LSTMAutoencoder()
            self._load_torch_checkpoint(self.models["lstm"], lstm_path)
            self.models["lstm"].eval()
            self.model_loaded["lstm"] = True
            logger.info("LSTM loaded")
        else:
            self.models["lstm"] = LSTMAutoencoder()
            self.models["lstm"].eval()
            self.model_loaded["lstm"] = True
            logger.info("LSTM initialized (no weights)")
    
    def _load_gru(self, model_dir: Path):
        gru_path = model_dir / "gru_autoencoder.pth"
        if not gru_path.exists():
            gru_path = model_dir / "gru_autoencoder.pt"

        if gru_path.exists():
            self.models["gru"] = GRUAutoencoder()
            self._load_torch_checkpoint(self.models["gru"], gru_path)
            self.models["gru"].eval()
            self.model_loaded["gru"] = True
            logger.info("GRU loaded")
        else:
            self.models["gru"] = GRUAutoencoder()
            self.models["gru"].eval()
            self.model_loaded["gru"] = True
            logger.info("GRU initialized (no weights)")
    
    def _load_xgboost(self, model_dir: Path):
        xgb_path = model_dir / "xgboost_classifier.json"
        if xgb_path.exists():
            self.models["xgboost"] = xgb.Booster()
            self.models["xgboost"].load_model(str(xgb_path))
            self.model_loaded["xgboost"] = True
            logger.info("XGBoost loaded")
        else:
            self.models["xgboost"] = None
            logger.warning("XGBoost model file not found")
    
    def _load_bert(self, model_dir: Path):
        bert_path = model_dir / "distilbert_logs"
        if bert_path.exists():
            self.models["bert_tokenizer"] = AutoTokenizer.from_pretrained(str(bert_path))
            self.models["bert_model"] = AutoModelForSequenceClassification.from_pretrained(str(bert_path))
            self.models["bert_model"].eval()
            self.model_loaded["bert"] = True
            logger.info("DistilBERT loaded")
        else:
            logger.warning("DistilBERT directory not found; skipping BERT load")
    
    def get_models(self) -> Dict[str, Any]:
        return self.models
    
    def get_model_status(self) -> Dict[str, bool]:
        return self.model_loaded


def load_all_models():
    registry = ModelRegistry.get_instance()
    registry.load_all_models()


def get_models() -> Dict[str, Any]:
    registry = ModelRegistry.get_instance()
    return registry.get_models()


def get_model_status() -> Dict[str, bool]:
    registry = ModelRegistry.get_instance()
    return registry.get_model_status()
