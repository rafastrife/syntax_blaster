# ==============================================================================
# Script de Instalação do OpenClaude para Windows
# Repositório: https://github.com/Gitlawb/openclaude
# ==============================================================================

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Instalador Automatizado: OpenClaude (Gitlawb)  " -ForegroundColor White
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verifica se o Node.js (npm) está instalado
Write-Host "=> Verificando dependências: Node.js (npm)..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "[OK] npm encontrado." -ForegroundColor Green
} else {
    Write-Host "[ERRO] npm não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Node.js antes de continuar: https://nodejs.org/" -ForegroundColor Red
    pause
    exit 1
}

# 2. Executa a Instalação do pacote
Write-Host ""
Write-Host "=> Baixando e instalando @gitlawb/openclaude globalmente..." -ForegroundColor Yellow
npm install -g @gitlawb/openclaude

# 3. Verifica se tem o ripgrep (recomendado na documentação oficial)
Write-Host ""
Write-Host "=> Verificando dependências secundárias: ripgrep (rg)..." -ForegroundColor Yellow
if (Get-Command rg -ErrorAction SilentlyContinue) {
    Write-Host "[OK] ripgrep encontrado. Excelente!" -ForegroundColor Green
} else {
    Write-Host "[AVISO] ripgrep não encontrado no sistema." -ForegroundColor DarkYellow
    Write-Host "O OpenClaude recomenda fortemente o uso do ripgrep para busca de arquivos." -ForegroundColor White
    $instalarRg = Read-Host "Deseja instalar o ripgrep agora usando o 'winget'? (S/N)"
    if ($instalarRg -match '^[sS]') {
        Write-Host "Instalando ripgrep..." -ForegroundColor Cyan
        winget install BurntSushi.ripgrep.MSVC
    } else {
        Write-Host "Aviso ignorado. Você pode instalá-lo depois manualmente se o OpenClaude pedir." -ForegroundColor DarkYellow
    }
}

# 4. Finalização e Instruções
Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host "         Instalação Concluída com Sucesso!       " -ForegroundColor White
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar o Assistente no seu terminal, basta rodar:"
Write-Host "  > openclaude" -ForegroundColor Cyan
Write-Host ""
Write-Host "--- CONFIGURAÇÂO DE PROVEDOR ---" -ForegroundColor DarkCyan
Write-Host "Dentro do OpenClaude, digite o comando '/provider' para escolher entre"
Write-Host "OpenAPI, Gemini, Ollama ou GitHub Models interativamente."
Write-Host ""
Write-Host "Ou para um setup rápido via Variáveis de Ambiente PowerShell (com OpenAI):"
Write-Host '  $env:CLAUDE_CODE_USE_OPENAI="1"' -ForegroundColor Gray
Write-Host '  $env:OPENAI_API_KEY="sk-sua-chave-aqui"' -ForegroundColor Gray
Write-Host '  $env:OPENAI_MODEL="gpt-4o"' -ForegroundColor Gray
Write-Host '  openclaude' -ForegroundColor Gray
Write-Host ""
Write-Host "Para fechar este script aperte qualquer tecla..."
pause
