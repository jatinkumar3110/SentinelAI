from transformers import AutoTokenizer, AutoModelForSequenceClassification
from app.core.config import settings

_tokenizer = None
_model = None


def load_model():
    global _tokenizer, _model
    if _tokenizer is None or _model is None:
        _tokenizer = AutoTokenizer.from_pretrained(settings.MODEL_NAME)
        _model = AutoModelForSequenceClassification.from_pretrained(settings.MODEL_NAME)
    return _tokenizer, _model


def get_tokenizer():
    tokenizer, _ = load_model()
    return tokenizer


def get_model():
    _, model = load_model()
    return model
