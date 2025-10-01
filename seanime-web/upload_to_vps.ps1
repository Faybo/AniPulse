# Script para fazer upload dos ficheiros para o VPS
Write-Host "Fazendo upload dos ficheiros para o VPS..."

# Copiar todos os ficheiros da pasta out para o VPS
scp -r out/* root@207.180.207.30:/var/www/newnarutoragnarok.site/

Write-Host "Upload concluído!"
Write-Host "Agora execute no VPS: systemctl reload nginx"
