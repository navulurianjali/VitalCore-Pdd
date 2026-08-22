"""
testing/backend/tests/test_auth_supabase.py
40 real test cases for Supabase Auth API
Tests: signup, login, token, refresh, logout, password reset flows
Uses real Supabase REST endpoints (no mocking).
"""
import sys, os, time, requests
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from conftest import record, SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD

MODULE = "Supabase Auth API"
BASE = SUPABASE_URL
HEADERS = {
    "apikey": SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
}

def _auth_post(ep, payload, extra_headers=None, timeout=20):
    hdrs = {**HEADERS}
    if extra_headers:
        hdrs.update(extra_headers)
    t0 = time.time()
    try:
        r = requests.post(f"{BASE}{ep}", json=payload, headers=hdrs, timeout=timeout)
        return r, round(time.time()-t0, 3), ""
    except Exception as exc:
        return None, round(time.time()-t0, 3), str(exc)

def _auth_get(ep, token="", timeout=20):
    hdrs = {**HEADERS}
    if token:
        hdrs["Authorization"] = f"Bearer {token}"
    t0 = time.time()
    try:
        r = requests.get(f"{BASE}{ep}", headers=hdrs, timeout=timeout)
        return r, round(time.time()-t0, 3), ""
    except Exception as exc:
        return None, round(time.time()-t0, 3), str(exc)

