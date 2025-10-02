#!/bin/bash

# AniPulse - Script de inicialização do servidor
# Este script configura as variáveis de ambiente e inicia o backend

# Configurações
export ADMIN_ALLOWED_IPS="85.138.119.100,127.0.0.1,207.180.207.30"
export CGO_ENABLED=0

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}   AniPulse Server Startup${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${GREEN}✓ Admin IPs:${NC} $ADMIN_ALLOWED_IPS"
echo -e "${GREEN}✓ CGO Disabled${NC}"
echo ""
echo -e "${BLUE}Starting server...${NC}"
echo ""

# Iniciar o servidor
go run main.go

