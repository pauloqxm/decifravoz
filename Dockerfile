# Imagem base Python 3.11
FROM python:3.11-slim

# FFmpeg para o Whisper processar áudio
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependências primeiro (melhor uso de cache)
COPY requirements.txt .

# PyTorch CPU (menor) + demais pacotes
RUN pip install --no-cache-dir -r requirements.txt

# Código da aplicação
COPY . .

# Railway injeta PORT em tempo de execução
ENV PORT=5000
EXPOSE $PORT

CMD gunicorn app:app --bind 0.0.0.0:$PORT --timeout 600 --workers 1
