from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
import torch
from pathlib import Path
from typing import Tuple


class LogAnomalyClassifier:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
    def load_model(self, model_path: Path):
        self.tokenizer = DistilBertTokenizer.from_pretrained(str(model_path))
        self.model = DistilBertForSequenceClassification.from_pretrained(str(model_path))
        self.model.to(self.device)
        self.model.eval()
    
    def predict(self, log_text: str) -> Tuple[float, dict]:
        if self.model is None or self.tokenizer is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        inputs = self.tokenizer(
            log_text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True
        )
        
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=-1)
            
            anomaly_prob = probabilities[0][1].cpu().item()
        
        attention_scores = {
            'tokens': self.tokenizer.convert_ids_to_tokens(inputs['input_ids'][0]),
            'attention_weights': inputs['attention_mask'][0].cpu().tolist()
        }
        
        return float(anomaly_prob), attention_scores
