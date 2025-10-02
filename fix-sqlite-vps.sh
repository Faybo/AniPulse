#!/bin/bash
# Script para corrigir conflitos SQLite no VPS Ubuntu

echo "🔧 Limpando cache Go..."
go clean -cache -modcache -i -r
rm -rf ~/.cache/go-build

echo "📝 Corrigindo go.mod..."
# Remove drivers SQLite conflitantes
go mod edit -droprequire github.com/glebarez/sqlite
go mod edit -droprequire github.com/go-llsqlite/crawshaw
go mod edit -droprequire github.com/go-llsqlite/adapter

# Força o uso do mattn/go-sqlite3
go mod edit -replace github.com/glebarez/sqlite=github.com/mattn/go-sqlite3@v1.14.22
go mod edit -replace github.com/glebarez/go-sqlite=github.com/mattn/go-sqlite3@v1.14.22

echo "📦 Baixando dependências..."
go mod download
go mod tidy

echo "✅ Pronto! Agora pode compilar com:"
echo "   CGO_ENABLED=1 go build -o anipulse-server"

