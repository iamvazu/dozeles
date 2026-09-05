import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

HOST = "2.25.90.226"
USER = "root"
PASS = "1302@Sanjose"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS, timeout=15)

stdin, stdout, stderr = ssh.exec_command("pm2 status")
out = stdout.read().decode('utf-8', errors='ignore')
print("PM2 Status:\n" + out)

stdin, stdout, stderr = ssh.exec_command("curl -s http://localhost:4000/api/pricing")
print("\nAPI Test response:\n" + stdout.read().decode('utf-8', errors='ignore')[:200])

ssh.close()
