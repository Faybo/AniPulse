# 🌐 Configuração do Hostinger para newnarutoragnarok.site

## 📋 **Passo a Passo Completo**

### **1. Acessar o Painel do Hostinger**
1. Vá para [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Faça login na sua conta
3. Selecione o domínio `newnarutoragnarok.site`

### **2. Configurar DNS (Zona DNS)**

#### **Opção A: Usar Cloudflare (Recomendado)**
1. **Acesse:** [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Adicione o domínio:** `newnarutoragnarok.site`
3. **Configure os registros DNS:**

```
Tipo: A
Nome: @
Conteúdo: 207.180.207.30
Proxy: ✅ (nuvem laranja ativada)
TTL: Auto

Tipo: A
Nome: www
Conteúdo: 207.180.207.30
Proxy: ✅ (nuvem laranja ativada)
TTL: Auto

Tipo: CNAME
Nome: api
Conteúdo: newnarutoragnarok.site
Proxy: ✅ (nuvem laranja ativada)
TTL: Auto
```

#### **Opção B: Usar DNS do Hostinger**
1. **Vá para:** "Zona DNS" no painel do Hostinger
2. **Adicione os registros:**

```
Tipo: A
Nome: @
Valor: 207.180.207.30
TTL: 14400

Tipo: A
Nome: www
Valor: 207.180.207.30
TTL: 14400

Tipo: CNAME
Nome: api
Valor: newnarutoragnarok.site
TTL: 14400
```

### **3. Configurar SSL (Certificado)**

#### **Se usar Cloudflare:**
1. **Vá para:** "SSL/TLS" → "Overview"
2. **Selecione:** "Full (strict)"
3. **Ative:** "Always Use HTTPS"

#### **Se usar Hostinger:**
1. **Vá para:** "SSL" no painel
2. **Ative:** "Force HTTPS"
3. **Configure:** Redirecionamento automático

### **4. Configurar Subdomínios (Opcional)**

```
api.newnarutoragnarok.site → 207.180.207.30
admin.newnarutoragnarok.site → 207.180.207.30
cdn.newnarutoragnarok.site → 207.180.207.30
```

### **5. Configurar Email (Opcional)**

```
Tipo: MX
Nome: @
Valor: mx1.hostinger.com
Prioridade: 10

Tipo: MX
Nome: @
Valor: mx2.hostinger.com
Prioridade: 20
```

### **6. Configurar Caching (Cloudflare)**

1. **Vá para:** "Caching" → "Configuration"
2. **Selecione:** "Standard"
3. **Ative:** "Browser Cache TTL" (4 horas)
4. **Configure:** "Purge Cache" quando necessário

### **7. Configurar Firewall (Cloudflare)**

1. **Vá para:** "Security" → "WAF"
2. **Ative:** "Web Application Firewall"
3. **Configure regras:**
   - Bloquear IPs suspeitos
   - Rate limiting para /api/
   - Proteção contra DDoS

### **8. Monitoramento**

#### **Google Search Console:**
1. **Acesse:** [search.google.com/search-console](https://search.google.com/search-console)
2. **Adicione:** `https://newnarutoragnarok.site`
3. **Verifique:** Propriedade via DNS
4. **Envie:** Sitemap (`https://newnarutoragnarok.site/sitemap.xml`)

#### **Google Analytics:**
1. **Acesse:** [analytics.google.com](https://analytics.google.com)
2. **Crie:** Nova propriedade
3. **Configure:** `newnarutoragnarok.site`
4. **Adicione:** Código de tracking

### **9. SEO e Performance**

#### **Meta Tags (já configuradas):**
- ✅ Title otimizado
- ✅ Description com keywords
- ✅ Open Graph tags
- ✅ Twitter Cards
- ✅ Robots.txt
- ✅ Sitemap.xml

#### **Performance:**
- ✅ Gzip compression
- ✅ Browser caching
- ✅ CDN (Cloudflare)
- ✅ SSL/HTTPS
- ✅ Mobile responsive

### **10. Verificação Final**

#### **Teste os seguintes URLs:**
```
✅ https://newnarutoragnarok.site
✅ https://www.newnarutoragnarok.site
✅ https://newnarutoragnarok.site/discover
✅ https://newnarutoragnarok.site/schedule
✅ https://newnarutoragnarok.site/contact
✅ https://newnarutoragnarok.site/admin
```

#### **Ferramentas de Teste:**
- [GTmetrix](https://gtmetrix.com) - Performance
- [Google PageSpeed](https://pagespeed.web.dev) - Speed
- [SSL Labs](https://www.ssllabs.com/ssltest/) - SSL
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly) - Mobile

### **11. Troubleshooting**

#### **Se o site não carregar:**
1. **Verifique DNS:** `nslookup newnarutoragnarok.site`
2. **Verifique SSL:** `curl -I https://newnarutoragnarok.site`
3. **Verifique servidor:** `ssh root@207.180.207.30`

#### **Comandos úteis no VPS:**
```bash
# Verificar status do serviço
systemctl status seanime

# Ver logs
journalctl -u seanime -f

# Reiniciar serviço
systemctl restart seanime

# Verificar Nginx
nginx -t
systemctl status nginx
```

### **12. Backup e Manutenção**

#### **Backup automático:**
```bash
# Criar script de backup
cat > /root/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /root/backup_${DATE}.tar.gz /var/www/seanime
# Manter apenas últimos 7 backups
find /root -name "backup_*.tar.gz" -mtime +7 -delete
EOF

chmod +x /root/backup.sh

# Agendar backup diário
echo "0 2 * * * /root/backup.sh" | crontab -
```

## 🎉 **Resultado Final**

Após seguir todos os passos, você terá:

- ✅ **Site funcionando:** https://newnarutoragnarok.site
- ✅ **SSL/HTTPS:** Certificado válido
- ✅ **SEO otimizado:** Para "anime online", "anime free"
- ✅ **Performance:** CDN + Caching
- ✅ **Segurança:** Firewall + WAF
- ✅ **Monitoramento:** Analytics + Search Console
- ✅ **Backup:** Automático diário

## 📞 **Suporte**

Se tiver problemas:
1. **Verifique os logs:** `journalctl -u seanime -f`
2. **Teste DNS:** `nslookup newnarutoragnarok.site`
3. **Verifique SSL:** [SSL Labs](https://www.ssllabs.com/ssltest/)
4. **Teste performance:** [GTmetrix](https://gtmetrix.com)

**Tempo estimado para propagação DNS:** 2-24 horas
**Tempo estimado para indexação Google:** 1-7 dias
