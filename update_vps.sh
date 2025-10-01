#!/bin/bash

# Script para atualizar o site no VPS
echo "Atualizando site no VPS..."

# Recarregar nginx
echo "Recarregando nginx..."
systemctl reload nginx

echo "Site atualizado com sucesso!"
echo "Verificar: https://newnarutoragnarok.site"
