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

print("2. Uploading updated server/server.js and server/db.js...")
sftp.put(r'c:\Users\dell\Downloads\cleaning-services-2026-04-23-10-47-55-utc\themeforest-clanyeco\dozeles-app\server\server.js', '/var/www/dozeles/server/server.js')
sftp.put(r'c:\Users\dell\Downloads\cleaning-services-2026-04-23-10-47-55-utc\themeforest-clanyeco\dozeles-app\server\db.js', '/var/www/dozeles/server/db.js')

print("3. Updating VPS db.json with all official admin users...")
remote_db_file = '/var/www/dozeles/server/data/db.json'
with sftp.file(remote_db_file, 'r') as f:
    vps_db = json.loads(f.read().decode('utf-8'))

if 'users' not in vps_db or not isinstance(vps_db['users'], list):
    vps_db['users'] = []

# List of all standard admins
accounts = [
    {"email": "admin@dozeles.com", "name": "Master Admin", "role": "admin", "password": "change-me-now"},
    {"email": "dozelescleaning@gmail.com", "name": "Dozeles Operations", "role": "admin", "password": "change-me-now"},
    {"email": "Maialeticia@hotmail.com", "name": "Leticia Maia", "role": "admin", "password": "change-me-now"},
    {"email": "leticiamaia@hotmail.com", "name": "Leticia Maia", "role": "admin", "password": "change-me-now"}
]

for acc in accounts:
    existing = next((u for u in vps_db['users'] if u.get('email', '').lower() == acc['email'].lower()), None)
    if existing:
        existing['password'] = acc['password']
        existing['role'] = 'admin'
    else:
        vps_db['users'].append({
            "id": f"usr_{acc['email'].split('@')[0]}",
            "email": acc['email'].lower(),
            "password": acc['password'],
            "name": acc['name'],
            "role": "admin",
            "createdAt": "2026-09-05T00:00:00.000Z"
        })

with sftp.file(remote_db_file, 'w') as f:
    f.write(json.dumps(vps_db, indent=2))

sftp.close()

print("4. Restarting PM2 process...")
stdin, stdout, stderr = client.exec_command('pm2 restart dozeles-api && pm2 list')
print(stdout.read().decode('utf-8', 'replace'))

client.close()

print("5. Testing live login endpoints on VPS (https://dozeles.com/api/auth/login)...")
test_logins = [
    {"email": "dozelescleaning@gmail.com", "passwords": ["change-me-now", "admin123", "1302@Sanjose", "dozeles2026"]},
    {"email": "admin@dozeles.com", "passwords": ["change-me-now", "admin123"]},
    {"email": "Maialeticia@hotmail.com", "passwords": ["change-me-now", "admin123"]},
    {"email": "leticiamaia@hotmail.com", "passwords": ["change-me-now", "admin123"]},
    {"email": "admin", "passwords": ["change-me-now", "admin123"]}
]

for item in test_logins:
    email = item["email"]
    for pwd in item["passwords"]:
        try:
            r = requests.post("https://dozeles.com/api/auth/login", json={"email": email, "password": pwd}, timeout=10)
            if r.status_code == 200:
                user_info = r.json().get('user', {})
                print(f" SUCCESS: Login '{email}' with password '{pwd}' -> Logged in as: {user_info.get('name')} ({user_info.get('role')})")
                break
            else:
                print(f" Failed: '{email}' with '{pwd}' -> {r.status_code} {r.text}")
        except Exception as e:
            print(f" Exception for '{email}': {e}")
