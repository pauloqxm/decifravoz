@echo off
echo ========================================
echo   Preparando para GitHub/Railway
echo ========================================
echo.

set SOURCE_DIR=.
set DEPLOY_DIR=..\DecifraVoz-Deploy

echo [1/4] Criando pasta de deploy...
if exist "%DEPLOY_DIR%" (
    echo Pasta ja existe, limpando...
    rmdir /s /q "%DEPLOY_DIR%"
)
mkdir "%DEPLOY_DIR%"
echo.

echo [2/4] Copiando arquivos essenciais...

REM Arquivos raiz
copy app.py "%DEPLOY_DIR%\"
copy requirements.txt "%DEPLOY_DIR%\"
copy Procfile "%DEPLOY_DIR%\"
copy runtime.txt "%DEPLOY_DIR%\"
copy railway.json "%DEPLOY_DIR%\"
copy .gitignore "%DEPLOY_DIR%\"
copy LICENSE "%DEPLOY_DIR%\"

REM Documentacao
copy README.md "%DEPLOY_DIR%\"
copy QUICKSTART.md "%DEPLOY_DIR%\"
copy DEPLOY.md "%DEPLOY_DIR%\"
copy API.md "%DEPLOY_DIR%\"

REM Templates
mkdir "%DEPLOY_DIR%\templates"
copy templates\index.html "%DEPLOY_DIR%\templates\"

REM Static
mkdir "%DEPLOY_DIR%\static"
copy static\style.css "%DEPLOY_DIR%\static\"
copy static\script.js "%DEPLOY_DIR%\static\"

REM Data
mkdir "%DEPLOY_DIR%\data"
copy data\.gitkeep "%DEPLOY_DIR%\data\"
copy data\correcoes_custom.json "%DEPLOY_DIR%\data\"
copy data\historico_transcricoes.json "%DEPLOY_DIR%\data\"

REM Uploads
mkdir "%DEPLOY_DIR%\uploads"
copy uploads\.gitkeep "%DEPLOY_DIR%\uploads\"

echo.
echo [3/4] Verificando estrutura...
dir /b "%DEPLOY_DIR%"
echo.

echo [4/4] Criando arquivo de instrucoes...
(
echo # DecifraVoz - Deploy
echo.
echo Estrutura pronta para deploy no Railway!
echo.
echo ## Proximos passos:
echo.
echo 1. Inicializar Git:
echo    git init
echo    git add .
echo    git commit -m "Initial commit"
echo.
echo 2. Criar repositorio no GitHub
echo.
echo 3. Conectar e fazer push:
echo    git remote add origin https://github.com/SEU_USUARIO/decifravoz.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 4. Deploy no Railway:
echo    - Acesse railway.app
echo    - New Project
echo    - Deploy from GitHub repo
echo    - Selecione seu repositorio
echo    - Aguarde deploy
echo    - Gere dominio publico
echo.
echo Pronto! Sua aplicacao estara online.
) > "%DEPLOY_DIR%\DEPLOY_INSTRUCTIONS.txt"

echo.
echo ========================================
echo   Preparacao Concluida!
echo ========================================
echo.
echo Pasta criada: %DEPLOY_DIR%
echo.
echo Arquivos copiados:
echo   - Codigo da aplicacao (app.py, requirements.txt, etc)
echo   - Frontend (templates, static)
echo   - Dados iniciais (data/)
echo   - Configuracoes (Procfile, railway.json, etc)
echo   - Documentacao (README.md, etc)
echo.
echo Proximos passos:
echo   1. Abra a pasta: %DEPLOY_DIR%
echo   2. Leia: DEPLOY_INSTRUCTIONS.txt
echo   3. Siga as instrucoes para fazer deploy
echo.
echo OU execute os comandos abaixo:
echo.
echo   cd %DEPLOY_DIR%
echo   git init
echo   git add .
echo   git commit -m "Initial commit"
echo.
pause
