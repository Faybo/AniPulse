# Script PowerShell para deploy completo
Write-Host "🚀 Deploy Completo - newnarutoragnarok.site" -ForegroundColor Blue
Write-Host "===========================================" -ForegroundColor Blue

# Configurações do VPS
$VPS_IP = "207.180.207.30"
$VPS_USER = "root"
$VPS_DIR = "/root/seanime-project"
$DOMAIN = "newnarutoragnarok.site"

Write-Host "1. Compilando versão corrigida..." -ForegroundColor Blue

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

# Upload do binário
Write-Host "Enviando binário..." -ForegroundColor Yellow
scp seanime-server-linux ${VPS_USER}@${VPS_IP}:${VPS_DIR}/seanime-server

# Upload da configuração corrigida
Write-Host "Enviando config.json..." -ForegroundColor Yellow
scp config.json ${VPS_USER}@${VPS_IP}:${VPS_DIR}/

# Upload do script de configuração do Nginx
Write-Host "Enviando script do Nginx..." -ForegroundColor Yellow
scp setup_nginx_proxy.sh ${VPS_USER}@${VPS_IP}:${VPS_DIR}/

Write-Host "✅ Upload concluído" -ForegroundColor Green
Write-Host ""

Write-Host "3. Configurando no VPS..." -ForegroundColor Blue

# Script para executar no VPS
$vpsScript = @"
cd ${VPS_DIR}

# Parar aplicação anterior
pkill -f seanime-server

# Configurar permissões
chmod +x seanime-server

# Executar aplicação em background
nohup CGO_ENABLED=0 ./seanime-server > seanime.log 2>&1 &

# Aguardar um pouco
sleep 3

# Verificar se está a executar
if pgrep -f seanime-server > /dev/null; then
    echo "✅ Seanime está a executar"
else
    echo "❌ Erro ao iniciar Seanime"
    cat seanime.log
fi

# Configurar Nginx
chmod +x setup_nginx_proxy.sh
./setup_nginx_proxy.sh

echo "✅ Configuração concluída!"
"@

# Executar script no VPS
$vpsScript | ssh ${VPS_USER}@${VPS_IP}

Write-Host ""
Write-Host "4. Verificando status..." -ForegroundColor Blue

# Verificar status
$statusScript = @"
cd ${VPS_DIR}
echo "=== Status da Aplicação ==="
pgrep -f seanime-server && echo "✅ Seanime está a executar" || echo "❌ Seanime não está a executar"

echo ""
echo "=== Status do Nginx ==="
systemctl status nginx --no-pager

echo ""
echo "=== Teste de Conectividade ==="
curl -s http://localhost:43211 | head -5 || echo "❌ Aplicação não responde"
"@

$statusScript | ssh ${VPS_USER}@${VPS_IP}

Write-Host ""
Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumo:" -ForegroundColor Blue
Write-Host "• Aplicação: http://localhost:43211" -ForegroundColor White
Write-Host "• Domínio: https://${DOMAIN}" -ForegroundColor White
Write-Host "• Proxy: Nginx configurado" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Configure o DNS do domínio ${DOMAIN} para o IP: ${VPS_IP}" -ForegroundColor Yellow
Write-Host "⏰ Aguarde a propagação do DNS (até 24 horas)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para ver logs em tempo real:" -ForegroundColor Blue
Write-Host "ssh ${VPS_USER}@${VPS_IP} 'cd ${VPS_DIR} && tail -f seanime.log'" -ForegroundColor White
