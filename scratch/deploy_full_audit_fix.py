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

print("1. Connecting to VPS via SSH...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=22, username=username, password=password, timeout=15)

sftp = client.open_sftp()

print("2. Uploading updated server/server.js, server/db.js, and client files...")
sftp.put(r'c:\Users\dell\Downloads\cleaning-services-2026-04-23-10-47-55-utc\themeforest-clanyeco\dozeles-app\server\server.js', '/var/www/dozeles/server/server.js')
sftp.put(r'c:\Users\dell\Downloads\cleaning-services-2026-04-23-10-47-55-utc\themeforest-clanyeco\dozeles-app\server\db.js', '/var/www/dozeles/server/db.js')
sftp.put(r'c:\Users\dell\Downloads\cleaning-services-2026-04-23-10-47-55-utc\themeforest-clanyeco\dozeles-app\client\src\admin\Admin.jsx', '/var/www/dozeles/client/src/admin/Admin.jsx')
sftp.put(r'c:\Users\dell\Downloads\cleaning-services-2026-04-23-10-47-55-utc\themeforest-clanyeco\dozeles-app\client\src\admin\LeadsView.jsx', '/var/www/dozeles/client/src/admin/LeadsView.jsx')
sftp.put(r'c:\Users\dell\Downloads\cleaning-services-2026-04-23-10-47-55-utc\themeforest-clanyeco\dozeles-app\client\src\components\CleanlinessReportCard.jsx', '/var/www/dozeles/client/src/components/CleanlinessReportCard.jsx')

print("3. Updating VPS db.json (permanently removing Leticia Maia)...")
remote_db_file = '/var/www/dozeles/server/data/db.json'
with sftp.file(remote_db_file, 'r') as f:
    vps_db = json.loads(f.read().decode('utf-8'))

# Remove Leticia Maia from users
vps_db['users'] = [
    u for u in vps_db.get('users', []) 
    if not 'leticia' in u.get('email', '').lower() and not 'maia' in u.get('email', '').lower()
]

# Update leads assignedTo
for lead in vps_db.get('leads', []):
    if 'leticia' in str(lead.get('assignedTo', '')).lower() or 'maia' in str(lead.get('assignedTo', '')).lower():
        lead['assignedTo'] = 'Dozeles Operations'

with sftp.file(remote_db_file, 'w') as f:
    f.write(json.dumps(vps_db, indent=2))

# Also update /var/www/dozeles/server/.env if NOTIFY_EMAIL exists
env_content = """PORT=4000
ADMIN_EMAIL=admin@dozeles.com
ADMIN_PASSWORD=change-me-now
JWT_SECRET=dozeles-jwt-secret-secure-key-2026-prod
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=dozelescleaning@gmail.com
SMTP_PASS=bpvl zxyo dpdh xixn
NOTIFY_EMAIL=dozelescleaning@gmail.com
APP_URL=https://dozeles.com
"""
with sftp.file('/var/www/dozeles/server/.env', 'w') as f:
    f.write(env_content)

sftp.close()

print("4. Building client on VPS...")
stdin, stdout, stderr = client.exec_command('cd /var/www/dozeles/client && npm run build')
print(stdout.read().decode('utf-8', 'replace'))

print("5. Restarting PM2 process...")
stdin, stdout, stderr = client.exec_command('pm2 restart dozeles-api && pm2 list')
print(stdout.read().decode('utf-8', 'replace'))

client.close()

print("6. Verifying API & Report Endpoints...")
r_login = requests.post("https://dozeles.com/api/auth/login", json={"email": "dozelescleaning@gmail.com", "password": "change-me-now"}, timeout=10)
print(f"Login dozelescleaning@gmail.com: {r_login.status_code} -> {r_login.json().get('user', {}).get('name')}")

r_leticia = requests.post("https://dozeles.com/api/auth/login", json={"email": "leticiamaia@hotmail.com", "password": "change-me-now"}, timeout=10)
print(f"Login leticiamaia@hotmail.com (Should Fail): {r_leticia.status_code} -> {r_leticia.text}")

token = r_login.json().get('token')
r_audits = requests.get("https://dozeles.com/api/admin/audits", headers={"Authorization": f"Bearer {token}"}, timeout=10)
audits = r_audits.json()
print(f"Total Audits on VPS: {len(audits)}")

if audits:
    first_id = audits[0].get('id')
    # Test public unauthenticated access to the report
    r_pub = requests.get(f"https://dozeles.com/api/reports/{first_id}", timeout=10)
    print(f"Public report API access (https://dozeles.com/api/reports/{first_id}): {r_pub.status_code} (Success: {r_pub.status_code == 200})")
