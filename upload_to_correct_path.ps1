# Script PowerShell para upload para o caminho correto
Write-Host "🚀 Fazendo upload para /root/seanime-project/" -ForegroundColor Blue
Write-Host "=============================================" -ForegroundColor Blue

# Configurações do VPS
$VPS_IP = "207.180.207.30"
$VPS_USER = "root"
$VPS_DIR = "/root/seanime-project"

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

Write-Host "2. Fazendo upload dos ficheiros..." -ForegroundColor Blue

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

# Upload do ficheiro corrigido
Write-Host "Enviando contact.go corrigido..." -ForegroundColor Yellow
scp internal/handlers/contact.go ${VPS_USER}@${VPS_IP}:${VPS_DIR}/internal/handlers/

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Código corrigido enviado com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao enviar código" -ForegroundColor Red
}

Write-Host ""

Write-Host "3. Instruções para executar no VPS:" -ForegroundColor Blue
Write-Host "=============================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Conecte-se ao VPS e execute:" -ForegroundColor Yellow
Write-Host "cd /root/seanime-project" -ForegroundColor White
Write-Host "chmod +x seanime-server" -ForegroundColor White
Write-Host "pkill -f seanime-server  # Parar versão anterior" -ForegroundColor White
Write-Host "CGO_ENABLED=0 ./seanime-server" -ForegroundColor White
Write-Host ""

Write-Host "✅ Upload concluído para o caminho correto!" -ForegroundColor Green
Write-Host "📁 Diretório: /root/seanime-project/" -ForegroundColor Blue
Write-Host "🌐 Site: https://anipulse.tk" -ForegroundColor Green
