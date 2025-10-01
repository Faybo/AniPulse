#!/bin/bash

echo "📤 Fazendo upload dos scripts de diagnóstico para o VPS"
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações do VPS
VPS_IP="207.180.207.30"
VPS_USER="root"
VPS_DIR="/var/www/seanime"

echo -e "${BLUE}1. Verificando scripts locais...${NC}"
if [ ! -f "debug_vps.sh" ]; then
    echo -e "${RED}❌ debug_vps.sh não encontrado${NC}"
    exit 1
fi

if [ ! -f "run_seanime_debug.sh" ]; then
    echo -e "${RED}❌ run_seanime_debug.sh não encontrado${NC}"
    exit 1
fi

if [ ! -f "fix_vps_issues.sh" ]; then
    echo -e "${RED}❌ fix_vps_issues.sh não encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Scripts locais encontrados${NC}"
echo ""

echo -e "${BLUE}2. Conectando ao VPS...${NC}"
echo "IP: $VPS_IP"
echo "User: $VPS_USER"
echo "Diretório: $VPS_DIR"
echo ""

echo -e "${BLUE}3. Fazendo upload dos scripts...${NC}"

# Upload dos scripts de diagnóstico
scp debug_vps.sh ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ debug_vps.sh enviado${NC}"
else
    echo -e "${RED}❌ Erro ao enviar debug_vps.sh${NC}"
fi

scp run_seanime_debug.sh ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ run_seanime_debug.sh enviado${NC}"
else
    echo -e "${RED}❌ Erro ao enviar run_seanime_debug.sh${NC}"
fi

scp fix_vps_issues.sh ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ fix_vps_issues.sh enviado${NC}"
else
    echo -e "${RED}❌ Erro ao enviar fix_vps_issues.sh${NC}"
fi

echo ""

echo -e "${BLUE}4. Configurando permissões no VPS...${NC}"
ssh ${VPS_USER}@${VPS_IP} "cd ${VPS_DIR} && chmod +x *.sh"

echo ""

echo -e "${BLUE}5. Instruções para executar no VPS:${NC}"
echo "=============================================="
echo ""
echo "Conecte-se ao VPS e execute os seguintes comandos:"
echo ""
echo -e "${YELLOW}1. Primeiro, execute o diagnóstico:${NC}"
echo "   cd $VPS_DIR"
echo "   ./debug_vps.sh"
echo ""
echo -e "${YELLOW}2. Se houver problemas, execute as correções:${NC}"
echo "   ./fix_vps_issues.sh"
echo ""
echo -e "${YELLOW}3. Depois, execute a aplicação com logs detalhados:${NC}"
echo "   ./run_seanime_debug.sh"
echo ""
echo -e "${YELLOW}4. Para ver logs em tempo real:${NC}"
echo "   tail -f seanime_debug.log"
echo ""

echo -e "${GREEN}✅ Upload concluído!${NC}"
echo ""
echo -e "${BLUE}📋 Resumo dos scripts enviados:${NC}"
echo "• debug_vps.sh - Diagnóstico completo do sistema"
echo "• run_seanime_debug.sh - Execução com logs detalhados"
echo "• fix_vps_issues.sh - Correção de problemas comuns"
echo ""
echo -e "${GREEN}🎉 Scripts prontos para uso no VPS!${NC}"
