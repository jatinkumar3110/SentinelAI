import torch
import torch.nn as nn
import numpy as np
from pathlib import Path
from typing import Tuple
import os


class GRUAutoencoder(nn.Module):
    def __init__(self, input_dim: int = 1, hidden_dim: int = 64, num_layers: int = 2):
        super(GRUAutoencoder, self).__init__()
        
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        self.encoder = nn.GRU(
            input_dim, 
            hidden_dim, 
            num_layers, 
            batch_first=True,
            dropout=0.2
        )
        
        self.decoder = nn.GRU(
            hidden_dim,
            hidden_dim,
            num_layers,
            batch_first=True,
            dropout=0.2
        )
        
        self.output_layer = nn.Linear(hidden_dim, input_dim)
        
    def forward(self, x):
        _, hidden = self.encoder(x)
        
        decoder_input = hidden[-1].unsqueeze(1).repeat(1, x.size(1), 1)
        
        decoded, _ = self.decoder(decoder_input, hidden)
        
        output = self.output_layer(decoded)
        
        return output


class GRUAnomalyDetector:
    def __init__(self):
        self.model = None
        self.threshold = None
        self.scaler_mean = None
        self.scaler_std = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.rolling_window = []
        self.rolling_size = 100
        
    def load_model(self, model_path: Path):
        checkpoint = torch.load(model_path, map_location=self.device)
        
        self.model = GRUAutoencoder(
            input_dim=checkpoint.get('input_dim', 6),
            hidden_dim=checkpoint.get('hidden_dim', 64),
            num_layers=checkpoint.get('num_layers', 2)
        )
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.to(self.device)
        self.model.eval()
        
        self.threshold = checkpoint.get('threshold', 0.5)
        # Initialize scalers with identity if not in checkpoint
        self.scaler_mean = checkpoint.get('scaler_mean', 0.0)
        self.scaler_std = checkpoint.get('scaler_std', 1.0)
        
    def normalize(self, data: np.ndarray) -> np.ndarray:
        return (data - self.scaler_mean) / (self.scaler_std + 1e-8)
    
    def prepare_sequence(self, data: np.ndarray, window_size: int = 50) -> np.ndarray:
        # Handle both 1D and 2D input data
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        
        if len(data) < window_size:
            padding = np.repeat(data[0:1], window_size - len(data), axis=0)
            data = np.concatenate([padding, data], axis=0)
        elif len(data) > window_size:
            data = data[-window_size:]
        
        normalized = self.normalize(data)
        return normalized.reshape(1, window_size, -1)
    
    def update_rolling_threshold(self, error: float):
        """Dynamic adaptive threshold"""
        self.rolling_window.append(error)
        if len(self.rolling_window) > self.rolling_size:
            self.rolling_window.pop(0)
        
        if len(self.rolling_window) >= 10:
            rolling_mean = np.mean(self.rolling_window)
            rolling_std = np.std(self.rolling_window)
            self.threshold = rolling_mean + 3 * rolling_std
    
    def predict(self, timeseries_data: np.ndarray, window_size: int = 50) -> Tuple[float, np.ndarray]:
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        sequence = self.prepare_sequence(timeseries_data, window_size)
        
        with torch.no_grad():
            input_tensor = torch.FloatTensor(sequence).to(self.device)
            reconstruction = self.model(input_tensor)
            
            mse = torch.mean((input_tensor - reconstruction) ** 2, dim=(1, 2))
            reconstruction_error = mse.cpu().numpy()[0]
        
        self.update_rolling_threshold(reconstruction_error)
        
        anomaly_score = min(reconstruction_error / self.threshold, 1.0)
        
        # Return reconstruction as 2D array (timesteps, features)
        return float(anomaly_score), reconstruction.cpu().numpy()[0]
