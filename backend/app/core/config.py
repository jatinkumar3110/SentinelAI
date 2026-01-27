import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    MODEL_NAME: str = os.getenv("MODEL_NAME", "distilbert-base-uncased-finetuned-sst-2-english")
    PORT: int = int(os.getenv("PORT", "7860"))


settings = Settings()
