# 🚀 Deploy Rápido - New Naruto Ragnarok

## 📋 **Resumo do que foi feito:**

### ✅ **SEO Otimizado:**
- Meta tags completas com keywords "anime online", "anime free"
- Open Graph e Twitter Cards
- Sitemap.xml e robots.txt
- Schema markup para melhor indexação

### ✅ **Sistema de Contacto:**
- Formulário encriptado em `/contact`
- Página admin com gestão de mensagens
- Tracking de IP automático
- Interface moderna e responsiva

### ✅ **Disclaimer Legal:**
- Footer com disclaimer sobre não armazenar arquivos
- Conformidade com termos de uso

## 🚀 **Deploy no VPS (207.180.207.30):**

### **1. Conectar ao VPS:**
```bash
ssh root@207.180.207.30
```

### **2. Instalar dependências:**
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Go, Nginx, Certbot
apt install -y golang nginx certbot python3-certbot-nginx ufw fail2ban

# Instalar Node.js (para builds futuros)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

### **3. Configurar firewall:**
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
```

### **4. Criar diretório da aplicação:**
```bash
mkdir -p /var/www/seanime
cd /var/www/seanime
```

### **5. Upload dos arquivos:**
```bash
# No seu computador local, execute:
scp -r web/ root@207.180.207.30:/var/www/seanime/
scp seanime-server root@207.180.207.30:/var/www/seanime/
scp config.json root@207.180.207.30:/var/www/seanime/
```

### **6. Configurar Nginx:**
```bash
# Criar configuração do Nginx
cat > /etc/nginx/sites-available/newnarutoragnarok.site << 'EOF'
server {
    listen 80;
    server_name newnarutoragnarok.site www.newnarutoragnarok.site;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name newnarutoragnarok.site www.newnarutoragnarok.site;
    
    # SSL Configuration (will be set up with Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/newnarutoragnarok.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/newnarutoragnarok.site/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    # Serve static files
    location / {
        root /var/www/seanime/web;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:43211;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket support
    location /events {
        proxy_pass http://127.0.0.1:43211;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/newnarutoragnarok.site /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t
```

### **7. Configurar serviço do Go:**
```bash
# Criar serviço systemd
cat > /etc/systemd/system/seanime.service << 'EOF'
[Unit]
Description=Seanime Anime Streaming Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/seanime
ExecStart=/var/www/seanime/seanime-server
Restart=always
RestartSec=5
Environment=PORT=43211

[Install]
WantedBy=multi-user.target
EOF

# Dar permissões
chown -R www-data:www-data /var/www/seanime
chmod +x /var/www/seanime/seanime-server

# Iniciar serviços
systemctl daemon-reload
systemctl enable seanime
systemctl start seanime
systemctl reload nginx
```

### **8. Configurar SSL:**
```bash
# Obter certificado SSL
certbot --nginx -d newnarutoragnarok.site -d www.newnarutoragnarok.site --non-interactive --agree-tos --email admin@newnarutoragnarok.site

# Configurar renovação automática
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

## 🌐 **Configuração DNS no Hostinger:**

### **1. Acessar painel:**
- Vá para [hpanel.hostinger.com](https://hpanel.hostinger.com)
- Selecione `newnarutoragnarok.site`

### **2. Configurar DNS:**
```
Tipo: A
Nome: @
Valor: 207.180.207.30
TTL: 14400

Tipo: A
Nome: www
Valor: 207.180.207.30
TTL: 14400
```

### **3. Aguardar propagação:**
- **Tempo:** 2-24 horas
- **Teste:** `nslookup newnarutoragnarok.site`

## ✅ **Verificação Final:**

### **1. Testar URLs:**
- ✅ https://newnarutoragnarok.site
- ✅ https://newnarutoragnarok.site/discover
- ✅ https://newnarutoragnarok.site/contact
- ✅ https://newnarutoragnarok.site/admin

### **2. Testar SEO:**
- [Google PageSpeed](https://pagespeed.web.dev)
- [GTmetrix](https://gtmetrix.com)
- [SSL Labs](https://www.ssllabs.com/ssltest/)

### **3. Monitorar:**
```bash
# Ver logs do serviço
journalctl -u seanime -f

# Ver status
systemctl status seanime
systemctl status nginx

# Verificar portas
netstat -tlnp | grep :80
netstat -tlnp | grep :443
netstat -tlnp | grep :43211
```

## 🎯 **Keywords SEO Otimizadas:**

- "anime online"
- "watch anime free"
- "anime streaming"
- "naruto online"
- "one piece anime"
- "dragon ball"
- "anime episodes"
- "anime subtitles"
- "free anime"
- "anime HD"

## 📊 **Próximos Passos (ANONIMATO TOTAL):**

1. **❌ NÃO configurar Google Search Console** (rastros)
2. **❌ NÃO adicionar Google Analytics** (rastros)
3. **✅ Configurar anúncios anônimos** (PropellerAds com VPN)
4. **✅ Monitorar via logs locais** (sem serviços externos)
5. **✅ Usar apenas métricas internas** (sem tracking)

## 🆘 **Troubleshooting:**

### **Site não carrega:**
```bash
# Verificar DNS
nslookup newnarutoragnarok.site

# Verificar serviço
systemctl status seanime

# Ver logs
journalctl -u seanime -f
```

### **SSL não funciona:**
```bash
# Renovar certificado
certbot renew --force-renewal

# Verificar certificado
openssl s_client -connect newnarutoragnarok.site:443
```

### **Performance lenta:**
```bash
# Verificar recursos
htop
df -h
free -h

# Otimizar Nginx
nginx -t
systemctl reload nginx
```

## 🎉 **Resultado Final:**

Após seguir todos os passos, você terá:

- ✅ **Site funcionando:** https://newnarutoragnarok.site
- ✅ **SSL/HTTPS:** Certificado válido
- ✅ **SEO otimizado:** Para "anime online", "anime free"
- ✅ **Performance:** CDN + Caching + Gzip
- ✅ **Segurança:** Firewall + Headers de segurança
- ✅ **Monitoramento:** Logs + Status dos serviços
- ✅ **Sistema de contacto:** Funcional e encriptado
- ✅ **Disclaimer legal:** Conforme termos de uso

**Tempo total de deploy:** ~30 minutos
**Tempo de propagação DNS:** 2-24 horas
**Tempo de indexação Google:** 1-7 dias
