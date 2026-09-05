import paramiko
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

hostname = "2.25.90.226"
username = "root"
password = "1302@Sanjose"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=22, username=username, password=password, timeout=10)

stdin, stdout, stderr = client.exec_command('cat /var/www/dozeles/server/data/db.json')
content = stdout.read().decode('utf-8', 'replace')
try:
    db = json.loads(content)
    users = db.get('users', [])
    print(f"Total users in VPS db.json: {len(users)}")
    for u in users:
        print(f"ID: {u.get('id')}, Email: {u.get('email')}, Role: {u.get('role')}, Name: {u.get('name')}, Password: {u.get('password')}")
except Exception as e:
    print("Error parsing VPS db.json:", e)

# Also check /var/www/dozeles/server/.env
stdin, stdout, stderr = client.exec_command('cat /var/www/dozeles/server/.env')
print("\nVPS .env content:")
print(stdout.read().decode('utf-8', 'replace'))

client.close()
