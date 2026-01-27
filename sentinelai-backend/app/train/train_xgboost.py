import xgboost as xgb
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from pathlib import Path
import pickle

from app.core.config import settings


def generate_synthetic_tabular_data(n_samples: int = 10000):
    """Generate synthetic tabular data for failure prediction."""
    
    # Ensure data directory exists
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    # Check if cached data exists
    cache_file = settings.DATA_DIR / "xgboost_train_data.csv"
    if cache_file.exists():
        print(f"Loading cached data from {cache_file}")
        return pd.read_csv(cache_file)
    
    np.random.seed(42)
    
    temperature = np.random.normal(75, 15, n_samples)
    pressure = np.random.normal(100, 20, n_samples)
    vibration = np.random.normal(0.5, 0.2, n_samples)
    rotation_speed = np.random.normal(1500, 300, n_samples)
    power_consumption = np.random.normal(250, 50, n_samples)
    operating_hours = np.random.randint(0, 10000, n_samples)
    
    failure_score = (
        (temperature > 90) * 0.3 +
        (pressure > 120) * 0.25 +
        (vibration > 0.8) * 0.25 +
        (power_consumption > 300) * 0.15 +
        (operating_hours > 8000) * 0.05
    )
    
    failure_label = (failure_score > 0.5).astype(int)
    
    noise = np.random.rand(n_samples) * 0.2
    failure_label = ((failure_score + noise) > 0.6).astype(int)
    
    data = pd.DataFrame({
        'temperature': temperature,
        'pressure': pressure,
        'vibration': vibration,
        'rotation_speed': rotation_speed,
        'power_consumption': power_consumption,
        'operating_hours': operating_hours,
        'failure': failure_label
    })
    
    # Cache the generated data
    data.to_csv(cache_file, index=False)
    print(f"Cached data saved to {cache_file}")
    
    return data


def train_xgboost_classifier():
    """Train XGBoost classifier for failure prediction."""
    
    print("Generating synthetic tabular data...")
    data = generate_synthetic_tabular_data(n_samples=10000)
    
    X = data.drop('failure', axis=1).values
    y = data['failure'].values
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    scaler_mean = np.mean(X_train, axis=0)
    scaler_std = np.std(X_train, axis=0)
    
    X_train_normalized = (X_train - scaler_mean) / (scaler_std + 1e-8)
    X_test_normalized = (X_test - scaler_mean) / (scaler_std + 1e-8)
    
    dtrain = xgb.DMatrix(X_train_normalized, label=y_train)
    dtest = xgb.DMatrix(X_test_normalized, label=y_test)
    
    params = {
        'objective': 'binary:logistic',
        'max_depth': 6,
        'learning_rate': 0.1,
        'n_estimators': 100,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'eval_metric': 'logloss',
        'seed': 42
    }
    
    print("Training XGBoost classifier...")
    
    evals = [(dtrain, 'train'), (dtest, 'test')]
    model = xgb.train(
        params,
        dtrain,
        num_boost_round=100,
        evals=evals,
        early_stopping_rounds=10,
        verbose_eval=20
    )
    
    settings.MODEL_DIR.mkdir(parents=True, exist_ok=True)
    
    model.save_model(str(settings.XGBOOST_MODEL_PATH))
    print(f"Model saved to {settings.XGBOOST_MODEL_PATH}")
    
    scaler_params = {
        'mean': scaler_mean,
        'std': scaler_std
    }
    
    scaler_path = settings.MODEL_DIR / "xgboost_scaler.pkl"
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler_params, f)
    print(f"Scaler saved to {scaler_path}")
    
    return model


if __name__ == "__main__":
    train_xgboost_classifier()
