# 🚀 Guia Rápido de Deploy - Railway

## Opção 1: Deploy via GitHub (Recomendado)

### 1. Criar Repositório no GitHub

```bash
cd Railway
git init
git add .
git commit -m "Initial commit: DecifraVoz web app"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/decifravoz.git
git push -u origin main
```

### 2. Deploy no Railway

1. Acesse: https://railway.app
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha o repositório **decifravoz**
5. Railway detectará automaticamente e iniciará o deploy
6. Aguarde o build completar (~5-10 minutos)
7. Clique em **"Generate Domain"** para obter URL pública

✅ **Pronto!** Sua aplicação estará online.

---

## Opção 2: Deploy via Railway CLI

### 1. Instalar Railway CLI

```bash
# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh
```

### 2. Login e Deploy

```bash
cd Railway
railway login
railway init
railway up
railway open
```

---

## ⚙️ Configurações Importantes

### Variáveis de Ambiente (Opcional)

No painel do Railway, vá em **Variables** e adicione:

```
PORT=5000
PYTHONUNBUFFERED=1
```

### Recursos Recomendados

**Plano Gratuito (Trial):**
- RAM: 512MB
- CPU: Compartilhado
- Modelo recomendado: **tiny** ou **base**

**Plano Hobby ($5/mês):**
- RAM: 8GB
- CPU: Compartilhado
- Modelos: **small** ou **medium**

---

## 🔍 Verificar Status

### Via Dashboard
1. Acesse railway.app
2. Selecione seu projeto
3. Veja logs em tempo real na aba **"Deployments"**

### Via CLI
```bash
railway logs
railway status
```

---

## 🐛 Troubleshooting

### Erro: "Out of Memory"
**Solução:** Use modelo menor (tiny ou base) ou faça upgrade do plano

### Erro: "Build Failed"
**Solução:** Verifique logs e confirme que requirements.txt está correto

### Erro: "Application Timeout"
**Solução:** Arquivos muito grandes. Limite upload ou divida áudio

### Aplicação não inicia
**Solução:** Verifique se Procfile está correto:
```
web: gunicorn app:app
```

---

## 📊 Monitoramento

### Métricas Disponíveis
- CPU Usage
- Memory Usage
- Network Traffic
- Request Count

Acesse: **Dashboard → Metrics**

---

## 🔄 Atualizações

### Deploy Automático (GitHub)
Qualquer push para `main` dispara novo deploy automaticamente.

### Deploy Manual (CLI)
```bash
git add .
git commit -m "Update"
railway up
```

---

## 💡 Dicas

1. **Primeira execução é lenta** - Whisper baixa modelos (~100MB-1.5GB)
2. **Use modelo adequado** - Plano gratuito = tiny/base
3. **Monitore uso** - Railway cobra por uso após trial
4. **Backup dados** - Exporte histórico e correções periodicamente
5. **Custom Domain** - Configure domínio próprio nas configurações

---

## 📞 Suporte Railway

- Documentação: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

---

## ✅ Checklist Pré-Deploy

- [ ] Código commitado no Git
- [ ] requirements.txt atualizado
- [ ] Procfile configurado
- [ ] .gitignore incluído
- [ ] README.md documentado
- [ ] Testado localmente
- [ ] Conta Railway criada
- [ ] Repositório GitHub criado (se usar Opção 1)

---

**Boa sorte com seu deploy! 🚀**
