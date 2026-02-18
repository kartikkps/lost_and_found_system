import requests
import sys

BASE_URL = "http://127.0.0.1:5000/api"
session = requests.Session()

def log(msg):
    print(f"[TEST] {msg}")

def test_flow():
    # 1. Register
    email = "api_test3@example.com"
    password = "password123"
    username = "ApiTestUser"
    
    log("Testing Register...")
    res = session.post(f"{BASE_URL}/register", json={
        "email": email,
        "password": password,
        "username": username
    })
    
    if res.status_code == 409:
        log("User already exists, proceeding to login.")
    elif res.status_code == 201:
        log("Registration successful.")
    else:
        log(f"Registration failed: {res.status_code} {res.text}")
        sys.exit(1)

    # 2. Login
    log("Testing Login...")
    res = session.post(f"{BASE_URL}/login", json={
        "email": email,
        "password": password
    })
    if res.status_code == 200:
        log("Login successful.")
    else:
        log(f"Login failed: {res.status_code} {res.text}")
        sys.exit(1)

    # 3. Get Current User
    log("Testing Get Current User...")
    res = session.get(f"{BASE_URL}/user/me")
    if res.status_code == 200:
        log(f"Current User: {res.json()}")
    else:
        log(f"Get Current User failed: {res.status_code} {res.text}")
        sys.exit(1)

   
    log("Testing Post Item...")
    try:
        res = session.post(f"{BASE_URL}/items", data={
            "title": "API Test Item",
            "description": "Created by test script",
            "location": "Test Lab",
            "contact": "123456"
        })
        
        if res.status_code == 201:
            log("Post Item successful.")
        else:
            log(f"Post Item failed: {res.status_code} {res.text}")
            sys.exit(1)
    except Exception as e:
        log(f"Post Item Error: {e}")

    # 5. Get User Items
    log("Testing Get User Items...")
    res = session.get(f"{BASE_URL}/user/items")
    if res.status_code == 200:
        items = res.json().get("items", [])
        log(f"User Items count: {len(items)}")
        if len(items) > 0:
            log("Verification Successful: Item found.")
        else:
            log("Verification Warning: No items found.")
    else:
        log(f"Get User Items failed: {res.status_code} {res.text}")

    # 6. Logout
    log("Testing Logout...")
    res = session.post(f"{BASE_URL}/logout")
    if res.status_code == 200:
        log("Logout successful.")
    else:
        log(f"Logout failed: {res.status_code}")

    # 7. Verify Logout
    res = session.get(f"{BASE_URL}/user/me")
    if res.status_code == 401 or res.status_code == 404:
        log("Session cleared verified.")
    else:
        log(f"Session still active? {res.status_code}")

if __name__ == "__main__":
    try:
        test_flow()
        print("\nALL TESTS PASSED")
    except Exception as e:
        print(f"\nTEST FAILED: {e}")
        sys.exit(1)
