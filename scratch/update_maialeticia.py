import paramiko
import json
import requests
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

hostname = "2.25.90.226"
username = "root"
password = "1302@Sanjose"

print("1. Connecting to VPS...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=22, username=username, password=password, timeout=15)

sftp = client.open_sftp()

print("2. Uploading updated server files...")
sftp.put(r'c:\Users\dell\Downloads\cleaning-services-2026-04-23-10-47-55-utc\themeforest-clanyeco\dozeles-app\server\server.js', '/var/www/dozeles/server/server.js')
sftp.put(r'c:\Users\dell\Downloads\cleaning-services-2026-04-23-10-47-55-utc\themeforest-clanyeco\dozeles-app\server\db.js', '/var/www/dozeles/server/db.js')

print("3. Updating VPS db.json (ensuring Maialeticia@hotmail.com is active, removing leticiamaia@hotmail.com)...")
remote_db_file = '/var/www/dozeles/server/data/db.json'
with sftp.file(remote_db_file, 'r') as f:
    vps_db = json.loads(f.read().decode('utf-8'))

# Remove only leticiamaia@hotmail.com
vps_db['users'] = [
    u for u in vps_db.get('users', []) 
    if u.get('email', '').lower() != 'leticiamaia@hotmail.com'
]

# Ensure Maialeticia@hotmail.com exists
if not any(u.get('email', '').lower() == 'maialeticia@hotmail.com' for u in vps_db['users']):
    vps_db['users'].append({
        "id": "usr_maialeticia",
        "email": "maialeticia@hotmail.com",
        "name": "Leticia Maia",
        "role": "admin",
        "password": "change-me-now",
        "createdAt": "2026-09-05T00:00:00.000Z"
    })
else:
    for u in vps_db['users']:
        if u.get('email', '').lower() == 'maialeticia@hotmail.com':
            u['password'] = 'change-me-now'
            u['role'] = 'admin'
            u['name'] = 'Leticia Maia'

with sftp.file(remote_db_file, 'w') as f:
    f.write(json.dumps(vps_db, indent=2))

# Update .env
env_content = """PORT=4000
ADMIN_EMAIL=admin@dozeles.com
ADMIN_PASSWORD=change-me-now
JWT_SECRET=dozeles-jwt-secret-secure-key-2026-prod
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=dozelescleaning@gmail.com
SMTP_PASS=bpvl zxyo dpdh xixn
NOTIFY_EMAIL=Maialeticia@hotmail.com
APP_URL=https://dozeles.com
"""
with sftp.file('/var/www/dozeles/server/.env', 'w') as f:
    f.write(env_content)

sftp.close()

print("4. Restarting PM2 process...")
stdin, stdout, stderr = client.exec_command('pm2 restart dozeles-api && pm2 list')
print(stdout.read().decode('utf-8', 'replace'))

client.close()

print("5. Verifying Logins...")
r_correct = requests.post("https://dozeles.com/api/auth/login", json={"email": "Maialeticia@hotmail.com", "password": "change-me-now"}, timeout=10)
print(f"Login Maialeticia@hotmail.com: {r_correct.status_code} -> {r_correct.json().get('user', {}).get('name')}")

r_wrong = requests.post("https://dozeles.com/api/auth/login", json={"email": "leticiamaia@hotmail.com", "password": "change-me-now"}, timeout=10)
print(f"Login leticiamaia@hotmail.com (Should Fail): {r_wrong.status_code} -> {r_wrong.text}")
