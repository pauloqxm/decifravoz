# ⚡ Início Rápido - DecifraVoz

## 🎯 O que é?

**DecifraVoz** é uma aplicação web que transcreve áudio em texto usando IA (Whisper da OpenAI).

---

## 🚀 Teste Local (3 minutos)

### Windows (Anaconda)
```bash
cd Railway
start.bat
```

### Windows (Ambiente Conda Isolado)
```bash
cd Railway
start_conda_env.bat
```

### Linux/Mac
```bash
cd Railway
chmod +x start.sh
./start.sh
```

Acesse: **http://localhost:5000**

> 💡 **Nota**: Se usar Anaconda, veja [ANACONDA_GUIDE.md](ANACONDA_GUIDE.md) para mais opções

---

## ☁️ Deploy no Railway (5 minutos)

### Método Rápido

1. **Criar conta**: https://railway.app
2. **Novo projeto**: "Deploy from GitHub repo"
3. **Conectar repositório**
4. **Aguardar build** (~5 min)
5. **Gerar domínio público**

✅ **Pronto!** Aplicação online.

### Detalhes completos
Veja: [DEPLOY.md](DEPLOY.md)

---

## 📖 Documentação

| Arquivo | Descrição |
|---------|-----------|
| [README.md](README.md) | Documentação completa |
| [DEPLOY.md](DEPLOY.md) | Guia de deploy Railway |
| [API.md](API.md) | Documentação da API |
| [VISUAL.md](VISUAL.md) | Design e interface |

---

## 🎨 Interface

### 1️⃣ Upload de Áudio
- Arraste ou clique para selecionar
- Formatos: MP3, WAV, MP4, M4A, OGG, FLAC

### 2️⃣ Escolha o Modelo
- **Tiny**: Rápido (39 MB)
- **Base**: Recomendado (74 MB) ⭐
- **Small**: Preciso (244 MB)
- **Medium**: Premium (769 MB)

### 3️⃣ Transcrever
- Clique em "Iniciar Transcrição"
- Aguarde processamento
- Veja resultados com estatísticas

### 4️⃣ Exportar
- Copiar texto
- Download TXT
- Visualizar timestamps

---

## 🔧 Estrutura

```
Railway/
├── app.py              # Backend Flask + API
├── templates/
│   └── index.html      # Frontend HTML
├── static/
│   ├── style.css       # Estilos modernos
│   └── script.js       # Interatividade
├── data/
│   ├── correcoes_custom.json    # Dicionário
│   └── historico_transcricoes.json  # Histórico
└── uploads/            # Arquivos temporários
```

---

## 🎯 Casos de Uso

✅ Transcrever reuniões  
✅ Converter palestras em texto  
✅ Legendar vídeos  
✅ Documentar entrevistas  
✅ Criar atas de eventos  
✅ Acessibilidade (áudio → texto)

---

## 💡 Dicas

### Performance
- Use **base** para equilíbrio
- Use **tiny** se tiver pouca RAM
- Use **medium** para máxima qualidade

### Qualidade
- Áudio limpo = melhor resultado
- Evite ruído de fundo
- Fala clara e pausada

### Correções
- Adicione termos técnicos
- Nomes próprios específicos
- Siglas e abreviações

---

## 🐛 Problemas Comuns

### "Out of Memory"
**Solução**: Use modelo menor (tiny ou base)

### "Arquivo muito grande"
**Solução**: Comprima áudio ou divida em partes

### "Transcrição imprecisa"
**Solução**: Use modelo maior ou adicione correções

---

## 📊 Comparação de Modelos

| Modelo | Tamanho | Velocidade | Precisão | RAM |
|--------|---------|------------|----------|-----|
| Tiny   | 39 MB   | ⚡⚡⚡⚡⚡ | ⭐⭐ | 512MB |
| Base   | 74 MB   | ⚡⚡⚡⚡ | ⭐⭐⭐ | 1GB |
| Small  | 244 MB  | ⚡⚡⚡ | ⭐⭐⭐⭐ | 2GB |
| Medium | 769 MB  | ⚡⚡ | ⭐⭐⭐⭐⭐ | 5GB |

---

## 🔗 Links Úteis

- **Railway**: https://railway.app
- **Whisper AI**: https://github.com/openai/whisper
- **Flask**: https://flask.palletsprojects.com
- **Documentação**: Veja arquivos .md nesta pasta

---

## 🎓 Próximos Passos

1. ✅ Teste localmente
2. ✅ Faça deploy no Railway
3. ✅ Transcreva seu primeiro áudio
4. ✅ Adicione correções personalizadas
5. ✅ Compartilhe com sua equipe

---

## 🤝 Contribuir

Melhorias são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir features
- Enviar pull requests
- Compartilhar feedback

---

## 📞 Suporte

- 📖 Leia a documentação completa
- 🐛 Abra uma issue no GitHub
- 💬 Entre em contato com o desenvolvedor

---

## ⭐ Features

✅ Transcrição automática com IA  
✅ Múltiplos modelos Whisper  
✅ Interface moderna e responsiva  
✅ Correções personalizadas  
✅ Histórico de transcrições  
✅ Timestamps detalhados  
✅ Export TXT  
✅ API REST  
✅ Deploy fácil no Railway  
✅ 100% Open Source

---

**Comece agora e transforme áudio em texto com IA! 🎙️✨**

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/decifravoz.git

# Entre na pasta
cd decifravoz/Railway

# Execute
./start.sh  # ou start.bat no Windows

# Acesse
http://localhost:5000
```

**Boa transcrição! 🚀**
