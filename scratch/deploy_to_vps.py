import paramiko
import time

HOST = "2.25.90.226"
USER = "root"
PASS = "1302@Sanjose"

def deploy():
    print(f"Connecting to {HOST} via SSH...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS, timeout=15)
    
    commands = [
        "cd /var/www/dozeles/server && git pull origin main",
        "cd /var/www/dozeles/server && npm install",
        "pm2 restart dozeles-api",
        "pm2 status"
    ]
    
    for cmd in commands:
        print(f"\n--- Running: {cmd} ---")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode()
        err = stderr.read().decode()
        if out:
            print("STDOUT:\n" + out)
        if err:
            print("STDERR:\n" + err)
            
    ssh.close()
    print("\nDeployment to VPS completed successfully!")

if __name__ == "__main__":
    deploy()
