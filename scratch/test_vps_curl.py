import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("2.25.90.226", 22, "root", "1302@Sanjose", timeout=10)

cmd = "curl -s -X POST http://127.0.0.1:4000/api/walkthrough -H 'Content-Type: application/json' -d '{\"captchaAnswer\":\"99\"}'"
stdin, stdout, stderr = client.exec_command(cmd)
print("LOCALHOST:4000 RESPONSE:")
print(stdout.read().decode('utf-8', 'replace'))
client.close()
