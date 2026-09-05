import paramiko
import json

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('2.25.90.226', port=22, username='root', password='1302@Sanjose')
stdin, stdout, stderr = ssh.exec_command('cat /var/www/dozeles/server/data/db.json')
raw = stdout.read().decode('utf-8')
data = json.loads(raw)

bookings = [b for b in data.get('bookings', []) if 'Emily' in b.get('name', '') or 'emily' in b.get('email', '')]
print("Found Emily Bookings count:", len(bookings))
for b in bookings:
    print(json.dumps(b, indent=2))

ssh.close()
