import torch
import torch.nn as nn
import numpy as np
from pathlib import Path
from typing import Tuple
from app.core.config import settings


class LSTMAutoencoder(nn.Module):
    def __init__(self, input_dim: int = 1, hidden_dim: int = 64, num_layers: int = 2):
        super(LSTMAutoencoder, self).__init__()
        
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        self.encoder = nn.LSTM(
            input_dim, 
            hidden_dim, 
            num_layers, 
            batch_first=True,
            dropout=0.2
        )
        
        self.decoder = nn.LSTM(
            hidden_dim,
            hidden_dim,
            num_layers,
            batch_first=True,
            dropout=0.2
        )
        
        self.output_layer = nn.Linear(hidden_dim, input_dim)
        
    def forward(self, x):
        _, (hidden, cell) = self.encoder(x)
        
        decoder_input = hidden[-1].unsqueeze(1).repeat(1, x.size(1), 1)
        
        decoded, _ = self.decoder(decoder_input, (hidden, cell))
        
        output = self.output_layer(decoded)
        
        return output


class TimeSeriesAnomalyDetector:
    def __init__(self):
        self.model = None
        self.threshold = None
        self.scaler_mean = None
        self.scaler_std = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
    def load_model(self, model_path: Path):
        checkpoint = torch.load(model_path, map_location=self.device)
        
        self.model = LSTMAutoencoder(
            input_dim=1,
            hidden_dim=settings.LSTM_HIDDEN_DIM,
            num_layers=2
        )
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.to(self.device)
        self.model.eval()
        
        self.threshold = checkpoint['threshold']
        self.scaler_mean = checkpoint['scaler_mean']
        self.scaler_std = checkpoint['scaler_std']
        
    def normalize(self, data: np.ndarray) -> np.ndarray:
        return (data - self.scaler_mean) / (self.scaler_std + 1e-8)
    
    def denormalize(self, data: np.ndarray) -> np.ndarray:
        return data * (self.scaler_std + 1e-8) + self.scaler_mean
    
    def prepare_sequence(self, data: np.ndarray, window_size: int = 50) -> np.ndarray:
        if len(data) < window_size:
            padding = np.repeat(data[0], window_size - len(data))
            data = np.concatenate([padding, data])
        elif len(data) > window_size:
            data = data[-window_size:]
        
        normalized = self.normalize(data)
        return normalized.reshape(1, window_size, 1)
    
    def predict(self, timeseries_data: np.ndarray) -> Tuple[float, np.ndarray]:
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        sequence = self.prepare_sequence(timeseries_data, settings.TIMESERIES_WINDOW_SIZE)
        
        with torch.no_grad():
            input_tensor = torch.FloatTensor(sequence).to(self.device)
            reconstruction = self.model(input_tensor)
            
            mse = torch.mean((input_tensor - reconstruction) ** 2, dim=(1, 2))
            reconstruction_error = mse.cpu().numpy()[0]
            
        anomaly_score = min(reconstruction_error / self.threshold, 1.0)
        
        return float(anomaly_score), reconstruction.cpu().numpy()[0, :, 0]
