"""
DAST Category 2: Authorization / Privilege Escalation
- Calls admin-intended route (GET /admin page) with user-role mock token
- Calls all API routes with user vs admin tokens (mock tokens – real Supabase will 401 both,
  but we flag if any 2xx leaks through)
- Tests middleware bypass: /admin accessed without any auth
"""
import json, requests, time
from datetime import datetime

def run(base_url, user_token, admin_token):
    results = []

    # Page routes that have role expectations
    ROLE_ROUTES = [
        {"path": "/admin",   "method": "GET", "expected_role": "admin",  "expected_status_unauth": 307},
        {"path": "/dashboard","method": "GET","expected_role": "user",   "expected_status_unauth": 307},
        {"path": "/settings", "method": "GET","expected_role": "user",   "expected_status_unauth": 307},
        {"path": "/profile",  "method": "GET","expected_role": "user",   "expected_status_unauth": 307},
    ]

    # API routes
    API_ROUTES = [
        {"path": "/api/ai-coach",          "method": "POST", "expected_role": "user"},
        {"path": "/api/food-scanner",      "method": "POST", "expected_role": "user"},
        {"path": "/api/nutrition-planner", "method": "POST", "expected_role": "user"},
    ]

    token_probes = [
        ("none",       None),
        ("user",       user_token),
        ("admin",      admin_token),
    ]

    # Test page routes – check redirect vs direct access
    for ep in ROLE_ROUTES:
        for role_label, token in token_probes:
            headers = {"Content-Type": "application/json"}
            if token:
                headers["Authorization"] = f"Bearer {token}"

            url = f"{base_url}{ep['path']}"
            t0 = time.time()
            try:
                resp = requests.get(url, headers=headers, timeout=10, allow_redirects=False)
                status = resp.status_code
                loc = resp.headers.get("Location", "")
            except Exception as exc:
                status = 0; loc = str(exc)
            elapsed = round((time.time() - t0) * 1000, 2)

            # A 200 on a protected page with no/wrong auth = finding
            finding = (status == 200 and role_label == "none")
            severity = "High" if finding else "Info"

            results.append({
                "endpoint": ep["path"], "method": ep["method"], "role": role_label,
                "status": status, "expected_status": ep["expected_status_unauth"] if role_label == "none" else 200,
                "finding": finding, "severity": severity, "response_time_ms": elapsed,
                "test_category": "AuthZ / Privesc",
                "note": f"role={role_label}, redirect_to={loc[:60]}" if loc else f"role={role_label}",
                "timestamp": datetime.utcnow().isoformat() + "Z",
            })
            marker = "✗ FINDING" if finding else "✓ pass"
            print(f"  [{marker}] AuthZ | {ep['method']} {ep['path']} as {role_label} → {status}")
            time.sleep(0.1)

    # Test API routes with user vs admin mock tokens
    for ep in API_ROUTES:
        for role_label, token in token_probes:
            headers = {"Content-Type": "application/json"}
            if token:
                headers["Authorization"] = f"Bearer {token}"

            body = {"message": "authz test", "goal": "health", "preference": "General", "image": ""}
            url = f"{base_url}{ep['path']}"
            t0 = time.time()
            try:
                resp = requests.post(url, headers=headers, json=body, timeout=10, allow_redirects=False)
                status = resp.status_code
            except Exception as exc:
                status = 0
            elapsed = round((time.time() - t0) * 1000, 2)

            # Mock tokens should be rejected; 2xx = finding
            finding = (status in (200, 201))
            results.append({
                "endpoint": ep["path"], "method": ep["method"], "role": role_label,
                "status": status, "expected_status": 401,
                "finding": finding, "severity": "High" if finding else "Info",
                "response_time_ms": elapsed, "test_category": "AuthZ / Privesc",
                "note": f"Mock token for role={role_label} – should be rejected by Supabase",
                "timestamp": datetime.utcnow().isoformat() + "Z",
            })
            marker = "✗ FINDING" if finding else "✓ pass"
            print(f"  [{marker}] AuthZ-API | {ep['method']} {ep['path']} as {role_label} → {status}")
            time.sleep(0.1)

    return results
