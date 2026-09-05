import requests
import json
import base64
import time

BASE_URL = 'http://localhost:4000'

def test_walkthrough():
    # 1. Test Bot Protection: Bad Captcha
    bad_payload = {
        "companyName": "Test Tech Center",
        "contactName": "Michael Scott",
        "email": "michael@dundermifflin.com",
        "phone": "650-555-0199",
        "facilityType": "Tech / Corporate Office",
        "sqft": "8,500 sq.ft.",
        "hasCurrentContractor": "Yes - looking to switch / compare pricing",
        "concerns": "Restrooms and conference rooms lack consistent quality",
        "preferredDate": "Next Tuesday morning",
        "captchaAnswer": "999",
        "captchaToken": base64.b64encode(json.dumps({"a": 3, "b": 4, "sum": 7, "t": int(time.time()*1000)}).encode()).decode()
    }
    r = requests.post(f"{BASE_URL}/api/walkthrough", json=bad_payload)
    print("Bad Captcha Test:", r.status_code, r.text)
    assert r.status_code == 400

    # 2. Test Honeypot Trap
    honeypot_payload = dict(bad_payload)
    honeypot_payload["captchaAnswer"] = "7"
    honeypot_payload["hp_website"] = "http://spambot.com"
    r = requests.post(f"{BASE_URL}/api/walkthrough", json=honeypot_payload)
    print("Honeypot Trap Test:", r.status_code, r.text)
    assert r.status_code == 400

    # 3. Valid Submission
    valid_payload = {
        "companyName": "Silicon Valley Biotech Labs",
        "contactName": "Dr. Aris Thorne",
        "email": "athorne@svbiotechlabs.com",
        "phone": "650-290-0280",
        "facilityType": "Medical / Dental Clinic",
        "sqft": "12,000 sq.ft.",
        "hasCurrentContractor": "Yes - quality has slipped significantly",
        "concerns": "Cleanroom terminal disinfection and floor sanitization",
        "preferredDate": "Thursday at 10:00 AM",
        "captchaAnswer": "7",
        "captchaToken": base64.b64encode(json.dumps({"a": 3, "b": 4, "sum": 7, "t": int(time.time()*1000)}).encode()).decode()
    }
    r = requests.post(f"{BASE_URL}/api/walkthrough", json=valid_payload)
    print("Valid Submission Test:", r.status_code, r.json())
    assert r.status_code in [200, 201]
    res_data = r.json()
    assert res_data.get("ok") == True
    print("✅ Walkthrough API Test Passed Successfully!")

if __name__ == "__main__":
    test_walkthrough()
