# Script para fazer deploy para o VPS
# Senha: N8@xL2q!rV7p$gZ4

Write-Host "Fazendo deploy para o VPS..."
Write-Host "Senha: N8@xL2q!rV7p$gZ4"

# Fazer upload dos ficheiros
Write-Host "Enviando ficheiros..."
scp -r out/* root@207.180.207.30:/var/www/newnarutoragnarok.site/

Write-Host "Deploy concluído!"
Write-Host "Agora execute no VPS: systemctl reload nginx"
