"""
DAST Category 1: Authentication Bypass
Tests all protected API endpoints with:
  - No token
  - Malformed token
  - Expired/fake token
2xx on a protected endpoint = FINDING
"""
import json, requests, time
from datetime import datetime

def run(base_url, user_token, admin_token):
    results = []

    PROTECTED_API = [
        {"path": "/api/ai-coach",          "method": "POST"},
        {"path": "/api/food-scanner",      "method": "POST"},
        {"path": "/api/nutrition-planner", "method": "POST"},
    ]

    PROBES = [
        ("none",           {}),
        ("malformed",      {"Authorization": "Bearer INVALID.TOKEN.HERE"}),
        ("tampered_jwt",   {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdHRhY2tlciIsInJvbGUiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OX0.FAKESIGNATURE"}),
        ("expired_jwt",    {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6InVzZXIiLCJleHAiOjF9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"}),
    ]

    for ep in PROTECTED_API:
        for role_label, extra_headers in PROBES:
            headers = {"Content-Type": "application/json"}
            headers.update(extra_headers)

            # Minimal valid-looking body so the endpoint doesn't reject on missing fields first
            body = {"message": "test", "image": "", "goal": "health", "preference": "General"}

            url = f"{base_url}{ep['path']}"
            t0 = time.time()
            try:
                resp = requests.post(url, headers=headers, json=body, timeout=10, allow_redirects=False)
                status = resp.status_code
                body_text = resp.text[:200]
            except Exception as exc:
                status = 0
                body_text = str(exc)
            elapsed = round((time.time() - t0) * 1000, 2)

            finding = status in (200, 201)
            results.append({
                "endpoint":          ep["path"],
                "method":            ep["method"],
                "role":              role_label,
                "status":            status,
                "expected_status":   401,
                "finding":           finding,
                "severity":          "High" if finding else "Info",
                "response_time_ms":  elapsed,
                "test_category":     "AuthN Bypass",
                "note":              f"{role_label} token – response snippet: {body_text[:80]}",
                "timestamp":         datetime.utcnow().isoformat() + "Z",
            })
            marker = "✗ FINDING" if finding else "✓ pass"
            print(f"  [{marker}] AuthN Bypass | {ep['method']} {ep['path']} as {role_label} → {status}")
            time.sleep(0.15)

    return results
