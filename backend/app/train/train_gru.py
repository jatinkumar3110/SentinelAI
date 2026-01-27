import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import roc_auc_score, roc_curve
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from ml.gru_model import GRUAutoencoder
from core.config import settings

def generate_synthetic_data(n_samples=1000, window_size=50, n_features=6):
    """Generate synthetic time-series data with anomalies"""
    
    # Ensure data directory exists
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    # Check if cached data exists
    cache_file = settings.DATA_DIR / "gru_train_data.npz"
    if cache_file.exists():
        print(f"Loading cached data from {cache_file}")
        data = np.load(cache_file)
        return data['X'], data['y']
    
    np.random.seed(42)
    
    # Normal data: sinusoidal patterns with noise
    normal_data = []
    for _ in range(int(n_samples * 0.8)):
        t = np.linspace(0, 10, window_size)
        sample = np.zeros((window_size, n_features))
        for i in range(n_features):
            freq = np.random.uniform(0.5, 2.0)
            phase = np.random.uniform(0, 2*np.pi)
            amplitude = np.random.uniform(0.5, 1.5)
            sample[:, i] = amplitude * np.sin(freq * t + phase) + np.random.normal(0, 0.1, window_size)
        normal_data.append(sample)
    
    # Anomalous data: spikes, drops, and irregular patterns
    anomaly_data = []
    for _ in range(int(n_samples * 0.2)):
        t = np.linspace(0, 10, window_size)
        sample = np.zeros((window_size, n_features))
        for i in range(n_features):
            freq = np.random.uniform(0.5, 2.0)
            phase = np.random.uniform(0, 2*np.pi)
            amplitude = np.random.uniform(0.5, 1.5)
            base = amplitude * np.sin(freq * t + phase)
            
            # Add anomalies
            anomaly_type = np.random.choice(['spike', 'drop', 'noise'])
            if anomaly_type == 'spike':
                spike_idx = np.random.randint(10, window_size - 10)
                base[spike_idx:spike_idx+5] += np.random.uniform(2, 4)
            elif anomaly_type == 'drop':
                drop_idx = np.random.randint(10, window_size - 10)
                base[drop_idx:drop_idx+5] -= np.random.uniform(2, 4)
            else:
                base += np.random.normal(0, 0.5, window_size)
            
            sample[:, i] = base
        anomaly_data.append(sample)
    
    # Combine and create labels
    X = np.array(normal_data + anomaly_data)
    y = np.array([0] * len(normal_data) + [1] * len(anomaly_data))
    
    # Shuffle
    indices = np.random.permutation(len(X))
    X, y = X[indices], y[indices]
    
    X = X.astype(np.float32)
    
    # Cache the generated data
    np.savez(cache_file, X=X, y=y)
    print(f"Cached data saved to {cache_file}")
    
    return X, y

def train_gru_autoencoder():
    """Train GRU Autoencoder for anomaly detection"""
    print("=" * 60)
    print("GRU AUTOENCODER TRAINING")
    print("=" * 60)
    
    # Hyperparameters
    window_size = 50
    n_features = 6
    hidden_size = 64
    num_layers = 2
    learning_rate = 0.001
    batch_size = 32
    epochs = 50
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Generate data
    print("\nGenerating synthetic data...")
    X, y = generate_synthetic_data(n_samples=1000, window_size=window_size, n_features=n_features)
    
    # Split data
    split_idx = int(0.8 * len(X))
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    print(f"Training samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")
    print(f"Anomaly ratio: {y.mean():.2%}")
    
    # Create DataLoader
    train_dataset = TensorDataset(torch.from_numpy(X_train), torch.from_numpy(y_train))
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    
    # Initialize model
    model = GRUAutoencoder(
        input_dim=n_features,
        hidden_dim=hidden_size,
        num_layers=num_layers
    ).to(device)
    
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, 'min', patience=5, factor=0.5)
    
    # Training loop
    print("\nTraining GRU Autoencoder...")
    train_losses = []
    
    for epoch in range(epochs):
        model.train()
        epoch_loss = 0
        
        for batch_X, _ in train_loader:
            batch_X = batch_X.to(device)
            
            optimizer.zero_grad()
            reconstructed = model(batch_X)
            loss = criterion(reconstructed, batch_X)
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
        
        avg_loss = epoch_loss / len(train_loader)
        train_losses.append(avg_loss)
        scheduler.step(avg_loss)
        
        if (epoch + 1) % 10 == 0:
            print(f"Epoch [{epoch+1}/{epochs}], Loss: {avg_loss:.6f}")
    
    # Evaluation
    print("\nEvaluating on test set...")
    model.eval()
    
    with torch.no_grad():
        X_test_tensor = torch.from_numpy(X_test).to(device)
        reconstructed = model(X_test_tensor).cpu().numpy()
        
        # Calculate reconstruction error
        reconstruction_error = np.mean(np.square(X_test - reconstructed), axis=(1, 2))
        
        # Calculate ROC-AUC
        roc_auc = roc_auc_score(y_test, reconstruction_error)
        print(f"ROC-AUC Score: {roc_auc:.4f}")
        
        # Find optimal threshold
        fpr, tpr, thresholds = roc_curve(y_test, reconstruction_error)
        optimal_idx = np.argmax(tpr - fpr)
        optimal_threshold = thresholds[optimal_idx]
        print(f"Optimal Threshold: {optimal_threshold:.6f}")
    
    # Save model
    os.makedirs('../models', exist_ok=True)
    model_path = '../models/gru_autoencoder.pth'
    
    torch.save({
        'model_state_dict': model.state_dict(),
        'input_dim': n_features,
        'hidden_dim': hidden_size,
        'num_layers': num_layers,
        'threshold': optimal_threshold,
        'roc_auc': roc_auc
    }, model_path)
    
    print(f"\nModel saved to: {model_path}")
    
    # Plot training loss
    plt.figure(figsize=(10, 5))
    plt.plot(train_losses, label='Training Loss')
    plt.xlabel('Epoch')
    plt.ylabel('MSE Loss')
    plt.title('GRU Autoencoder Training Loss')
    plt.legend()
    plt.grid(True)
    plt.savefig('../models/gru_training_loss.png')
    print("Training loss plot saved to: ../models/gru_training_loss.png")
    
    # Plot ROC curve
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, label=f'ROC Curve (AUC = {roc_auc:.4f})')
    plt.plot([0, 1], [0, 1], 'k--', label='Random')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('GRU Autoencoder ROC Curve')
    plt.legend()
    plt.grid(True)
    plt.savefig('../models/gru_roc_curve.png')
    print("ROC curve plot saved to: ../models/gru_roc_curve.png")
    
    print("\n" + "=" * 60)
    print("GRU TRAINING COMPLETE!")
    print("=" * 60)

if __name__ == "__main__":
    train_gru_autoencoder()