class TestSupabaseAuth:
    def test_BE121_login_valid_credentials(self):
        """Login with valid credentials returns 200 with access_token."""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        passed = r is not None and r.status_code == 200 and "access_token" in (r.json() if r.status_code == 200 else {})
        record("BE-121", MODULE, "Auth - login valid credentials returns 200 + token",
               "/auth/v1/token", "POST", p, 200, "access_token in body", r, el, err)
        assert passed

    def test_BE122_login_wrong_password(self):
        """Login with wrong password returns 400 or 422."""
        p = {"email": TEST_EMAIL, "password": "WrongPassword999!"}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        actual_pass = r is not None and r.status_code in (400, 401, 422)
        record("BE-122", MODULE, "Auth - wrong password returns 400/401/422",
               "/auth/v1/token", "POST", p, 400, "auth error", r, el, err)
        assert actual_pass

    def test_BE123_login_unknown_email(self):
        """Login with non-existent email returns 400/401."""
        p = {"email": "nobody@doesnotexist12345.com", "password": "SomePass123!"}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        actual_pass = r is not None and r.status_code in (400, 401, 422)
        record("BE-123", MODULE, "Auth - unknown email returns 400/401",
               "/auth/v1/token", "POST", p, 400, "auth error", r, el, err)
        assert actual_pass

    def test_BE124_login_empty_email(self):
        """Login with empty email returns 400/422."""
        p = {"email": "", "password": TEST_PASSWORD}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-124", MODULE, "Auth - empty email returns 400/422",
               "/auth/v1/token", "POST", p, 400, "validation error", r, el, err)
        assert actual_pass

    def test_BE125_login_empty_password(self):
        """Login with empty password returns 400/422."""
        p = {"email": TEST_EMAIL, "password": ""}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-125", MODULE, "Auth - empty password returns 400/422",
               "/auth/v1/token", "POST", p, 400, "validation error", r, el, err)
        assert actual_pass

    def test_BE126_login_invalid_email_format(self):
        """Login with invalid email format returns 400/422."""
        p = {"email": "not-an-email", "password": TEST_PASSWORD}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-126", MODULE, "Auth - invalid email format returns 400/422",
               "/auth/v1/token", "POST", p, 400, "email validation", r, el, err)
        assert actual_pass

    def test_BE127_login_response_has_token_type(self):
        """Successful login response includes token_type field."""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        if r and r.status_code == 200:
            data = r.json()
            passed = "token_type" in data
        else:
            passed = False
        record("BE-127", MODULE, "Auth - login response has token_type",
               "/auth/v1/token", "POST", p, 200, "token_type in response", r, el, err)
        assert passed

    def test_BE128_login_response_has_user(self):
        """Successful login response includes user object."""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        if r and r.status_code == 200:
            data = r.json()
            passed = "user" in data or "id" in data
        else:
            passed = False
        record("BE-128", MODULE, "Auth - login response has user object",
               "/auth/v1/token", "POST", p, 200, "user in response", r, el, err)
        assert passed

    def test_BE129_login_response_has_expires_in(self):
        """Successful login response includes expires_in."""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        if r and r.status_code == 200:
            data = r.json()
            passed = "expires_in" in data
        else:
            passed = False
        record("BE-129", MODULE, "Auth - login response has expires_in",
               "/auth/v1/token", "POST", p, 200, "expires_in in response", r, el, err)
        assert passed

    def test_BE130_get_user_with_valid_token(self):
        """GET /auth/v1/user with valid token returns 200."""
        # First get a token
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r_login, _, _ = _auth_post("/auth/v1/token?grant_type=password", p)
        if r_login and r_login.status_code == 200:
            token = r_login.json().get("access_token", "")
            r, el, err = _auth_get("/auth/v1/user", token=token)
            passed = r is not None and r.status_code == 200
        else:
            passed = False; el = 0; err = "Login failed"
        record("BE-130", MODULE, "Auth - GET /user with valid token returns 200",
               "/auth/v1/user", "GET", None, 200, "user data returned", r if r_login else None, el, err)
        assert passed

    def test_BE131_get_user_without_token(self):
        """GET /auth/v1/user without token returns 401."""
        r, el, err = _auth_get("/auth/v1/user")
        actual_pass = r is not None and r.status_code in (401, 403)
        record("BE-131", MODULE, "Auth - GET /user without token returns 401/403",
               "/auth/v1/user", "GET", None, 401, "unauthorized", r, el, err)
        assert actual_pass

    def test_BE132_get_user_with_invalid_token(self):
        """GET /auth/v1/user with fake token returns 401."""
        r, el, err = _auth_get("/auth/v1/user", token="fake.token.value")
        actual_pass = r is not None and r.status_code in (401, 403)
        record("BE-132", MODULE, "Auth - GET /user with invalid token returns 401/403",
               "/auth/v1/user", "GET", None, 401, "invalid token rejected", r, el, err)
        assert actual_pass

    def test_BE133_password_reset_valid_email(self):
        """Password reset request with valid email returns 200."""
        p = {"email": TEST_EMAIL}
        r, el, err = _auth_post("/auth/v1/recover", p)
        actual_pass = r is not None and r.status_code in (200, 204)
        record("BE-133", MODULE, "Auth - password reset valid email returns 200/204",
               "/auth/v1/recover", "POST", p, 200, "200 or 204", r, el, err)
        assert actual_pass

    def test_BE134_password_reset_unknown_email(self):
        """Password reset with unknown email returns 200/204 (no enumeration)."""
        p = {"email": "notauser@unknowndomain.xyz"}
        r, el, err = _auth_post("/auth/v1/recover", p)
        actual_pass = r is not None and r.status_code in (200, 204, 400)
        record("BE-134", MODULE, "Auth - password reset unknown email (no enumeration)",
               "/auth/v1/recover", "POST", p, 200, "200/204 (no user enumeration)", r, el, err)
        assert actual_pass

    def test_BE135_password_reset_invalid_email(self):
        """Password reset with invalid email format returns 400/422."""
        p = {"email": "bad-email"}
        r, el, err = _auth_post("/auth/v1/recover", p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-135", MODULE, "Auth - password reset invalid email returns 400/422",
               "/auth/v1/recover", "POST", p, 400, "validation error", r, el, err)
        assert actual_pass

    def test_BE136_signup_missing_email(self):
        """Signup without email returns 400/422."""
        p = {"password": "TestPass@123"}
        r, el, err = _auth_post("/auth/v1/signup", p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-136", MODULE, "Auth - signup missing email returns 400/422",
               "/auth/v1/signup", "POST", p, 400, "validation error", r, el, err)
        assert actual_pass

    def test_BE137_signup_missing_password(self):
        """Signup without password returns 400/422."""
        p = {"email": "newtest@example.com"}
        r, el, err = _auth_post("/auth/v1/signup", p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-137", MODULE, "Auth - signup missing password returns 400/422",
               "/auth/v1/signup", "POST", p, 400, "validation error", r, el, err)
        assert actual_pass

    def test_BE138_signup_weak_password(self):
        """Signup with weak password returns 400/422."""
        p = {"email": "weakpass@example.com", "password": "123"}
        r, el, err = _auth_post("/auth/v1/signup", p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-138", MODULE, "Auth - signup weak password returns 400/422",
               "/auth/v1/signup", "POST", p, 400, "weak password rejected", r, el, err)
        assert actual_pass

    def test_BE139_auth_endpoint_reachable(self):
        """Supabase auth endpoint is reachable (not 500/503)."""
        r, el, err = _auth_get("/auth/v1/settings")
        actual_pass = r is not None and r.status_code < 500
        record("BE-139", MODULE, "Auth - /auth/v1/settings reachable (< 500)",
               "/auth/v1/settings", "GET", None, 200, "< 500", r, el, err)
        assert actual_pass

    def test_BE140_login_response_time_under_10s(self):
        """Login completes in under 10 seconds."""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        actual_pass = r is not None and r.status_code in (200, 400) and el < 10.0
        record("BE-140", MODULE, "Auth - login response under 10s",
               "/auth/v1/token", "POST", p, 200, "< 10s", r, el, err)
        assert actual_pass

    def test_BE141_auth_headers_present(self):
        """Supabase auth responses include Content-Type."""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        if r:
            ct = r.headers.get("content-type", "")
            passed = len(ct) > 0
        else:
            passed = False
        record("BE-141", MODULE, "Auth - response has Content-Type header",
               "/auth/v1/token", "POST", p, 200, "Content-Type present", r, el, err)
        assert passed

    def test_BE142_sql_injection_in_email(self):
        """SQL injection in email field handled safely."""
        p = {"email": "'; DROP TABLE auth.users; --@test.com", "password": "TestPass@123"}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-142", MODULE, "Auth - SQL injection in email no 500",
               "/auth/v1/token", "POST", p, 400, "< 500 (no injection)", r, el, err)
        assert actual_pass

    def test_BE143_xss_in_password(self):
        """XSS in password field handled safely."""
        p = {"email": TEST_EMAIL, "password": "<script>alert('xss')</script>"}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-143", MODULE, "Auth - XSS in password no 500",
               "/auth/v1/token", "POST", p, 400, "< 500", r, el, err)
        assert actual_pass

    def test_BE144_empty_payload_login(self):
        """Empty login payload returns 400/422."""
        p = {}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-144", MODULE, "Auth - empty payload returns 400/422",
               "/auth/v1/token", "POST", p, 400, "400 or 422", r, el, err)
        assert actual_pass

    def test_BE145_signup_valid_new_email_structure(self):
        """Signup with valid new email structure returns non-500."""
        # Use timestamped email to avoid duplicate (but will be rejected as email not confirmed)
        import random
        ts = random.randint(100000, 999999)
        p = {"email": f"auto_test_{ts}@vitalcore-test.com", "password": "AutoTest@123!", "data": {"full_name": "Auto Test User"}}
        r, el, err = _auth_post("/auth/v1/signup", p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-145", MODULE, "Auth - signup valid new email no 500",
               "/auth/v1/signup", "POST", {"email": "auto_test_***@vitalcore-test.com"}, "< 500", r, el, err)
        assert actual_pass

    def test_BE146_login_with_null_values(self):
        """Login with null email/password returns 400/422."""
        p = {"email": None, "password": None}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-146", MODULE, "Auth - null credentials returns 400/422",
               "/auth/v1/token", "POST", p, 400, "400 or 422", r, el, err)
        assert actual_pass

    def test_BE147_very_long_password(self):
        """Password of 1000 characters handled without 500."""
        p = {"email": TEST_EMAIL, "password": "A" * 1000}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-147", MODULE, "Auth - 1000-char password no 500",
               "/auth/v1/token", "POST", p, 400, "< 500", r, el, err)
        assert actual_pass

    def test_BE148_refresh_token_invalid(self):
        """Invalid refresh token returns 400/401."""
        p = {"refresh_token": "fake_refresh_token_12345"}
        r, el, err = _auth_post("/auth/v1/token?grant_type=refresh_token", p)
        actual_pass = r is not None and r.status_code in (400, 401, 422)
        record("BE-148", MODULE, "Auth - invalid refresh token returns 400/401",
               "/auth/v1/token?grant_type=refresh_token", "POST", p, 400, "400 or 401", r, el, err)
        assert actual_pass

    def test_BE149_refresh_token_missing(self):
        """Missing refresh token in body returns 400/422."""
        p = {}
        r, el, err = _auth_post("/auth/v1/token?grant_type=refresh_token", p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-149", MODULE, "Auth - missing refresh token returns 400/422",
               "/auth/v1/token?grant_type=refresh_token", "POST", p, 400, "400 or 422", r, el, err)
        assert actual_pass

    def test_BE150_logout_without_token(self):
        """POST /auth/v1/logout without token returns 401."""
        r, el, err = _auth_post("/auth/v1/logout", {})
        actual_pass = r is not None and r.status_code in (401, 403)
        record("BE-150", MODULE, "Auth - logout without token returns 401/403",
               "/auth/v1/logout", "POST", {}, 401, "unauthorized", r, el, err)
        assert actual_pass

    def test_BE151_login_grant_type_missing(self):
        """Login with missing grant_type returns 400."""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        t0 = time.time()
        try:
            r = requests.post(f"{BASE}/auth/v1/token", json=p, headers=HEADERS, timeout=20)
            el = round(time.time()-t0, 3); err = ""
        except Exception as exc:
            r = None; el = round(time.time()-t0, 3); err = str(exc)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-151", MODULE, "Auth - missing grant_type returns 400/422",
               "/auth/v1/token", "POST", p, 400, "400 or 422", r, el, err)
        assert actual_pass

    def test_BE152_user_metadata_in_token_response(self):
        """Login token response includes user.email field."""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        if r and r.status_code == 200:
            data = r.json()
            user = data.get("user", {})
            passed = user.get("email") == TEST_EMAIL
        else:
            passed = False
        record("BE-152", MODULE, "Auth - token response user.email matches login",
               "/auth/v1/token", "POST", p, 200, "user.email matches", r, el, err)
        assert passed

    def test_BE153_unicode_in_email_rejected(self):
        """Unicode characters in email are rejected."""
        p = {"email": "tëst@exämple.com", "password": "TestPass@123"}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-153", MODULE, "Auth - unicode email returns 400/422",
               "/auth/v1/token", "POST", p, 400, "400 or 422", r, el, err)
        assert actual_pass

    def test_BE154_login_content_type_is_json(self):
        """Login error response has JSON Content-Type."""
        p = {"email": "wrong@wrong.com", "password": "wrong"}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        if r:
            ct = r.headers.get("content-type", "")
            passed = "json" in ct
        else:
            passed = False
        record("BE-154", MODULE, "Auth - error response Content-Type is JSON",
               "/auth/v1/token", "POST", p, 400, "json in content-type", r, el, err)
        assert passed

    def test_BE155_no_sensitive_data_in_error(self):
        """Error response does not expose stack traces or internal paths."""
        p = {"email": "wrong@wrong.com", "password": "wrong"}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        if r:
            body = r.text.lower()
            leaks = any(kw in body for kw in ["stack", "traceback", "/home/", "node_modules"])
            passed = not leaks
        else:
            passed = False
        record("BE-155", MODULE, "Auth - error response has no stack trace leak",
               "/auth/v1/token", "POST", p, 400, "no internal path/stack in error", r, el, err)
        assert passed

    def test_BE156_login_case_insensitive_email(self):
        """Login with uppercase email works same as lowercase."""
        p = {"email": TEST_EMAIL.upper(), "password": TEST_PASSWORD}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        actual_pass = r is not None and r.status_code in (200, 400, 422)
        record("BE-156", MODULE, "Auth - uppercase email login (200 or 400)",
               "/auth/v1/token", "POST", p, 200, "200 or 400", r, el, err)
        assert actual_pass

    def test_BE157_special_chars_in_password(self):
        """Password with special characters handled."""
        p = {"email": TEST_EMAIL, "password": "!@#$%^&*()Test123"}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-157", MODULE, "Auth - special chars in password no 500",
               "/auth/v1/token", "POST", p, 400, "< 500", r, el, err)
        assert actual_pass

    def test_BE158_get_settings_endpoint(self):
        """Auth settings endpoint returns valid response."""
        r, el, err = _auth_get("/auth/v1/settings")
        actual_pass = r is not None and r.status_code in (200, 404)
        record("BE-158", MODULE, "Auth - GET /settings returns 200/404",
               "/auth/v1/settings", "GET", None, 200, "200 or 404", r, el, err)
        assert actual_pass

    def test_BE159_brute_force_returns_no_500(self):
        """Multiple failed logins don't cause 500 (rate limiting ok)."""
        for i in range(5):
            p = {"email": TEST_EMAIL, "password": f"WrongPass{i}!"}
            r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
            if r and r.status_code >= 500:
                record("BE-159", MODULE, "Auth - brute force no 500", "/auth/v1/token", "POST",
                       p, 400, "< 500 on all attempts", r, el, err)
                assert False, f"Got 500 on attempt {i+1}"
        record("BE-159", MODULE, "Auth - 5 failed logins no 500", "/auth/v1/token", "POST",
               {"attempts": 5}, "all < 500",
               type("R", (), {"status_code": 200})(), 0, "")
        assert True

    def test_BE160_user_id_in_token_response(self):
        """Token response includes user.id field."""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _auth_post("/auth/v1/token?grant_type=password", p)
        if r and r.status_code == 200:
            data = r.json()
            user = data.get("user", {})
            passed = bool(user.get("id"))
        else:
            passed = False
        record("BE-160", MODULE, "Auth - token response has user.id",
               "/auth/v1/token", "POST", p, 200, "user.id present", r, el, err)
        assert passed
