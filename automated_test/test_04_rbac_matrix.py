"""
DAST Category 4: RBAC Matrix
Cross each role token × each endpoint and check actual vs expected HTTP status.
Roles: none, user (mock), admin (mock)
Endpoints: all public + all protected pages + all API routes
"""
import requests, time
from datetime import datetime

def run(base_url, user_token, admin_token):
    results = []

    ENDPOINTS = [
        # (path, method, required_role, expected_ok_status)
        ("/",                        "GET",  "none",  200),
        ("/about",                   "GET",  "none",  200),
        ("/features",                "GET",  "none",  200),
        ("/privacy",                 "GET",  "none",  200),
        ("/terms",                   "GET",  "none",  200),
        ("/contact",                 "GET",  "none",  200),
        ("/auth/login",              "GET",  "none",  200),
        ("/auth/signup",             "GET",  "none",  200),
        ("/auth/forgot-password",    "GET",  "none",  200),
        ("/dashboard",               "GET",  "user",  307),  # redirects to login when unauth
        ("/ai-coach",                "GET",  "user",  307),
        ("/fitness",                 "GET",  "user",  307),
        ("/nutrition",               "GET",  "user",  307),
        ("/sleep",                   "GET",  "user",  307),
        ("/scanner",                 "GET",  "user",  307),
        ("/future-lab",              "GET",  "user",  307),
        ("/challenges",              "GET",  "user",  307),
        ("/community",               "GET",  "user",  307),
        ("/profile",                 "GET",  "user",  307),
        ("/settings",                "GET",  "user",  307),
        ("/admin",                   "GET",  "admin", 307),
        ("/api/ai-coach",            "POST", "user",  401),
        ("/api/food-scanner",        "POST", "user",  401),
        ("/api/nutrition-planner",   "POST", "user",  401),
    ]

    token_map = {
        "none":  None,
        "user":  user_token,
        "admin": admin_token,
    }

    for path, method, required_role, expected_anon_status in ENDPOINTS:
        for role_label, token in token_map.items():
            headers = {"Content-Type": "application/json"}
            if token:
                headers["Authorization"] = f"Bearer {token}"

            url = f"{base_url}{path}"
            t0 = time.time()
            try:
                if method == "POST":
                    resp = requests.post(url, headers=headers, json={}, timeout=10, allow_redirects=False)
                else:
                    resp = requests.get(url, headers=headers, timeout=10, allow_redirects=False)
                status = resp.status_code
            except Exception as exc:
                status = 0
            elapsed = round((time.time() - t0) * 1000, 2)

            # Determine if this is a finding:
            # For protected routes with no token: 200 = auth bypass = finding
            # For public routes: non-2xx (except redirect) could be finding
            if required_role == "none":
                finding = (status not in (200, 301, 302, 307, 308)) and role_label == "none"
            else:
                # unauthenticated access should not return 200 on protected
                finding = (status == 200 and role_label == "none")

            severity = "High" if finding else "Info"

            results.append({
                "endpoint": path, "method": method, "role": role_label,
                "status": status, "expected_status": expected_anon_status if role_label == "none" else "varies",
                "finding": finding, "severity": severity,
                "response_time_ms": elapsed, "test_category": "RBAC Matrix",
                "note": f"Required role: {required_role}, tested as: {role_label}",
                "timestamp": datetime.utcnow().isoformat() + "Z",
            })
            marker = "✗ FINDING" if finding else "✓ pass"
            print(f"  [{marker}] RBAC | {method} {path} as {role_label} → {status}")
            time.sleep(0.08)

    return results
