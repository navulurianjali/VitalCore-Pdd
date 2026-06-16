"""
DAST Category 6: Injection Probe (Detection Only)
SQLi / NoSQLi / SSTI / Command injection payloads
in body parameters. Detection criteria:
  - 500 status (server error) → potential injection surface
  - Anomalous response time   → time-based blind SQLi indicator (>5 s)
  - Error keywords in body    → verbose error leakage
"""
import requests, time
from datetime import datetime

SQLI_PAYLOADS = [
    "' OR '1'='1",
    "' OR 1=1 --",
    "'; DROP TABLE users; --",
    "\" OR 1=1 --",
    "1' AND SLEEP(5) --",
    "1; WAITFOR DELAY '0:0:5' --",
]

NOSQLI_PAYLOADS = [
    {"$gt": ""},
    {"$where": "this.password.length > 0"},
    {"$ne": None},
]

SSTI_PAYLOADS = [
    "{{7*7}}",
    "${7*7}",
    "<%= 7*7 %>",
]

CMD_PAYLOADS = [
    "; ls -la",
    "| cat /etc/passwd",
    "`id`",
    "$(whoami)",
]

ERROR_KEYWORDS = [
    "syntax error", "sql", "psql", "postgresql", "mysql", "sqlite",
    "exception", "traceback", "stack trace", "undefined", "cannot",
    "error at", "pg_", "orm", "sequelize", "prisma",
]

def run(base_url, user_token, admin_token):
    results = []

    ENDPOINTS = [
        {"path": "/api/ai-coach",          "method": "POST", "field": "message"},
        {"path": "/api/food-scanner",      "method": "POST", "field": "image"},
        {"path": "/api/nutrition-planner", "method": "POST", "field": "goal"},
    ]

    all_payloads = (
        [("SQLi", p) for p in SQLI_PAYLOADS] +
        [("NoSQLi", str(p)) for p in NOSQLI_PAYLOADS] +
        [("SSTI", p) for p in SSTI_PAYLOADS] +
        [("CmdInj", p) for p in CMD_PAYLOADS]
    )

    headers = {
        "Content-Type":  "application/json",
        "Authorization": f"Bearer {user_token}",
    }

    for ep in ENDPOINTS:
        for inj_type, payload in all_payloads:
            body = {
                "message":    payload,
                "goal":       payload,
                "preference": payload,
                "image":      payload,
                ep["field"]:  payload,
            }

            url = f"{base_url}{ep['path']}"
            t0 = time.time()
            try:
                resp = requests.post(url, headers=headers, json=body, timeout=12, allow_redirects=False)
                status = resp.status_code
                text  = resp.text.lower()
            except Exception as exc:
                status = 0; text = str(exc).lower()
            elapsed = round((time.time() - t0) * 1000, 2)

            error_leak  = any(kw in text for kw in ERROR_KEYWORDS) and status >= 400
            timing_anomaly = elapsed > 4000   # > 4 s = time-based blind indicator
            server_crash   = status >= 500

            finding  = server_crash or error_leak or timing_anomaly
            severity = "High" if server_crash else ("Medium" if error_leak or timing_anomaly else "Info")

            note_parts = []
            if server_crash:    note_parts.append("Server crash (5xx)")
            if error_leak:      note_parts.append("Error keyword in response")
            if timing_anomaly:  note_parts.append(f"Timing anomaly {elapsed}ms")
            if not note_parts:  note_parts.append("No anomaly detected")

            results.append({
                "endpoint": ep["path"], "method": ep["method"],
                "role": "user",
                "status": status, "expected_status": 400,
                "finding": finding, "severity": severity,
                "response_time_ms": elapsed,
                "test_category": "Injection Probe",
                "note": f"{inj_type} | {', '.join(note_parts)} | payload={str(payload)[:40]}",
                "timestamp": datetime.utcnow().isoformat() + "Z",
            })
            marker = "⚠ FINDING" if finding else "✓ pass"
            print(f"  [{marker}] Inject ({inj_type}) | {ep['path']} → {status} {elapsed}ms")
            time.sleep(0.1)

    return results
