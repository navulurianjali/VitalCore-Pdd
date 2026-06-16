"""
DAST Category 3: IDOR (Insecure Direct Object Reference)
Attempt to reference other users' object IDs in request bodies
and URL parameters. Since the API endpoints don't expose
explicit ID-based GET paths, we probe via body parameters
(userId, orderId, profileId) and note any 200 responses with data.
"""
import json, requests, time
from datetime import datetime

def run(base_url, user_token, admin_token):
    results = []

    # Fabricated IDs to probe — these mimic UUIDs of "other" users
    OTHER_USER_IDS = [
        "00000000-0000-0000-0000-000000000001",
        "ffffffff-ffff-ffff-ffff-ffffffffffff",
        "11111111-1111-1111-1111-111111111111",
    ]

    # API routes that accept body payloads
    ENDPOINTS = [
        {"path": "/api/ai-coach",          "method": "POST"},
        {"path": "/api/nutrition-planner", "method": "POST"},
        {"path": "/api/food-scanner",      "method": "POST"},
    ]

    for ep in ENDPOINTS:
        for oid in OTHER_USER_IDS:
            # Inject foreign userId into request body
            body = {
                "userId":     oid,
                "profileId":  oid,
                "user_id":    oid,
                "message":    "IDOR probe",
                "goal":       "health",
                "preference": "General",
                "image":      "",
                "profile":    {"user_id": oid, "full_name": "Attacker"},
            }

            # Use user mock token (would be rejected by Supabase, but we check logic path)
            headers = {
                "Content-Type":  "application/json",
                "Authorization": f"Bearer {user_token}",
            }

            url = f"{base_url}{ep['path']}"
            t0 = time.time()
            try:
                resp = requests.post(url, headers=headers, json=body, timeout=10, allow_redirects=False)
                status = resp.status_code
                snippet = resp.text[:200]
            except Exception as exc:
                status = 0; snippet = str(exc)
            elapsed = round((time.time() - t0) * 1000, 2)

            # 200 with another userId in payload = potential IDOR
            finding = (status in (200, 201))
            results.append({
                "endpoint": ep["path"], "method": ep["method"], "role": "user",
                "status": status, "expected_status": 401,
                "finding": finding,
                "severity": "High" if finding else "Info",
                "response_time_ms": elapsed,
                "test_category": "IDOR",
                "note": f"Foreign userId={oid[:8]}… injected in body. Resp snippet: {snippet[:80]}",
                "timestamp": datetime.utcnow().isoformat() + "Z",
            })
            marker = "✗ FINDING" if finding else "✓ pass"
            print(f"  [{marker}] IDOR | {ep['method']} {ep['path']} userId={oid[:8]}… → {status}")
            time.sleep(0.12)

    return results
