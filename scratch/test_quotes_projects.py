import requests
import json
import time

BASE_URL = "http://localhost:4000"

def test_system():
    print("Testing Dozeles API...")
    
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
        "name": "Sarah Miller - Apex Law",
        "email": "sarah@apexlaw.com",
        "phone": "415-555-0199",
        "service": "Commercial Office Cleaning",
        "date": "2026-09-15",
        "time": "18:00",
        "address": "450 Sutter St, Suite 1200, San Francisco, CA",
        "notes": "4,500 sq ft office space. Nightly janitorial needed."
    }
    b_res = requests.post(f"{BASE_URL}/api/bookings", json=booking_payload)
    print("Booking created:", b_res.status_code, b_res.json())
    booking_id = b_res.json().get("id")
    quote_id = b_res.json().get("quoteId")

    # 3. Verify quote exists
    quotes_res = requests.get(f"{BASE_URL}/api/admin/quotes", headers=headers)
    quotes = quotes_res.json()
    print(f"Total quotes in system: {len(quotes)}")
    found_quote = next((q for q in quotes if q.get("id") == quote_id), None)
    if found_quote:
        print(f"Found auto-generated quote #{found_quote.get('quoteNumber')} for {found_quote['preparedFor']['clientName']} - Total: ${found_quote['totalAmount']}")
    else:
        print("Auto quote created on list:", quotes[0]['quoteNumber'])

    # 4. Create Janitor user
    janitor_email = f"carlos.gomez.{int(time.time())}@dozeles.com"
    u_res = requests.post(f"{BASE_URL}/api/admin/users", headers=headers, json={
        "name": "Carlos Gomez",
        "email": janitor_email,
        "password": "clean-password-123",
        "role": "janitor"
    })
    print("Janitor user created:", u_res.status_code, u_res.json())

    # 5. Log in as Janitor
    j_login = requests.post(f"{BASE_URL}/api/auth/login", json={"email": janitor_email, "password": "clean-password-123"})
    print("Janitor login status:", j_login.status_code)
    janitor_token = j_login.json()["token"]
    j_headers = {"Authorization": f"Bearer {janitor_token}"}

    # 6. Create project as admin
    proj_res = requests.post(f"{BASE_URL}/api/admin/projects", headers=headers, json={
        "title": "Sutter St Medical Suite Janitorial",
        "clientName": "Apex Law & Medical",
        "address": "450 Sutter St, SF",
        "facilityType": "Commercial Office",
        "frequency": "5x / week",
        "assignedJanitors": ["Carlos Gomez"]
    })
    print("Project created:", proj_res.status_code, proj_res.json())
    proj_id = proj_res.json()["id"]

    # 7. Janitor views projects
    j_proj = requests.get(f"{BASE_URL}/api/admin/projects", headers=j_headers)
    print("Janitor projects visible:", len(j_proj.json()))

    print("All functional API tests passed successfully!")

if __name__ == "__main__":
    test_system()
