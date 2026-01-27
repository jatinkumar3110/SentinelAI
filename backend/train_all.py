"""
Quick start script to train all models sequentially.
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from setup_models import setup_directories, setup_distilbert_model
from app.train.train_lstm import train_lstm_autoencoder
from app.train.train_xgboost import train_xgboost_classifier
from app.train.evaluate import save_evaluation_results


def main():
    print("=" * 60)
    print("SENTINELAI - Model Training Pipeline")
    print("=" * 60)
    
    print("\n[1/5] Setting up directories...")
    setup_directories()
    
    print("\n[2/5] Setting up DistilBERT...")
    setup_distilbert_model()
    
    print("\n[3/5] Training LSTM Autoencoder...")
    train_lstm_autoencoder()
    
    print("\n[4/5] Training XGBoost Classifier...")
    train_xgboost_classifier()
    
    print("\n[5/5] Evaluating models...")
    save_evaluation_results()
    
    print("\n" + "=" * 60)
    print("Training Complete!")
    print("=" * 60)
    print("\nYou can now start the backend server:")
    print("  uvicorn app.main:app --reload")


if __name__ == "__main__":
    main()
