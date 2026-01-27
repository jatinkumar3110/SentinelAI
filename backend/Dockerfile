FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

ENV TRANSFORMERS_NO_ADVISORY_WARNINGS=1
ENV HF_HUB_DISABLE_TELEMETRY=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p backend/models backend/data
RUN chmod +x start.sh

ENV MODEL_PATH=backend/models
ENV DATA_PATH=backend/data

CMD ["bash", "start.sh"]
