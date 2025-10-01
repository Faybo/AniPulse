#!/usr/bin/env python3
import json, sqlite3, subprocess, urllib.request, time

DB = "/root/seanime-project/data-dev/seanime.db"
conn = sqlite3.connect(DB, check_same_thread=False)
cur = conn.cursor()
cur.execute("""CREATE TABLE IF NOT EXISTS visitor_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_address TEXT, user_agent TEXT, page_visited TEXT,
  visit_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  session_duration INTEGER DEFAULT 0,
  country TEXT, city TEXT, referrer TEXT
);""")
cur.execute("""CREATE TABLE IF NOT EXISTS ip_geo (
  ip TEXT PRIMARY KEY, country TEXT, city TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);""")
conn.commit()

def geo_lookup(ip):
  if not ip or ip.startswith('127.'): return ('','')
  row = cur.execute("SELECT country,city FROM ip_geo WHERE ip=?", (ip,)).fetchone()
  if row: return row
  try:
    with urllib.request.urlopen(f"https://ipwho.is/{ip}?fields=ip,success,country,city") as r:
      j = json.loads(r.read().decode("utf-8"))
      if j.get("success"):
        country = j.get("country") or ""
        city = j.get("city") or ""
        cur.execute("INSERT OR REPLACE INTO ip_geo(ip,country,city) VALUES(?,?,?)", (ip,country,city))
        conn.commit()
        time.sleep(0.15)  # ser educado com a API gratuita
        return (country, city)
  except Exception:
    pass
  return ('','')

p = subprocess.Popen(["tail","-F","/var/log/nginx/anipulse.access.json"], stdout=subprocess.PIPE, text=True)
for line in p.stdout:
  try:
    j = json.loads(line.strip())
    if (j.get("method") or "").upper() != "GET": continue
    uri = (j.get("uri") or "/")
    if uri.startswith(("/api/","/_next/","/static/","/events")) or uri in ("/favicon.ico","/robots.txt","/sitemap.xml"): continue
    page = uri.split("?")[0]
    ip = j.get("ip","")
    ua = j.get("ua","")
    ref = j.get("referer","")
    country, city = geo_lookup(ip)
    cur.execute("INSERT INTO visitor_logs (ip_address,user_agent,page_visited,referrer,country,city) VALUES (?,?,?,?,?,?)",
                (ip, ua, page, ref, country, city))
    conn.commit()
  except Exception:
    pass
