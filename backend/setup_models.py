"""
Setup script to prepare models and data directories for training.
Run this before training models.
"""

from pathlib import Path
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
import torch

from app.core.config import settings


def setup_directories():
    """Create required directories."""
    settings.MODEL_DIR.mkdir(parents=True, exist_ok=True)
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Created directories: {settings.MODEL_DIR}, {settings.DATA_DIR}")


def setup_distilbert_model():
    """Download and save DistilBERT model for log classification."""
    print("Downloading DistilBERT model...")
    
    tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
    model = DistilBertForSequenceClassification.from_pretrained(
        'distilbert-base-uncased',
        num_labels=2
    )
    
    settings.BERT_MODEL_PATH.mkdir(parents=True, exist_ok=True)
    
    tokenizer.save_pretrained(str(settings.BERT_MODEL_PATH))
    model.save_pretrained(str(settings.BERT_MODEL_PATH))
    
    print(f"DistilBERT model saved to {settings.BERT_MODEL_PATH}")


if __name__ == "__main__":
    setup_directories()
    setup_distilbert_model()
    print("\nSetup complete! You can now train the models.")
    print("\nRun the following commands:")
    print("  python -m app.train.train_lstm")
    print("  python -m app.train.train_xgboost")
    print("  python -m app.train.evaluate")
