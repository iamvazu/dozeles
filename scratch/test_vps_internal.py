import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("2.25.90.226", 22, "root", "1302@Sanjose", timeout=10)

test_script = """
node -e '
async function test() {
  const payload = {
    companyName: "Palo Alto Diagnostic Center",
    contactName: "Elena Vasquez",
    email: "evasquez@padiagnostics.com",
    phone: "650-290-0280",
    facilityType: "Medical / Dental Clinic",
    sqft: "6,500 sq.ft.",
    hasCurrentContractor: "Yes - current contractor missed critical disinfection protocols",
    concerns: "Exam room terminal sanitization and air filter maintenance",
    preferredDate: "Next Tuesday 9:00 AM",
    captchaAnswer: 9,
    captchaToken: Buffer.from(JSON.stringify({ a: 4, b: 5, sum: 9, t: Date.now() })).toString("base64")
  };
  const res = await fetch("http://127.0.0.1:4000/api/walkthrough", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  console.log("Walkthrough Status:", res.status, data);

  const leadsRes = await fetch("http://127.0.0.1:4000/api/admin/leads");
  const leads = await leadsRes.json();
  const latestLead = leads[0];
  console.log("Latest DB Lead:", latestLead.companyName, latestLead.stage, latestLead.auditDetails);
}
test();
'
"""

stdin, stdout, stderr = client.exec_command(test_script)
print(stdout.read().decode('utf-8', 'replace'))
print(stderr.read().decode('utf-8', 'replace'))
client.close()
