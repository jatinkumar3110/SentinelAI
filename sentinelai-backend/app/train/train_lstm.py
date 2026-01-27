import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import pandas as pd
from pathlib import Path
import json

from app.ml.timeseries_model import LSTMAutoencoder
from app.core.config import settings


def generate_synthetic_timeseries(n_samples: int = 10000, window_size: int = 50):
    """Generate synthetic time-series data with anomalies."""
    
    # Ensure data directory exists
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    # Check if cached data exists
    cache_file = settings.DATA_DIR / "timeseries_train_data.npz"
    if cache_file.exists():
        print(f"Loading cached data from {cache_file}")
        data = np.load(cache_file)
        return data['normal'], data['anomaly']
    
    normal_data = []
    for _ in range(int(n_samples * 0.85)):
        t = np.linspace(0, 4 * np.pi, window_size)
        signal = np.sin(t) + 0.1 * np.random.randn(window_size)
        normal_data.append(signal)
    
    anomaly_data = []
    for _ in range(int(n_samples * 0.15)):
        t = np.linspace(0, 4 * np.pi, window_size)
        signal = np.sin(t) + 0.5 * np.random.randn(window_size)
        spike_idx = np.random.randint(10, window_size - 10)
        signal[spike_idx:spike_idx + 5] += np.random.uniform(2, 5)
        anomaly_data.append(signal)
    
    normal_data = np.array(normal_data)
    anomaly_data = np.array(anomaly_data)
    
    # Cache the generated data
    np.savez(cache_file, normal=normal_data, anomaly=anomaly_data)
    print(f"Cached data saved to {cache_file}")
    
    return normal_data, anomaly_data


def train_lstm_autoencoder():
    """Train LSTM Autoencoder for time-series anomaly detection."""
    
    print("Generating synthetic time-series data...")
    normal_data, anomaly_data = generate_synthetic_timeseries(
        n_samples=10000,
        window_size=settings.TIMESERIES_WINDOW_SIZE
    )
    
    train_size = int(len(normal_data) * 0.8)
    train_data = normal_data[:train_size]
    val_data = normal_data[train_size:]
    
    scaler_mean = np.mean(train_data)
    scaler_std = np.std(train_data)
    
    train_normalized = (train_data - scaler_mean) / (scaler_std + 1e-8)
    val_normalized = (val_data - scaler_mean) / (scaler_std + 1e-8)
    
    train_tensor = torch.FloatTensor(train_normalized).unsqueeze(-1)
    val_tensor = torch.FloatTensor(val_normalized).unsqueeze(-1)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")
    
    model = LSTMAutoencoder(
        input_dim=1,
        hidden_dim=settings.LSTM_HIDDEN_DIM,
        num_layers=2
    ).to(device)
    
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    batch_size = 64
    epochs = 50
    
    print("Training LSTM Autoencoder...")
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        
        indices = np.random.permutation(len(train_tensor))
        
        for i in range(0, len(train_tensor), batch_size):
            batch_indices = indices[i:i + batch_size]
            batch = train_tensor[batch_indices].to(device)
            
            optimizer.zero_grad()
            reconstruction = model(batch)
            loss = criterion(reconstruction, batch)
            
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
        
        avg_loss = total_loss / (len(train_tensor) / batch_size)
        
        if (epoch + 1) % 10 == 0:
            model.eval()
            with torch.no_grad():
                val_reconstruction = model(val_tensor.to(device))
                val_loss = criterion(val_reconstruction, val_tensor.to(device))
            print(f"Epoch [{epoch+1}/{epochs}], Train Loss: {avg_loss:.6f}, Val Loss: {val_loss.item():.6f}")
    
    print("Calculating anomaly threshold...")
    model.eval()
    with torch.no_grad():
        val_reconstruction = model(val_tensor.to(device))
        reconstruction_errors = torch.mean((val_tensor.to(device) - val_reconstruction) ** 2, dim=(1, 2))
        threshold = np.percentile(reconstruction_errors.cpu().numpy(), settings.ANOMALY_THRESHOLD_PERCENTILE)
    
    print(f"Anomaly threshold (95th percentile): {threshold:.6f}")
    
    settings.MODEL_DIR.mkdir(parents=True, exist_ok=True)
    
    checkpoint = {
        'model_state_dict': model.state_dict(),
        'threshold': float(threshold),
        'scaler_mean': float(scaler_mean),
        'scaler_std': float(scaler_std)
    }
    
    torch.save(checkpoint, settings.LSTM_MODEL_PATH)
    print(f"Model saved to {settings.LSTM_MODEL_PATH}")
    
    return model, threshold


if __name__ == "__main__":
    train_lstm_autoencoder()
