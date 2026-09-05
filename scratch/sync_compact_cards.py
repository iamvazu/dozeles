import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('2.25.90.226', port=22, username='root', password='1302@Sanjose')
sftp = ssh.open_sftp()

files_to_upload = [
    ('client/src/admin/Admin.jsx', '/var/www/dozeles/client/src/admin/Admin.jsx'),
    ('client/src/admin/LeadsView.jsx', '/var/www/dozeles/client/src/admin/LeadsView.jsx'),
    ('client/src/admin/CustomersView.jsx', '/var/www/dozeles/client/src/admin/CustomersView.jsx'),
    ('client/src/admin/ServiceQuote.jsx', '/var/www/dozeles/client/src/admin/ServiceQuote.jsx'),
    ('client/src/admin/UsersAdminView.jsx', '/var/www/dozeles/client/src/admin/UsersAdminView.jsx'),
    ('client/src/admin/PricingAdminView.jsx', '/var/www/dozeles/client/src/admin/PricingAdminView.jsx'),
    ('client/src/index.css', '/var/www/dozeles/client/src/index.css'),
]

for local_path, remote_path in files_to_upload:
    print(f"Uploading {local_path} -> {remote_path}...")
    sftp.put(local_path, remote_path)

sftp.close()

print("Building client on VPS...")
stdin, stdout, stderr = ssh.exec_command("cd /var/www/dozeles/client && npm run build")
print(stdout.read().decode())
print(stderr.read().decode())

ssh.close()
print("VPS sync complete!")
