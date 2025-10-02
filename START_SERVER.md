# 🚀 Como Iniciar o Servidor AniPulse

## 📋 **Pré-requisitos:**
- Go 1.24+ instalado
- Node.js 18+ instalado
- Frontend já compilado (pasta `web/` existe)

---

## 🔧 **Configuração Inicial (Apenas uma vez):**

### **1. Criar arquivo .env:**
```bash
# Copiar template
cp env.template .env

# Editar com teus IPs admin
nano .env
```

Exemplo de `.env`:
```env
ADMIN_ALLOWED_IPS=85.138.119.100,127.0.0.1,SEU_IP_AQUI
NEXT_PUBLIC_GA_ID=G-YJ73RJQJWZ
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:43211
```

### **2. Dar permissão ao script:**
```bash
chmod +x start-server.sh
```

---

## 🚀 **Iniciar o Servidor:**

### **Opção 1: Usando o script (Recomendado):**
```bash
./start-server.sh
```

### **Opção 2: Com nohup (Background):**
```bash
nohup ./start-server.sh > server.log 2>&1 &

# Ver o log em tempo real:
tail -f server.log

# Parar o servidor:
pkill -9 "go run"
```

### **Opção 3: Manual:**
```bash
export ADMIN_ALLOWED_IPS="85.138.119.100,127.0.0.1,207.180.207.30"
export CGO_ENABLED=0
go run main.go
```

---

## 📦 **Build Completo (Frontend + Backend):**

```bash
# 1. Build do frontend
cd seanime-web
npm install
npm run build

# 2. Mover para pasta web
cd ..
rm -rf web
mv seanime-web/out web

# 3. (No VPS) Copiar para Nginx
sudo cp -r web/* /var/www/newnarutoragnarok.site/
sudo chown -R www-data:www-data /var/www/newnarutoragnarok.site

# 4. Iniciar backend
./start-server.sh
```

---

## 🔍 **Verificar se está rodando:**

```bash
# Ver processos Go
ps aux | grep "go run"

# Testar API local
curl http://127.0.0.1:43211/api/v1/status

# Ver porta aberta
sudo netstat -tulpn | grep :43211
```

---

## 🛑 **Parar o Servidor:**

```bash
# Parar Go
pkill -9 "go run"

# OU se tiver PID específico
kill -9 [PID]
```

---

## 🐛 **Troubleshooting:**

### **"403 Forbidden" no /admin:**
- Verifica se teu IP está em `ADMIN_ALLOWED_IPS`
- Descobre teu IP: `curl ifconfig.me`
- Adiciona ao `.env` ou `start-server.sh`

### **"Connection Refused":**
- Verifica se o backend está rodando: `ps aux | grep "go run"`
- Verifica porta: `sudo lsof -i :43211`
- Reinicia o backend

### **Frontend não carrega:**
- Verifica se a pasta `web/` existe
- Se não, builda o frontend: `cd seanime-web && npm run build`

---

## 📝 **Notas:**

- O servidor roda na porta **43211**
- Admin panel: `https://newnarutoragnarok.site/admin`
- Logs do Nginx: `/var/log/nginx/error.log`
- Banco de dados: `data/seanime.db`

