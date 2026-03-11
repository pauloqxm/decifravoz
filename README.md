# DecifraVoz - Sistema de Transcrição de Áudio

Sistema web de transcrição de áudio usando Whisper AI da OpenAI.

## 📋 Pré-requisitos

- Python 3.11+
- **FFmpeg** (obrigatório para processar áudio)

### Instalar FFmpeg

**Windows:**
```bash
# Via Chocolatey (recomendado)
choco install ffmpeg -y

# Ou via Conda
conda install -c conda-forge ffmpeg -y

# Ou use o script automático
install_ffmpeg.bat
```

**Linux:**
```bash
sudo apt install ffmpeg  # Ubuntu/Debian
sudo yum install ffmpeg  # CentOS/RHEL
```

**macOS:**
```bash
brew install ffmpeg
```

Verifique a instalação:
```bash
ffmpeg -version
```

## 🚀 Características

- **Transcrição Automática**: Converte áudio em texto usando modelos Whisper
- **Múltiplos Modelos**: Escolha entre tiny, base, small, medium e large
- **Correções Personalizadas**: Dicionário customizável para termos específicos
- **Histórico**: Acompanhe todas as transcrições realizadas
- **Interface Moderna**: Design responsivo e atraente
- **Timestamps**: Visualize o texto com marcações de tempo

## 📋 Formatos Suportados

- MP3
- WAV
- MP4
- M4A
- OGG
- FLAC

## 🛠️ Tecnologias

- **Backend**: Flask (Python)
- **IA**: OpenAI Whisper
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Deploy**: Railway

## 🚂 Deploy no Railway

### Passo 1: Preparar o Repositório

```bash
cd Railway
git init
git add .
git commit -m "Initial commit"
```

### Passo 2: Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Conecte seu repositório

### Passo 3: Configurar Variáveis de Ambiente (Opcional)

No painel do Railway, adicione:

```
PORT=5000
```

### Passo 4: Deploy Automático

O Railway detectará automaticamente:
- `requirements.txt` - Instalará as dependências
- `Procfile` - Executará o comando de inicialização
- `runtime.txt` - Usará a versão correta do Python

## 💻 Desenvolvimento Local

### Instalação

#### Opção 1: Usando Anaconda (Recomendado para Windows)

```bash
# Executar script automático
start.bat

# Ou criar ambiente conda isolado
start_conda_env.bat
```

Veja [ANACONDA_GUIDE.md](ANACONDA_GUIDE.md) para mais detalhes.

#### Opção 2: Usando Python padrão

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### Executar

```bash
python app.py
```

Acesse: `http://localhost:5000`

## 📁 Estrutura do Projeto

```
Railway/
├── app.py                 # Backend Flask
├── templates/
│   └── index.html        # Frontend HTML
├── static/
│   ├── style.css         # Estilos
│   └── script.js         # JavaScript
├── uploads/              # Arquivos temporários
├── data/
│   ├── correcoes_custom.json      # Dicionário de correções
│   └── historico_transcricoes.json # Histórico
├── requirements.txt      # Dependências Python
├── Procfile             # Comando Railway
├── runtime.txt          # Versão Python
└── README.md            # Documentação
```

## 🎨 Funcionalidades

### 1. Transcrição
- Upload de arquivo de áudio
- Seleção de modelo (tiny, base, small, medium)
- Processamento com feedback visual
- Exibição de resultados com estatísticas

### 2. Histórico
- Lista das últimas 20 transcrições
- Informações: arquivo, data, duração, modelo
- Preview do texto transcrito

### 3. Correções
- Adicionar termos personalizados
- Substituição automática durante transcrição
- Gerenciamento de dicionário

## ⚙️ Modelos Whisper

| Modelo | Tamanho | Velocidade | Precisão |
|--------|---------|------------|----------|
| tiny   | ~39 MB  | Muito rápido | Básica |
| base   | ~74 MB  | Rápido | Boa |
| small  | ~244 MB | Médio | Muito boa |
| medium | ~769 MB | Lento | Excelente |
| large  | ~1550 MB | Muito lento | Máxima |

## 🔧 Configuração Avançada

### Aumentar Limite de Upload

No `app.py`, modifique:

```python
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB
```

### Usar GPU (se disponível)

O sistema detecta automaticamente GPU CUDA. Para forçar CPU:

```python
device = "cpu"
model = whisper.load_model(model_name, device=device)
```

## 📝 Notas

- Primeira transcrição pode demorar (download do modelo)
- Modelos maiores requerem mais memória RAM
- Railway oferece 500MB RAM no plano gratuito (use tiny ou base)
- Para modelos maiores, considere upgrade do plano

## 🐛 Troubleshooting

### Erro de Memória
- Use modelo menor (tiny ou base)
- Reduza tamanho do arquivo de áudio

### Timeout
- Arquivos muito grandes podem exceder tempo limite
- Divida áudio em partes menores

### Erro de Dependências
- Verifique versões no `requirements.txt`
- Limpe cache: `pip cache purge`

## 📄 Licença

Este projeto é de código aberto.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📧 Suporte

Para dúvidas e suporte, abra uma issue no repositório.

---

**DecifraVoz** - Transformando áudio em texto com inteligência artificial 🎙️✨
