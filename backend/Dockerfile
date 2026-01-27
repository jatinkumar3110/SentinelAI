FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV MODEL_NAME=distilbert-base-uncased-finetuned-sst-2-english
ENV PORT=7860

EXPOSE 7860

CMD ["bash", "start.sh"]
