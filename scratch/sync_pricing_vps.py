import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('2.25.90.226', port=22, username='root', password='1302@Sanjose')
sftp = ssh.open_sftp()

print("Uploading pricing.js to VPS...")
sftp.put('client/src/data/pricing.js', '/var/www/dozeles/client/src/data/pricing.js')
sftp.close()

print("Building client on VPS...")
stdin, stdout, stderr = ssh.exec_command('cd /var/www/dozeles/client && npm run build')
out = stdout.read().decode('utf-8', errors='ignore')
err = stderr.read().decode('utf-8', errors='ignore')

ssh.close()
print("VPS sync complete!")
