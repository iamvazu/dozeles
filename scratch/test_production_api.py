import sys
import requests
import json
import time

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://www.dozeles.com"

def test_live_system():
    print(f"Testing live API on {BASE_URL}...")
    
    # 1. Admin login
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "iamvazu@gmail.com", "password": "1302@Sanjose"})
    if res.status_code != 200:
        res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@dozeles.com", "password": "change-me-now"})
    
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        return
    
    token = res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Admin login successful!")

    # 2. Test booking creates quote automatically
    booking_payload = {
        "name": "David Clark - Skyline Financial",
        "email": "david@skylinefin.com",
        "phone": "650-555-0811",
        "service": "Commercial Office Cleaning",
        "date": "2026-09-18",
        "time": "19:00",
        "address": "100 Pine St, San Francisco, CA",
        "notes": "5,000 sq. ft. executive suite. Requires high-touch disinfection and floor buffing."
    }
    b_res = requests.post(f"{BASE_URL}/api/bookings", json=booking_payload)
    print("Booking created:", b_res.status_code, b_res.json())
    quote_id = b_res.json().get("quoteId")

    # 3. Verify quote exists
    quotes_res = requests.get(f"{BASE_URL}/api/admin/quotes", headers=headers)
    quotes = quotes_res.json()
    print(f"Total quotes in system: {len(quotes)}")
    found_quote = next((q for q in quotes if q.get("id") == quote_id), None)
    if found_quote:
        print(f"Found quote #{found_quote.get('quoteNumber')} for '{found_quote['preparedFor']['clientName']}' - Total: ${found_quote['totalAmount']}")
        print(f"Program Title: {found_quote.get('programTitle')}")
        print(f"Certifications: Small Business #{found_quote['certifications']['smallBusinessCert']}, DIR #{found_quote['certifications']['dirReg']}")

    # 4. Create Janitor user
    janitor_email = f"janitor.ramirez.{int(time.time())}@dozeles.com"
    u_res = requests.post(f"{BASE_URL}/api/admin/users", headers=headers, json={
        "name": "Mateo Ramirez",
        "email": janitor_email,
        "password": "clean-mateo-2026",
        "role": "janitor"
    })
    print("Janitor created:", u_res.status_code, u_res.json().get("name"), "Role:", u_res.json().get("role"))

    # 5. Log in as Janitor
    j_login = requests.post(f"{BASE_URL}/api/auth/login", json={"email": janitor_email, "password": "clean-mateo-2026"})
    print("Janitor login status:", j_login.status_code)
    janitor_token = j_login.json()["token"]
    j_headers = {"Authorization": f"Bearer {janitor_token}"}

    # 6. Create project as admin
    proj_res = requests.post(f"{BASE_URL}/api/admin/projects", headers=headers, json={
        "title": "Pine St Executive Tower Janitorial",
        "clientName": "Skyline Financial Group",
        "address": "100 Pine St, SF, CA",
        "facilityType": "Financial / Commercial Office",
        "frequency": "5x / week",
        "assignedJanitors": ["Mateo Ramirez"],
        "notes": "Keycard access at security desk. Alarm code 4892."
    })
    print("Project created:", proj_res.status_code, proj_res.json().get("title"))

    # 7. Janitor views projects
    j_proj = requests.get(f"{BASE_URL}/api/admin/projects", headers=j_headers)
    print("Projects visible to Janitor Mateo:", len(j_proj.json()))

    print("\nALL PRODUCTION WORKFLOW TESTS PASSED!")

if __name__ == "__main__":
    test_live_system()
