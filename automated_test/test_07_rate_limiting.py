"""
DAST Category 7: Rate Limiting
Send a controlled burst of 30 requests to each API endpoint.
Absence of 429 Too Many Requests within the burst = FINDING.
"""
import requests, time
from datetime import datetime

BURST_COUNT = 30
BURST_DELAY = 0.05  # 50ms between requests = ~20 req/s

def _burst(base_url, path, method, headers, body):
    statuses = []
    for _ in range(BURST_COUNT):
        try:
            if method == "POST":
                r = requests.post(f"{base_url}{path}", headers=headers, json=body,
                                  timeout=8, allow_redirects=False)
            else:
                r = requests.get(f"{base_url}{path}", headers=headers,
                                 timeout=8, allow_redirects=False)
            statuses.append(r.status_code)
        except Exception:
            statuses.append(0)
        time.sleep(BURST_DELAY)
    return statuses

def run(base_url, user_token, admin_token):
    results = []

    RATE_TARGETS = [
        {"path": "/api/ai-coach",          "method": "POST"},
        {"path": "/api/food-scanner",      "method": "POST"},
        {"path": "/api/nutrition-planner", "method": "POST"},
        {"path": "/auth/login",            "method": "GET"},   # login page flood
    ]

    headers_no_auth = {"Content-Type": "application/json"}
    headers_user    = {"Content-Type": "application/json", "Authorization": f"Bearer {user_token}"}

    for ep in RATE_TARGETS:
        for role_label, headers in [("none", headers_no_auth), ("user", headers_user)]:
            body = {"message": "rate limit probe", "goal": "health",
                    "preference": "General", "image": ""}

            t0 = time.time()
            statuses = _burst(base_url, ep["path"], ep["method"], headers, body)
            elapsed  = round((time.time() - t0) * 1000, 2)

            got_429 = 429 in statuses
            finding = not got_429   # no rate limit = finding

            results.append({
                "endpoint": ep["path"], "method": ep["method"], "role": role_label,
                "status": statuses[-1], "expected_status": 429,
                "finding": finding,
                "severity": "Medium" if finding else "Info",
                "response_time_ms": elapsed,
                "test_category": "Rate Limiting",
                "note": (
                    f"Burst {BURST_COUNT} reqs. No 429 returned. Statuses seen: {set(statuses)}"
                    if finding else
                    f"Rate limit 429 detected after {statuses.index(429)+1} reqs"
                ),
                "timestamp": datetime.utcnow().isoformat() + "Z",
            })
            marker = "⚠ FINDING" if finding else "✓ pass"
            print(f"  [{marker}] Rate Limit | {ep['method']} {ep['path']} as {role_label} "
                  f"→ 429 seen={got_429}, statuses={set(statuses)}")

    return results
