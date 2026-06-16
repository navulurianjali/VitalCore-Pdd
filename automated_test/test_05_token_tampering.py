"""
DAST Category 5: JWT Token Tampering
Tests:
  1. Flip role claim (user → admin) without re-signing   → server must REJECT
  2. Change algorithm to 'none' (alg=none attack)        → server must REJECT
  3. Truncated/corrupt signature                         → server must REJECT
  4. Inject extra claims (is_admin: true)                → server must REJECT
2xx = FINDING (server accepted tampered token)
"""
import base64, json, requests, time
from datetime import datetime

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def _b64url_decode_segment(seg: str) -> dict:
    seg += "=" * (4 - len(seg) % 4)
    return json.loads(base64.urlsafe_b64decode(seg))

def _forge_token(header_dict: dict, payload_dict: dict, fake_sig: str = "FAKESIG") -> str:
    h = _b64url_encode(json.dumps(header_dict).encode())
    p = _b64url_encode(json.dumps(payload_dict).encode())
    return f"{h}.{p}.{fake_sig}"

def run(base_url, user_token, admin_token):
    results = []

    PROTECTED_API = [
        {"path": "/api/ai-coach",          "method": "POST"},
        {"path": "/api/food-scanner",      "method": "POST"},
        {"path": "/api/nutrition-planner", "method": "POST"},
    ]

    # Build tampered token variants
    TAMPERED = [
        # 1. Role flip: claim admin without valid signature
        ("role_flip_admin", _forge_token(
            {"alg": "HS256", "typ": "JWT"},
            {"sub": "attacker-uid", "email": "attacker@evil.com",
             "role": "admin", "exp": 9999999999}
        )),
        # 2. Algorithm confusion (none)
        ("alg_none", _forge_token(
            {"alg": "none", "typ": "JWT"},
            {"sub": "attacker-uid", "role": "service_role", "exp": 9999999999},
            ""  # empty signature
        )),
        # 3. Corrupt signature (valid structure, wrong sig)
        ("corrupt_sig", _forge_token(
            {"alg": "HS256", "typ": "JWT"},
            {"sub": "legit-uid", "role": "authenticated", "exp": 9999999999},
            "CORRUPTEDSIGNATUREXXXXXXXX"
        )),
        # 4. Extra claim injection
        ("claim_inject", _forge_token(
            {"alg": "HS256", "typ": "JWT"},
            {"sub": "uid-123", "role": "user", "is_admin": True,
             "superuser": True, "exp": 9999999999}
        )),
    ]

    for ep in PROTECTED_API:
        for tamper_label, tampered_tok in TAMPERED:
            headers = {
                "Content-Type":  "application/json",
                "Authorization": f"Bearer {tampered_tok}",
            }
            body = {"message": "tamper test", "goal": "health",
                    "preference": "General", "image": ""}

            url = f"{base_url}{ep['path']}"
            t0 = time.time()
            try:
                resp = requests.post(url, headers=headers, json=body, timeout=10, allow_redirects=False)
                status = resp.status_code
                snippet = resp.text[:150]
            except Exception as exc:
                status = 0; snippet = str(exc)
            elapsed = round((time.time() - t0) * 1000, 2)

            finding = status in (200, 201)
            results.append({
                "endpoint": ep["path"], "method": ep["method"],
                "role": tamper_label,
                "status": status, "expected_status": 401,
                "finding": finding,
                "severity": "Critical" if finding else "Info",
                "response_time_ms": elapsed,
                "test_category": "Token Tampering",
                "note": f"Tamper={tamper_label}. Resp: {snippet[:80]}",
                "timestamp": datetime.utcnow().isoformat() + "Z",
            })
            marker = "✗ FINDING" if finding else "✓ pass"
            print(f"  [{marker}] Token Tamper ({tamper_label}) | {ep['path']} → {status}")
            time.sleep(0.12)

    return results
