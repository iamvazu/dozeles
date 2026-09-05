import paramiko
import os
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

hostname = "2.25.90.226"
username = "root"
password = "1302@Sanjose"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=22, username=username, password=password, timeout=15)

stdin, stdout, stderr = client.exec_command('ls -la /var/www/dozeles/client')
print("VPS client directory:")
print(stdout.read().decode('utf-8', 'replace'))

client.close()
