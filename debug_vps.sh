#!/bin/bash

echo "🔍 Diagnóstico do VPS - Seanime Project"
echo "========================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Verificando sistema operacional e versão do Go...${NC}"
echo "OS: $(uname -a)"
echo "Go version: $(go version)"
echo ""

echo -e "${BLUE}2. Verificando diretório atual e arquivos...${NC}"
pwd
ls -la
echo ""

echo -e "${BLUE}3. Verificando se o arquivo main.go existe...${NC}"
if [ -f "main.go" ]; then
    echo -e "${GREEN}✅ main.go encontrado${NC}"
    echo "Primeiras linhas do main.go:"
    head -10 main.go
else
    echo -e "${RED}❌ main.go não encontrado${NC}"
fi
echo ""

echo -e "${BLUE}4. Verificando dependências Go...${NC}"
if [ -f "go.mod" ]; then
    echo -e "${GREEN}✅ go.mod encontrado${NC}"
    echo "Conteúdo do go.mod:"
    cat go.mod
else
    echo -e "${RED}❌ go.mod não encontrado${NC}"
fi
echo ""

echo -e "${BLUE}5. Verificando se as dependências estão instaladas...${NC}"
go mod tidy
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependências OK${NC}"
else
    echo -e "${RED}❌ Erro nas dependências${NC}"
fi
echo ""

echo -e "${BLUE}6. Verificando configuração...${NC}"
if [ -f "config.json" ]; then
    echo -e "${GREEN}✅ config.json encontrado${NC}"
    echo "Conteúdo do config.json:"
    cat config.json
else
    echo -e "${RED}❌ config.json não encontrado${NC}"
fi
echo ""

echo -e "${BLUE}7. Verificando portas em uso...${NC}"
netstat -tlnp | grep :43211 || echo "Porta 43211 não está em uso"
echo ""

echo -e "${BLUE}8. Verificando processos Go em execução...${NC}"
ps aux | grep go || echo "Nenhum processo Go encontrado"
echo ""

echo -e "${BLUE}9. Testando compilação...${NC}"
echo "Tentando compilar o projeto..."
go build -v -o seanime-test main.go
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Compilação bem-sucedida${NC}"
    echo "Tamanho do binário: $(du -h seanime-test)"
    rm -f seanime-test
else
    echo -e "${RED}❌ Erro na compilação${NC}"
fi
echo ""

echo -e "${BLUE}10. Verificando permissões...${NC}"
ls -la main.go
echo "Permissões do diretório atual:"
ls -ld .
echo ""

echo -e "${BLUE}11. Verificando espaço em disco...${NC}"
df -h
echo ""

echo -e "${BLUE}12. Verificando memória disponível...${NC}"
free -h
echo ""

echo -e "${BLUE}13. Testando execução com timeout...${NC}"
echo "Executando com timeout de 10 segundos..."
timeout 10s go run main.go &
PID=$!
sleep 2
if ps -p $PID > /dev/null; then
    echo -e "${GREEN}✅ Processo está a executar (PID: $PID)${NC}"
    echo "Verificando logs do processo..."
    kill $PID 2>/dev/null
else
    echo -e "${RED}❌ Processo não iniciou ou terminou imediatamente${NC}"
fi
echo ""

echo -e "${BLUE}14. Verificando variáveis de ambiente...${NC}"
echo "CGO_ENABLED: $CGO_ENABLED"
echo "GOPATH: $GOPATH"
echo "GOROOT: $GOROOT"
echo "PATH: $PATH"
echo ""

echo -e "${BLUE}15. Verificando logs do sistema...${NC}"
echo "Últimas entradas do syslog:"
tail -20 /var/log/syslog 2>/dev/null || echo "Não foi possível aceder ao syslog"
echo ""

echo -e "${YELLOW}📋 Resumo do diagnóstico:${NC}"
echo "Se o processo não está a iniciar, pode ser devido a:"
echo "1. Dependências em falta"
echo "2. Configuração incorreta"
echo "3. Problemas de permissão"
echo "4. Conflitos de porta"
echo "5. Problemas de memória/recursos"
echo ""
echo -e "${GREEN}✅ Diagnóstico concluído!${NC}"
