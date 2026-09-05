import paramiko
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
print("2. Uploading WalkthroughAuditView.jsx and Admin.jsx...")
sftp.put(r'c:\Users\dell\Downloads\cleaning-services-2026-04-23-10-47-55-utc\themeforest-clanyeco\dozeles-app\client\src\admin\WalkthroughAuditView.jsx', '/var/www/dozeles/client/src/admin/WalkthroughAuditView.jsx')
sftp.put(r'c:\Users\dell\Downloads\cleaning-services-2026-04-23-10-47-55-utc\themeforest-clanyeco\dozeles-app\client\src\admin\Admin.jsx', '/var/www/dozeles/client/src/admin/Admin.jsx')
sftp.close()

print("3. Building client on VPS...")
stdin, stdout, stderr = client.exec_command('cd /var/www/dozeles/client && npm run build')
print(stdout.read().decode('utf-8', 'replace'))

client.close()
print("VPS sync complete!")
