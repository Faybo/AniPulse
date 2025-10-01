# Script PowerShell para upload da versão corrigida
Write-Host "🚀 Fazendo upload da versão corrigida para o VPS" -ForegroundColor Blue
Write-Host "=============================================" -ForegroundColor Blue

# Configurações do VPS
$VPS_IP = "207.180.207.30"
$VPS_USER = "root"
$VPS_DIR = "/var/www/seanime"

Write-Host "1. Compilando versão para Linux..." -ForegroundColor Blue

# Compilar para Linux
$env:CGO_ENABLED = "0"
$env:GOOS = "linux"
$env:GOARCH = "amd64"

go build -o seanime-server-linux main.go

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro na compilação" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Compilação bem-sucedida" -ForegroundColor Green
Write-Host ""

Write-Host "2. Fazendo upload dos arquivos..." -ForegroundColor Blue

# Upload do binário corrigido
Write-Host "Enviando seanime-server-linux..." -ForegroundColor Yellow
scp seanime-server-linux ${VPS_USER}@${VPS_IP}:${VPS_DIR}/seanime-server

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Binário enviado com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao enviar binário" -ForegroundColor Red
}

# Upload da configuração atualizada
Write-Host "Enviando config.json..." -ForegroundColor Yellow
scp config.json ${VPS_USER}@${VPS_IP}:${VPS_DIR}/

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Configuração enviada com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao enviar configuração" -ForegroundColor Red
}

Write-Host ""

Write-Host "3. Configurando permissões no VPS..." -ForegroundColor Blue

$sshCommand = "ssh ${VPS_USER}@${VPS_IP} `"cd ${VPS_DIR} && chmod +x seanime-server`""
try {
    Invoke-Expression $sshCommand
    Write-Host "✅ Permissões configuradas" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao configurar permissões" -ForegroundColor Red
}

Write-Host ""

Write-Host "4. Parando e reiniciando o serviço..." -ForegroundColor Blue

$restartCommand = "ssh ${VPS_USER}@${VPS_IP} `"systemctl stop seanime && systemctl start seanime && systemctl status seanime`""
try {
    Invoke-Expression $restartCommand
    Write-Host "✅ Serviço reiniciado" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao reiniciar serviço" -ForegroundColor Red
}

Write-Host ""

Write-Host "5. Verificando status..." -ForegroundColor Blue

$statusCommand = "ssh ${VPS_USER}@${VPS_IP} `"systemctl status seanime --no-pager`""
try {
    Invoke-Expression $statusCommand
} catch {
    Write-Host "❌ Erro ao verificar status" -ForegroundColor Red
}

Write-Host ""

Write-Host "6. Testando conectividade..." -ForegroundColor Blue

$testCommand = "ssh ${VPS_USER}@${VPS_IP} `"curl -s http://localhost:43211/api/health || echo 'API não está a responder'`""
try {
    Invoke-Expression $testCommand
} catch {
    Write-Host "❌ Erro ao testar API" -ForegroundColor Red
}

Write-Host ""

Write-Host "✅ Upload da versão corrigida concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumo das correções aplicadas:" -ForegroundColor Blue
Write-Host "• Corrigidos erros de declarações duplicadas"
Write-Host "• Atualizado domínio para anipulse.tk"
Write-Host "• Compilado com CGO_ENABLED=0"
Write-Host "• Configurações de CORS atualizadas"
Write-Host ""
Write-Host "🌐 O site deve estar disponível em: https://anipulse.tk" -ForegroundColor Green
Write-Host ""
Write-Host "Para ver logs em tempo real no VPS:" -ForegroundColor Yellow
Write-Host "ssh ${VPS_USER}@${VPS_IP} 'journalctl -u seanime -f'" -ForegroundColor White
