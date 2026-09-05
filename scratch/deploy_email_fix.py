import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('2.25.90.226', port=22, username='root', password='1302@Sanjose')
sftp = ssh.open_sftp()

print("Uploading server/server.js to VPS...")
sftp.put('server/server.js', '/var/www/dozeles/server/server.js')
sftp.close()

print("Restarting dozeles-api on VPS...")
stdin, stdout, stderr = ssh.exec_command('pm2 restart dozeles-api && pm2 status')
print(stdout.read().decode('utf-8'))
print(stderr.read().decode('utf-8'))

ssh.close()
print("Deployment complete!")
