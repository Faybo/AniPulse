#!/bin/bash

# Script para atualizar o site no VPS
echo "Atualizando site..."

# Ir para a pasta do site
cd /var/www/newnarutoragnarok.site/

# Fazer backup dos ficheiros atuais
echo "Fazendo backup..."
cp -r . ../backup_$(date +%Y%m%d_%H%M%S)/

# Recarregar nginx
echo "Recarregando nginx..."
systemctl reload nginx

echo "Site atualizado com sucesso!"
echo "Verificar se o site está funcionando: https://newnarutoragnarok.site"
