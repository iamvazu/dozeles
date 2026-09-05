import requests
import json
import base64
import time
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

BASE_URL = 'http://2.25.90.226'

def test_live_walkthrough():
    # 1. Bad Captcha Test
    bad_payload = {
        "companyName": "Test Bot",
        "contactName": "Spam Bot",
        "email": "bot@spam.com",
        "phone": "555-0100",
        "facilityType": "Commercial Office",
        "sqft": "5,000 sq.ft.",
        "captchaAnswer": "999",
        "captchaToken": base64.b64encode(json.dumps({"a": 4, "b": 4, "sum": 8, "t": int(time.time()*1000)}).encode()).decode()
    }
    r = requests.post(f"{BASE_URL}/api/walkthrough", json=bad_payload, timeout=10)
    print("Bad Captcha Status:", r.status_code, r.text)
    assert r.status_code == 400

    # 2. Valid Walkthrough Submission to Live Production
    valid_payload = {
        "companyName": "Pacific Horizon Technology Campus",
        "contactName": "Rachel Hayes (VP Operations)",
        "email": "rhayes@pacifichorizon.com",
        "phone": "650-290-0280",
        "facilityType": "Tech / Corporate Office",
        "sqft": "15,000 sq.ft.",
        "hasCurrentContractor": "Yes - current cleaners miss daily trash and restroom deep disinfection",
        "concerns": "Looking for reliable evening crew and supervisor inspection reports",
        "preferredDate": "Next Wednesday at 2:00 PM",
        "captchaAnswer": "8",
        "captchaToken": base64.b64encode(json.dumps({"a": 4, "b": 4, "sum": 8, "t": int(time.time()*1000)}).encode()).decode()
    }
    r = requests.post(f"{BASE_URL}/api/walkthrough", json=valid_payload, timeout=10)
    print("Live Submission Status:", r.status_code, r.json())
    assert r.status_code in [200, 201]
    res_data = r.json()
    assert res_data.get("ok") == True
    print("ALL LIVE PRODUCTION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_live_walkthrough()
