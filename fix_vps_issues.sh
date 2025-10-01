#!/bin/bash

echo "🔧 Corrigindo problemas comuns no VPS"
echo "===================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Atualizando sistema...${NC}"
apt update && apt upgrade -y

echo -e "${BLUE}2. Instalando dependências necessárias...${NC}"
apt install -y curl wget git build-essential

echo -e "${BLUE}3. Verificando e instalando Go...${NC}"
if ! command -v go &> /dev/null; then
    echo "Go não encontrado. Instalando..."
    wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
    tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
    echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
    source ~/.bashrc
    rm go1.21.5.linux-amd64.tar.gz
else
    echo -e "${GREEN}✅ Go já instalado: $(go version)${NC}"
fi

echo -e "${BLUE}4. Configurando variáveis de ambiente...${NC}"
export PATH=$PATH:/usr/local/go/bin
export GOPATH=$HOME/go
export GOBIN=$GOPATH/bin
export PATH=$PATH:$GOBIN

echo -e "${BLUE}5. Verificando permissões...${NC}"
chmod +x *.sh
chmod +x seanime-server 2>/dev/null || echo "seanime-server não encontrado ainda"

echo -e "${BLUE}6. Criando diretórios necessários...${NC}"
mkdir -p data
mkdir -p logs
mkdir -p web

echo -e "${BLUE}7. Configurando firewall...${NC}"
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 43211
ufw --force enable

echo -e "${BLUE}8. Verificando espaço em disco...${NC}"
df -h

echo -e "${BLUE}9. Verificando memória...${NC}"
free -h

echo -e "${BLUE}10. Limpando cache e temporários...${NC}"
apt autoremove -y
apt autoclean

echo -e "${BLUE}11. Configurando limites do sistema...${NC}"
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

echo -e "${BLUE}12. Verificando configuração de rede...${NC}"
ip addr show
echo ""
echo "Portas em uso:"
netstat -tlnp

echo -e "${GREEN}✅ Correções aplicadas!${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo "1. Execute: source ~/.bashrc"
echo "2. Execute: go version"
echo "3. Execute: ./run_seanime_debug.sh"
echo ""
echo -e "${GREEN}🎉 Script de correção concluído!${NC}"
