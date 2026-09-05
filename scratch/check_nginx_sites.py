import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("2.25.90.226", 22, "root", "1302@Sanjose", timeout=10)

cmd = "ls -la /etc/nginx/sites-available/ && cat /etc/nginx/sites-available/hygeia | head -n 40"
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', 'replace'))
client.close()
