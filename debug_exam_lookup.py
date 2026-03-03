import requests
import json

# Admin Backend
ADMIN_BASE = "http://localhost:9000/admin/api"
# User Backend
USER_BASE = "http://localhost:8002"

EXAM_ID = "6980e5a75a761883d83d0434"

def check_exam():
    print(f"Checking Exam ID: {EXAM_ID}")
    
    # 1. Login as Admin to list all exams
    print("\n--- Checking Admin Backend ---")
    admin_token = None
    try:
        resp = requests.post(f"{ADMIN_BASE}/auth/login", json={"username": "admin_lvuowhlttx", "password": "securepassword123"})
        if resp.status_code == 200:
            admin_token = resp.json().get("access_token")
            print("Admin Login: Success")
        else:
            print(f"Admin Login Failed: {resp.status_code}")
    except Exception as e:
        print(f"Admin Connection Error: {e}")

    if admin_token:
        headers = {"Authorization": f"Bearer {admin_token}"}
        try:
            resp = requests.get(f"{ADMIN_BASE}/exams", headers=headers)
            exams = resp.json()
            found = False
            for e in exams:
                if e["_id"] == EXAM_ID or e.get("id") == EXAM_ID:
                    print(f"✅ Found in Admin List: {e['title']} (ID: {e['_id']})")
                    found = True
                    break
            if not found:
                print("❌ Not found in Admin List")
                print("Available Exams:")
                for e in exams:
                    print(f" - {e['title']} (ID: {e['_id']})")
        except Exception as e:
            print(f"Fetch Error: {e}")

    # 2. Check User Backend (Public Info? Or needs student login?)
    # Usually getting exam details for intro page might be public or require student login.
    # Let's try fetching it directly if there's a public endpoint or simulate student login.
    
    print("\n--- Checking User Backend ---")
    # Student Login (using a test student created/seen before)
    student_token = None
    try:
        # Register/Login a test student
        reg_data = {"username": "debug_student", "email": "debug@example.com", "password": "password123"}
        
        # Try login first
        print(f"Attempting login to {USER_BASE}/auth/token")
        resp = requests.post(f"{USER_BASE}/auth/token", data={"username": "debug_student", "password": "password123"})
        
        if resp.status_code != 200:
            print(f"Login failed ({resp.status_code}), attempting registration...")
            # Try register
            resp = requests.post(f"{USER_BASE}/auth/register", json=reg_data)
            if resp.status_code in [200, 201]:
                print("Registration success, logging in...")
                # Login again
                resp = requests.post(f"{USER_BASE}/auth/token", data={"username": "debug_student", "password": "password123"})
        
        if resp.status_code == 200:
            student_token = resp.json().get("access_token")
            print("Student Login: Success")
        else:
            print(f"Student Login Failed: {resp.status_code} - {resp.text}")

    except Exception as e:
        print(f"User Backend Connection Error: {e}")

    if student_token:
        headers = {"Authorization": f"Bearer {student_token}"}
        try:
            # Try to get the exam
            print(f"Fetching exam from {USER_BASE}/exams/{EXAM_ID}")
            resp = requests.get(f"{USER_BASE}/exams/{EXAM_ID}", headers=headers)
            if resp.status_code == 200:
                print(f"✅ Found in User Backend: {resp.json().get('title')}")
            else:
                print(f"❌ Not found in User Backend: {resp.status_code} - {resp.text}")
                
            # List valid exams for student
            print("Listing available exams for student:")
            resp = requests.get(f"{USER_BASE}/exams", headers=headers)
            if resp.status_code == 200:
                for e in resp.json():
                    print(f" - {e['title']} (ID: {e.get('id') or e.get('_id')})")
        except Exception as e:
            print(f"User Fetch Error: {e}")

if __name__ == "__main__":
    check_exam()
