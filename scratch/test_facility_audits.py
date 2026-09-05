import requests
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

BASE_URL = 'http://localhost:4000'

def run_tests():
    # 1. Login as admin
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@dozeles.com",
        "password": "change-me-now"
    })
    token = login_res.json().get('token')
    if not token:
        # try fallback admin password
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@dozeles.com",
            "password": "password123"
        })
        token = login_res.json().get('token')
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    print("Admin Auth Status:", login_res.status_code, "Token acquired:", bool(token))

    # 2. Test Standalone AI Analysis Endpoint
    audit_input = {
        "companyName": "BioGenix Medical Innovation Center",
        "contactName": "Dr. Vanessa Sterling",
        "facilityType": "Medical / Dental Clinic",
        "sqFootage": "8,500 sq.ft.",
        "currentRate": 2400,
        "atpReading": 142,
        "atpLocation": "Restroom Main Faucet & Exam Room 3 Handle",
        "deficiencies": [
            {"category": "Restroom Tile & Grout", "note": "High discoloration and uric acid crystallization around floor urinals", "severity": "critical"},
            {"category": "Touchpoint Sanitization", "note": "Elevated microbial load on breakroom refrigerator handle", "severity": "moderate"}
        ],
        "oshaChecklist": {
            "sdsBinderPresent": True,
            "ghsChemicalLabels": False,
            "secondaryContainment": True,
            "eyewashUnobstructed": True,
            "slipHazardSignage": True,
            "electricalPanelClearance": False,
            "emergencyEgressClear": True
        },
        "fieldNotes": "Current janitorial contractor only visits 2x/week at night and does not use hospital-grade disinfectants."
    }

    ai_res = requests.post(f"{BASE_URL}/api/audits/analyze", json=audit_input)
    print("AI Analysis Status:", ai_res.status_code)
    ai_data = ai_res.json()
    print("Calculated Overall Score:", ai_data.get('overallScore'), "Grade:", ai_data.get('grade'))
    print("AI Executive Summary Sample:\n", ai_data.get('aiSummary')[:200], "...\n")
    assert ai_res.status_code == 200

    # 3. Test Create Audit via Admin API
    create_res = requests.post(f"{BASE_URL}/api/admin/audits", json=audit_input, headers=headers)
    print("Create Audit Status:", create_res.status_code)
    created_audit = create_res.json()
    audit_id = created_audit.get('id')
    assert audit_id is not None

    # 4. Test List Audits
    list_res = requests.get(f"{BASE_URL}/api/admin/audits", headers=headers)
    print("List Audits Status:", list_res.status_code, "Total count:", len(list_res.json()))
    assert list_res.status_code == 200

    # 5. Test Send Report Email
    email_payload = {"email": "dozelescleaning@gmail.com"}
    email_res = requests.post(f"{BASE_URL}/api/admin/audits/{audit_id}/send-email", json=email_payload, headers=headers)
    print("Send Report Card Email Status:", email_res.status_code, email_res.json())
    assert email_res.status_code == 200

    print("ALL FACILITY AUDIT TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
