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

# Script que expande PORT corretamente em tempo de execução
RUN chmod +x entrypoint.sh

ENV PORT=5000
EXPOSE 5000

CMD ["./entrypoint.sh"]
