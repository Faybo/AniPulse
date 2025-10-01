# Script PowerShell para upload dos scripts de diagnóstico
Write-Host "📤 Fazendo upload dos scripts de diagnóstico para o VPS" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

# Configurações do VPS
$VPS_IP = "207.180.207.30"
$VPS_USER = "root"
$VPS_DIR = "/var/www/seanime"

Write-Host "1. Verificando scripts locais..." -ForegroundColor Blue

$scripts = @("debug_vps.sh", "run_seanime_debug.sh", "fix_vps_issues.sh")

foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "✅ $script encontrado" -ForegroundColor Green
    } else {
        Write-Host "❌ $script não encontrado" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "2. Conectando ao VPS..." -ForegroundColor Blue
Write-Host "IP: $VPS_IP"
Write-Host "User: $VPS_USER"
Write-Host "Diretório: $VPS_DIR"
Write-Host ""

Write-Host "3. Fazendo upload dos scripts..." -ForegroundColor Blue

foreach ($script in $scripts) {
    Write-Host "Enviando $script..." -ForegroundColor Yellow
    
    # Usar scp para upload
    $scpCommand = "scp $script ${VPS_USER}@${VPS_IP}:${VPS_DIR}/"
    
    try {
        Invoke-Expression $scpCommand
        Write-Host "✅ $script enviado com sucesso" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao enviar $script" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "4. Configurando permissões no VPS..." -ForegroundColor Blue

$sshCommand = "ssh ${VPS_USER}@${VPS_IP} `"cd ${VPS_DIR} && chmod +x *.sh`""
try {
    Invoke-Expression $sshCommand
    Write-Host "✅ Permissões configuradas" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao configurar permissões" -ForegroundColor Red
}

Write-Host ""
Write-Host "5. Instruções para executar no VPS:" -ForegroundColor Blue
Write-Host "==============================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Conecte-se ao VPS e execute os seguintes comandos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Primeiro, execute o diagnóstico:" -ForegroundColor Yellow
Write-Host "   cd $VPS_DIR" -ForegroundColor White
Write-Host "   ./debug_vps.sh" -ForegroundColor White
Write-Host ""
Write-Host "2. Se houver problemas, execute as correções:" -ForegroundColor Yellow
Write-Host "   ./fix_vps_issues.sh" -ForegroundColor White
Write-Host ""
Write-Host "3. Depois, execute a aplicação com logs detalhados:" -ForegroundColor Yellow
Write-Host "   ./run_seanime_debug.sh" -ForegroundColor White
Write-Host ""
Write-Host "4. Para ver logs em tempo real:" -ForegroundColor Yellow
Write-Host "   tail -f seanime_debug.log" -ForegroundColor White
Write-Host ""

Write-Host "✅ Upload concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumo dos scripts enviados:" -ForegroundColor Blue
Write-Host "• debug_vps.sh - Diagnóstico completo do sistema"
Write-Host "• run_seanime_debug.sh - Execução com logs detalhados"
Write-Host "• fix_vps_issues.sh - Correção de problemas comuns"
Write-Host ""
Write-Host "🎉 Scripts prontos para uso no VPS!" -ForegroundColor Green
