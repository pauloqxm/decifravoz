# 📡 API Documentation - DecifraVoz

## Base URL
```
http://localhost:5000
```

## Endpoints

### 1. GET `/`
Retorna a página principal da aplicação.

**Response:**
- HTML page

---

### 2. GET `/api/models`
Lista os modelos Whisper disponíveis.

**Response:**
```json
{
  "models": ["tiny", "base", "small", "medium", "large"]
}
```

---

### 3. POST `/api/transcribe`
Transcreve um arquivo de áudio.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `audio`: File (required) - Arquivo de áudio
  - `model`: String (optional) - Modelo Whisper (default: "base")

**Formatos aceitos:**
- MP3, WAV, MP4, M4A, OGG, FLAC

**Response Success (200):**
```json
{
  "success": true,
  "text": "Texto completo transcrito...",
  "segments": [
    {
      "start": 0.0,
      "end": 5.5,
      "text": "Primeira frase transcrita"
    },
    {
      "start": 5.5,
      "end": 12.3,
      "text": "Segunda frase transcrita"
    }
  ],
  "stats": {
    "duration": 8.4,
    "processing_time": 771.8,
    "word_count": 597,
    "model": "base"
  }
}
```

**Response Error (400/500):**
```json
{
  "error": "Mensagem de erro"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:5000/api/transcribe \
  -F "audio=@audio.mp3" \
  -F "model=base"
```

**Exemplo Python:**
```python
import requests

url = "http://localhost:5000/api/transcribe"
files = {"audio": open("audio.mp3", "rb")}
data = {"model": "base"}

response = requests.post(url, files=files, data=data)
print(response.json())
```

**Exemplo JavaScript:**
```javascript
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('model', 'base');

fetch('/api/transcribe', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

---

### 4. GET `/api/history`
Retorna o histórico de transcrições.

**Response:**
```json
{
  "history": [
    {
      "timestamp": "2026-02-27T23:13:42.889410",
      "arquivo": "audio.mp3",
      "modelo": "base",
      "duracao_min": 8.4,
      "tempo_proc": 771.8,
      "palavras": 597,
      "preview": "Texto preview..."
    }
  ]
}
```

**Exemplo cURL:**
```bash
curl http://localhost:5000/api/history
```

---

### 5. GET `/api/corrections`
Retorna o dicionário de correções.

**Response:**
```json
{
  "corrections": {
    "erfeito": "prefeito",
    "Banábuio": "Banabuiú",
    "Unicípio": "município"
  }
}
```

**Exemplo cURL:**
```bash
curl http://localhost:5000/api/corrections
```

---

### 6. POST `/api/corrections`
Adiciona uma nova correção ao dicionário.

**Request:**
- Content-Type: `application/json`
- Body:
```json
{
  "wrong": "palavra_errada",
  "correct": "palavra_correta"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "corrections": {
    "palavra_errada": "palavra_correta",
    ...
  }
}
```

**Response Error (400):**
```json
{
  "error": "Campos inválidos"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:5000/api/corrections \
  -H "Content-Type: application/json" \
  -d '{"wrong": "erfeito", "correct": "prefeito"}'
```

**Exemplo Python:**
```python
import requests

url = "http://localhost:5000/api/corrections"
data = {
  "wrong": "erfeito",
  "correct": "prefeito"
}

response = requests.post(url, json=data)
print(response.json())
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad Request (arquivo inválido, campos faltando) |
| 500  | Internal Server Error (erro no processamento) |

---

## Rate Limiting

Atualmente não há rate limiting implementado. Para produção, considere adicionar:

```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.remote_addr,
    default_limits=["100 per hour"]
)

@app.route('/api/transcribe', methods=['POST'])
@limiter.limit("10 per hour")
def transcribe():
    # ...
```

---

## CORS

Para permitir requisições de outros domínios:

```python
from flask_cors import CORS

CORS(app, resources={
    r"/api/*": {
        "origins": ["https://seu-frontend.com"]
    }
})
```

---

## Autenticação

Atualmente não há autenticação. Para adicionar:

```python
from functools import wraps

def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if api_key != 'SUA_CHAVE_SECRETA':
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/api/transcribe', methods=['POST'])
@require_api_key
def transcribe():
    # ...
```

---

## Webhooks (Futuro)

Para notificar quando transcrição estiver pronta:

```python
@app.route('/api/transcribe-async', methods=['POST'])
def transcribe_async():
    # Processar em background
    # Enviar webhook quando concluir
    webhook_url = request.form.get('webhook_url')
    # ...
```

---

## Exemplos de Integração

### Python Script
```python
#!/usr/bin/env python3
import requests
import sys

def transcribe_audio(file_path, model='base'):
    url = 'http://localhost:5000/api/transcribe'
    
    with open(file_path, 'rb') as f:
        files = {'audio': f}
        data = {'model': model}
        
        print(f"Transcrevendo {file_path}...")
        response = requests.post(url, files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Transcrição concluída!")
            print(f"Palavras: {result['stats']['word_count']}")
            print(f"Tempo: {result['stats']['processing_time']:.1f}s")
            print(f"\nTexto:\n{result['text']}")
            return result
        else:
            print(f"❌ Erro: {response.json()['error']}")
            return None

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python transcribe.py <arquivo.mp3> [modelo]")
        sys.exit(1)
    
    file_path = sys.argv[1]
    model = sys.argv[2] if len(sys.argv) > 2 else 'base'
    
    transcribe_audio(file_path, model)
```

### Node.js Script
```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function transcribeAudio(filePath, model = 'base') {
  const form = new FormData();
  form.append('audio', fs.createReadStream(filePath));
  form.append('model', model);

  try {
    console.log(`Transcrevendo ${filePath}...`);
    
    const response = await axios.post(
      'http://localhost:5000/api/transcribe',
      form,
      { headers: form.getHeaders() }
    );

    console.log('\n✅ Transcrição concluída!');
    console.log(`Palavras: ${response.data.stats.word_count}`);
    console.log(`Tempo: ${response.data.stats.processing_time.toFixed(1)}s`);
    console.log(`\nTexto:\n${response.data.text}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Erro:', error.response?.data?.error || error.message);
    return null;
  }
}

// Uso
const filePath = process.argv[2];
const model = process.argv[3] || 'base';

if (!filePath) {
  console.log('Uso: node transcribe.js <arquivo.mp3> [modelo]');
  process.exit(1);
}

transcribeAudio(filePath, model);
```

---

## Performance Tips

1. **Use modelo adequado**: tiny/base para rapidez, medium/large para precisão
2. **Comprima áudio**: Reduza bitrate para upload mais rápido
3. **Divida arquivos grandes**: Processe em chunks menores
4. **Cache modelos**: Modelos são baixados apenas na primeira vez
5. **Use GPU**: Se disponível, acelera processamento em 5-10x

---

## Limites

| Recurso | Limite |
|---------|--------|
| Tamanho máximo arquivo | 500 MB |
| Duração máxima áudio | Sem limite (mas considere timeout) |
| Histórico | Últimas 20 transcrições |
| Correções | Ilimitado |

---

**API DecifraVoz** - Simples, poderosa e eficiente! 🚀
