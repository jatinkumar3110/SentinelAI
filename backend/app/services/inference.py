import torch
from app.ml.model_loader import get_tokenizer, get_model


def get_prediction(text: str) -> dict:
    tokenizer = get_tokenizer()
    model = get_model()
    
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=-1)
        predicted_class = torch.argmax(probs, dim=-1).item()
        confidence = probs[0][predicted_class].item()
    
    label_map = {0: "NEGATIVE", 1: "POSITIVE"}
    label = label_map.get(predicted_class, "UNKNOWN")
    
    return {"label": label, "confidence": confidence}
