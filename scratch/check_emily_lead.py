import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('2.25.90.226', port=22, username='root', password='1302@Sanjose')
stdin, stdout, stderr = ssh.exec_command('sqlite3 /var/www/dozeles/server/data/dozeles.db "SELECT id, name, email, phone, service, date, time, address, notes, created_at FROM bookings WHERE name LIKE \'%Emily%\';"')
output = stdout.read().decode('utf-8')
print("DB Query Result:\n", output)
ssh.close()
