#!/bin/bash

echo "🚀 Executando Seanime com diagnóstico detalhado"
echo "=============================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
LOG_FILE="seanime_debug.log"
PID_FILE="seanime.pid"

echo -e "${BLUE}Configurações:${NC}"
echo "Log file: $LOG_FILE"
echo "PID file: $PID_FILE"
echo ""

# Limpar logs anteriores
rm -f $LOG_FILE $PID_FILE

echo -e "${BLUE}1. Verificando pré-requisitos...${NC}"

# Verificar se estamos no diretório correto
if [ ! -f "main.go" ]; then
    echo -e "${RED}❌ main.go não encontrado. Execute este script no diretório raiz do projeto.${NC}"
    exit 1
fi

# Verificar se config.json existe
if [ ! -f "config.json" ]; then
    echo -e "${YELLOW}⚠️ config.json não encontrado. Criando configuração padrão...${NC}"
    cat > config.json << 'EOF'
{
  "server": {
    "host": "0.0.0.0",
    "port": 43211,
    "domain": "localhost"
  },
  "database": {
    "type": "sqlite",
    "path": "./data/seanime.db"
  },
  "cors": {
    "allowed_origins": [
      "http://localhost:43211",
      "http://127.0.0.1:43211"
    ]
  }
}
EOF
fi

echo -e "${GREEN}✅ Pré-requisitos OK${NC}"
echo ""

echo -e "${BLUE}2. Preparando ambiente...${NC}"

# Criar diretório de dados se não existir
mkdir -p data
mkdir -p logs

# Definir variáveis de ambiente
export CGO_ENABLED=0
export GOOS=linux
export GOARCH=amd64

echo "Variáveis de ambiente:"
echo "CGO_ENABLED=$CGO_ENABLED"
echo "GOOS=$GOOS"
echo "GOARCH=$GOARCH"
echo ""

echo -e "${BLUE}3. Verificando dependências...${NC}"
go mod tidy
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao verificar dependências${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependências OK${NC}"
echo ""

echo -e "${BLUE}4. Compilando aplicação...${NC}"
go build -v -o seanime-server main.go
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro na compilação${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Compilação bem-sucedida${NC}"
echo ""

echo -e "${BLUE}5. Verificando se a porta está disponível...${NC}"
if netstat -tlnp | grep :43211 > /dev/null; then
    echo -e "${YELLOW}⚠️ Porta 43211 já está em uso${NC}"
    echo "Processos usando a porta:"
    netstat -tlnp | grep :43211
    echo ""
    echo "Deseja continuar mesmo assim? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Execução cancelada."
        exit 1
    fi
else
    echo -e "${GREEN}✅ Porta 43211 disponível${NC}"
fi
echo ""

echo -e "${BLUE}6. Iniciando aplicação com logs detalhados...${NC}"
echo "Pressione Ctrl+C para parar a aplicação"
echo ""

# Função para limpar ao sair
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Parando aplicação...${NC}"
    if [ -f "$PID_FILE" ]; then
        PID=$(cat $PID_FILE)
        if ps -p $PID > /dev/null; then
            kill $PID
            echo "Processo $PID terminado"
        fi
        rm -f $PID_FILE
    fi
    echo -e "${GREEN}✅ Aplicação parada${NC}"
    exit 0
}

# Capturar sinais para limpeza
trap cleanup SIGINT SIGTERM

# Executar aplicação com logs detalhados
echo "Iniciando Seanime Server..."
echo "Logs serão salvos em: $LOG_FILE"
echo ""

# Executar em background e capturar PID
./seanime-server > $LOG_FILE 2>&1 &
PID=$!
echo $PID > $PID_FILE

echo -e "${GREEN}✅ Aplicação iniciada (PID: $PID)${NC}"
echo ""

# Monitorar logs em tempo real
echo -e "${BLUE}📋 Logs em tempo real (últimas 20 linhas):${NC}"
echo "================================================"

# Aguardar um pouco para a aplicação inicializar
sleep 3

# Verificar se o processo ainda está a executar
if ps -p $PID > /dev/null; then
    echo -e "${GREEN}✅ Processo está a executar${NC}"
    echo ""
    echo "Últimas linhas do log:"
    tail -20 $LOG_FILE
    echo ""
    echo "Para ver logs em tempo real, execute: tail -f $LOG_FILE"
    echo "Para parar a aplicação, pressione Ctrl+C"
    echo ""
    
    # Aguardar indefinidamente
    while ps -p $PID > /dev/null; do
        sleep 1
    done
    
    echo -e "${YELLOW}⚠️ Processo terminou inesperadamente${NC}"
    echo "Últimas linhas do log:"
    tail -20 $LOG_FILE
else
    echo -e "${RED}❌ Processo não conseguiu iniciar${NC}"
    echo "Logs de erro:"
    cat $LOG_FILE
fi

cleanup
