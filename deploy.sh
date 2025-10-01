#!/bin/bash

# Deploy script for New Naruto Ragnarok
# VPS: 207.180.207.30
# Domain: newnarutoragnarok.site

echo "🚀 Starting deployment to VPS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# VPS Configuration
VPS_IP="207.180.207.30"
VPS_USER="root"
DOMAIN="anipulse.tk"
APP_DIR="/var/www/seanime"
NGINX_DIR="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

echo -e "${YELLOW}📦 Building frontend...${NC}"
cd seanime-web
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Copying files to web directory...${NC}"
cp -r out/* ../web/
cd ..

echo -e "${YELLOW}🔧 Building Go backend...${NC}"
go build -o seanime-server main.go
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Go build failed!${NC}"
    exit 1
fi

echo -e "${YELLOW}📤 Uploading files to VPS...${NC}"
# Create app directory on VPS
ssh ${VPS_USER}@${VPS_IP} "mkdir -p ${APP_DIR}"

# Upload application files
scp seanime-server ${VPS_USER}@${VPS_IP}:${APP_DIR}/
scp -r web/ ${VPS_USER}@${VPS_IP}:${APP_DIR}/
scp config.json ${VPS_USER}@${VPS_IP}:${APP_DIR}/

echo -e "${YELLOW}⚙️ Configuring Nginx...${NC}"
# Create Nginx configuration
cat > nginx.conf << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # SSL Configuration (will be set up with Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    # Security headers (SEO friendly)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Hide server information (owner privacy)
    server_tokens off;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    # Serve static files
    location / {
        root ${APP_DIR}/web;
        try_files \$uri \$uri/ /index.html;
        
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
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # WebSocket support
    location /events {
        proxy_pass http://127.0.0.1:43211;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Upload Nginx configuration
scp nginx.conf ${VPS_USER}@${VPS_IP}:${NGINX_DIR}/${DOMAIN}

echo -e "${YELLOW}🔧 Setting up services on VPS...${NC}"
# Setup script for VPS
cat > setup_vps.sh << 'EOF'
#!/bin/bash

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y nginx certbot python3-certbot-nginx ufw fail2ban

# Configure firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# Create systemd service for Seanime
cat > /etc/systemd/system/seanime.service << 'EOL'
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
EOL

# Enable and start services
systemctl daemon-reload
systemctl enable seanime
systemctl start seanime

# Configure Nginx
ln -sf /etc/nginx/sites-available/newnarutoragnarok.site /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Setup SSL with Let's Encrypt
certbot --nginx -d newnarutoragnarok.site -d www.newnarutoragnarok.site --non-interactive --agree-tos --email admin@newnarutoragnarok.site

# Setup auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

echo "✅ VPS setup completed!"
echo "🌐 Your site will be available at: https://newnarutoragnarok.site"
EOF

# Upload and run setup script
scp setup_vps.sh ${VPS_USER}@${VPS_IP}:/tmp/
ssh ${VPS_USER}@${VPS_IP} "chmod +x /tmp/setup_vps.sh && /tmp/setup_vps.sh"

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your site is now available at: https://newnarutoragnarok.site${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Configure DNS in Hostinger (see instructions below)"
echo "2. Wait for DNS propagation (up to 24 hours)"
echo "3. Test your site"
echo "4. Setup monitoring and backups"

# Cleanup
rm -f nginx.conf setup_vps.sh

echo -e "${GREEN}🎉 Deployment script completed!${NC}"
