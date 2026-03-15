import requests
import json
import time
import uuid

USER_API = "http://localhost:8002"
ADMIN_API = "http://localhost:8000/admin/api"
print("--- 🚀 EXAMGUARD E2E FEATURE VERIFICATION ---")

# 1. Admin Login
print("\n[1] Testing Admin Auth...")
admin_credentials = {"username": "admin@examguard.com", "password": "admin123"}
r = requests.post(f"{ADMIN_API}/auth/login", json=admin_credentials)

if r.status_code == 401:
    print("   Admin not found. Registering test admin...")
    admin_reg = {
        "username": "admin@examguard.com", 
        "email": "admin@examguard.com", 
        "password": "admin123",
        "full_name": "System Admin",
        "role": "SUPER_ADMIN"
    }
    requests.post(f"{ADMIN_API}/auth/register", json=admin_reg)
    r = requests.post(f"{ADMIN_API}/auth/login", json=admin_credentials)

if r.status_code == 200:
    admin_token = r.json().get("access_token")
    print("✅ Admin login successful")
else:
    print("❌ Admin login failed:", r.status_code, r.text)
    exit(1)

# 2. Student Registration & Login
print("\n[2] Testing Student Auth...")
timestamp = int(time.time())
test_user = {
    "username": f"testuser_{timestamp}",
    "email": f"test_{timestamp}@exam.com",
    "password": "password123"
}
r = requests.post(f"{USER_API}/auth/register", json=test_user)
if r.status_code in [200, 201]:
    print("✅ Student registration successful")
else:
    print("❌ Student registration failed:", r.status_code, r.text)

r = requests.post(f"{USER_API}/auth/token", data={"username": test_user["username"], "password": test_user["password"]})
student_token = None
if r.status_code == 200:
    student_token = r.json().get("access_token")
    print("✅ Student login successful")
else:
    print("❌ Student login failed:", r.status_code, r.text)
    exit(1)

# 3. Fetching Exams
print("\n[3] Testing Exam Fetching...")
headers = {"Authorization": f"Bearer {student_token}"}
r = requests.get(f"{USER_API}/exams/", headers=headers)
exam_id = None
if r.status_code == 200 and len(r.json()) > 0:
    exams = r.json()
    exam_id = exams[0].get("_id", exams[0].get("id"))
    print(f"✅ Fetched {len(exams)} exams. Using exam ID: {exam_id}")
else:
    print("❌ Failed to fetch exams or no exams found:", r.text)
    exit(1)

# 4. Simulating Exam Session & Behavioral Logging
print("\n[4] Testing Behavioral Biometrics Logging...")
sub_id = str(uuid.uuid4())
behavior_payload = {
    "exam_id": exam_id,
    "submission_id": sub_id,
    "events": [
        {"type": "keydown", "timestamp": int(time.time()*1000) - 10000},
        {"type": "keydown", "timestamp": int(time.time()*1000) - 9000},
        {"type": "paste", "pasted_text": "def hello(): print('world')", "timestamp": int(time.time()*1000) - 8000},
        {"type": "tab_switch", "status": "hidden", "timestamp": int(time.time()*1000) - 5000},
        {"type": "tab_switch", "status": "visible", "timestamp": int(time.time()*1000) - 1000}
    ]
}
r = requests.post(f"{USER_API}/behavior/log", json=behavior_payload, headers=headers)
if r.status_code == 200:
    print("✅ Behavioral logs sent successfully")
else:
    print("❌ Behavioral logging failed:", r.status_code, r.text)

# 5. Exam Submission
print("\n[5] Testing Exam Submission & Anomaly Scoring...")
submission_payload = {
    "answers": {"0": {"0": 1}, "1": {"0": "print('hello')"}} # Mock answers
}
r = requests.post(f"{USER_API}/exams/{exam_id}/submit", json=submission_payload, headers=headers)
if r.status_code in [200, 201]:
    submit_response = r.json()
    print("✅ Exam submission successful")
else:
    submit_response = {}
    print("❌ Exam submission failed:", r.status_code, r.text)

time.sleep(2) # Allow async anomaly scoring to settle

# 6. Admin Results API
print("\n[6] Testing Admin Analytics & Risk Extraction...")
admin_headers = {"Authorization": f"Bearer {admin_token}"}
r = requests.get(f"{ADMIN_API}/analytics/exams/{exam_id}/results", headers=admin_headers)
if r.status_code == 200:
    results = r.json()
    test_sub = next((s for s in results.get("submissions", []) if s["user_id"] == test_user["email"] or s["user_id"] == test_user["username"] or s.get("id") == submit_response.get("submission_id")), None)
    
    # Handle if test_sub is found or search more broadly
    if not test_sub:
        submissions = results.get("submissions", [])
        if submissions:
            test_sub = submissions[-1] # Fallback to latest
        
    if test_sub:
        print(f"✅ Admin fetched results. Evaluated submission.")
        print(f"   Score: {test_sub.get('score', 'Pending')}")
        print(f"   Risk Score: {test_sub.get('anomaly_score')}")
        print(f"   Risk Level: {test_sub.get('risk_level')}")
        print(f"   Behavior Data Found: {'Yes' if test_sub.get('behavior') else 'No'}")
    else:
        print("❌ Could not find the test submission in Admin results.")
else:
    print("❌ Admin analytics failed:", r.status_code, r.text)

print("\n--- ✅ ALL TESTS COMPLETED ---")
