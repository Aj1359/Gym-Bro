import requests
import json
import time

BASE_URL = "http://localhost:8080/auth"
test_email = f"user_{int(time.time())}@gymbro.com"
test_password = "SecurePassword123!"

def run_tests():
    print("=== STARTING AUTHENTICATION END-TO-END TESTS ===")
    
    # 1. Register User
    print("\n1. Testing User Registration...")
    reg_payload = {"email": test_email, "password": test_password}
    r = requests.post(f"{BASE_URL}/register", json=reg_payload)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")
    assert r.status_code == 200, "Registration failed"
    tokens = r.json()
    access_token = tokens["accessToken"]
    refresh_token = tokens["refreshToken"]
    assert access_token and refresh_token, "Tokens not received"
    print("SUCCESS: Registration completed and returned tokens.")

    # 2. Register Duplicate User
    print("\n2. Testing Duplicate Registration...")
    r = requests.post(f"{BASE_URL}/register", json=reg_payload)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")
    assert r.status_code == 400, "Duplicate registration should fail"
    assert "Email already registered" in r.json().get("error", ""), "Incorrect error message"
    print("SUCCESS: Duplicate registration rejected correctly.")

    # 3. Register Weak Password User
    print("\n3. Testing Weak Password Validation...")
    weak_payload = {"email": f"weak_{test_email}", "password": "123"}
    r = requests.post(f"{BASE_URL}/register", json=weak_payload)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")
    assert r.status_code == 400, "Weak password registration should fail"
    assert "password" in r.json(), "Missing field-level validation message"
    print("SUCCESS: Weak password validation succeeded.")

    # 4. Login User
    print("\n4. Testing User Login...")
    login_payload = {"email": test_email, "password": test_password}
    r = requests.post(f"{BASE_URL}/login", json=login_payload)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")
    assert r.status_code == 200, "Login failed"
    login_tokens = r.json()
    new_access_token = login_tokens["accessToken"]
    new_refresh_token = login_tokens["refreshToken"]
    print("SUCCESS: Login completed successfully.")

    # 5. Login Wrong Password
    print("\n5. Testing Login with Incorrect Password...")
    bad_login_payload = {"email": test_email, "password": "WrongPassword!"}
    r = requests.post(f"{BASE_URL}/login", json=bad_login_payload)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")
    assert r.status_code == 400, "Bad login should return 400"
    assert "Invalid email or password" in r.json().get("error", ""), "Incorrect error message"
    print("SUCCESS: Wrong password login rejected correctly.")

    # 6. Token Refresh Rotation
    print("\n6. Testing Token Refresh Rotation...")
    refresh_payload = {"refreshToken": new_refresh_token}
    r = requests.post(f"{BASE_URL}/refresh", json=refresh_payload)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")
    assert r.status_code == 200, "Token refresh failed"
    refreshed_tokens = r.json()
    refreshed_access_token = refreshed_tokens["accessToken"]
    refreshed_refresh_token = refreshed_tokens["refreshToken"]
    print("SUCCESS: Token refresh rotated successfully.")

    # 7. Try reusing old rotated refresh token
    print("\n7. Testing Old Rotated Refresh Token Reuse...")
    r = requests.post(f"{BASE_URL}/refresh", json=refresh_payload)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")
    assert r.status_code == 400, "Rotated refresh token reuse should be rejected"
    print("SUCCESS: Rotated token reuse rejected correctly.")

    # 8. Logout
    print("\n8. Testing Logout...")
    logout_payload = {"refreshToken": refreshed_refresh_token}
    r = requests.post(f"{BASE_URL}/logout", json=logout_payload)
    print(f"Status: {r.status_code}")
    assert r.status_code == 204, "Logout failed"
    print("SUCCESS: Logout completed (204 No Content).")

    # 9. Try refreshing with logged out token
    print("\n9. Testing Post-Logout Token Refresh...")
    logged_out_refresh_payload = {"refreshToken": refreshed_refresh_token}
    r = requests.post(f"{BASE_URL}/refresh", json=logged_out_refresh_payload)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")
    assert r.status_code == 400, "Logged out refresh token should be rejected"
    print("SUCCESS: Logged out token rejected correctly.")

    print("\n=== ALL E2E AUTHENTICATION TESTS PASSED ===")

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"\nTEST SUITE ERROR: {e}")
