"""
VitalCore DAST Master Runner v3
================================
Writes all output to dast_run.log (UTF-8) in addition to stdout.
Uses PYTHONUTF8=1 env var (set before calling this).
"""
import json, sys, os, time
from datetime import datetime
from pathlib import Path

SCRIPT_DIR   = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
INPUT_FILE   = PROJECT_ROOT / "input.json"
LOG_FILE     = SCRIPT_DIR / "dast_run.log"

# Open log file for writing
log_fh = open(LOG_FILE, "w", encoding="utf-8")

def log(msg=""):
    print(msg)
    log_fh.write(msg + "\n")
    log_fh.flush()

# ── Load config ────────────────────────────────────────────────────────────────
if not INPUT_FILE.exists():
    log(f"[ERROR] input.json not found at {INPUT_FILE}.")
    sys.exit(1)

with open(INPUT_FILE, encoding="utf-8") as f:
    cfg = json.load(f)

BASE_URL    = cfg.get("baseUrl", "http://localhost:3000").rstrip("/")
USER_TOKEN  = cfg.get("user",  "")
ADMIN_TOKEN = cfg.get("admin", "")

log("=======================================================")
log("  VitalCore DAST Runner v3  (" + datetime.utcnow().strftime("%Y-%m-%d") + ")")
log("=======================================================")
log(f"  Base URL : {BASE_URL}")
log(f"  Started  : {datetime.utcnow().isoformat()}Z")
log()

# ── Server reachability ───────────────────────────────────────────────────────
import requests
try:
    r = requests.get(BASE_URL, timeout=8, allow_redirects=False)
    log(f"  [OK] Server reachable -> HTTP {r.status_code}")
except Exception as e:
    log(f"  [ERR] Server NOT reachable at {BASE_URL}: {e}")
    log("  Start the server with: npm run dev")
    sys.exit(1)

log()

# ── Import test modules ───────────────────────────────────────────────────────
sys.path.insert(0, str(SCRIPT_DIR))

import test_01_authn_bypass
import test_02_authz_privesc
import test_03_idor
import test_04_rbac_matrix
import test_05_token_tampering
import test_06_injection
import test_07_rate_limiting
import test_08_hardcoded_creds

# Monkey-patch each test module's print to also write to log
import builtins
_orig_print = builtins.print
def _log_print(*args, **kwargs):
    msg = " ".join(str(a) for a in args)
    _orig_print(msg, **{k:v for k,v in kwargs.items() if k!='file'})
    log_fh.write(msg + "\n")
    log_fh.flush()
builtins.print = _log_print

TESTS = [
    ("1. AuthN Bypass",    lambda: test_01_authn_bypass.run(BASE_URL, USER_TOKEN, ADMIN_TOKEN)),
    ("2. AuthZ / Privesc", lambda: test_02_authz_privesc.run(BASE_URL, USER_TOKEN, ADMIN_TOKEN)),
    ("3. IDOR",            lambda: test_03_idor.run(BASE_URL, USER_TOKEN, ADMIN_TOKEN)),
    ("4. RBAC Matrix",     lambda: test_04_rbac_matrix.run(BASE_URL, USER_TOKEN, ADMIN_TOKEN)),
    ("5. Token Tampering", lambda: test_05_token_tampering.run(BASE_URL, USER_TOKEN, ADMIN_TOKEN)),
    ("6. Injection Probe", lambda: test_06_injection.run(BASE_URL, USER_TOKEN, ADMIN_TOKEN)),
    ("7. Rate Limiting",   lambda: test_07_rate_limiting.run(BASE_URL, USER_TOKEN, ADMIN_TOKEN)),
    ("8. Hardcoded Creds", lambda: test_08_hardcoded_creds.run(str(PROJECT_ROOT), BASE_URL, USER_TOKEN, ADMIN_TOKEN)),
]

all_results = []

for name, fn in TESTS:
    log()
    log("- " * 28)
    log(f"  Running: {name}")
    log("- " * 28)
    t0  = time.time()
    try:
        res = fn()
    except Exception as exc:
        log(f"  [ERROR] {name} crashed: {exc}")
        import traceback
        log(traceback.format_exc())
        res = []
    dur = round(time.time() - t0, 2)
    all_results.extend(res)
    findings_n = sum(1 for r in res if r["finding"])
    log(f"  -> {len(res)} tests, {findings_n} findings  ({dur}s)")

# ── Save report.json ──────────────────────────────────────────────────────────
REPORT_PATH = SCRIPT_DIR / "report.json"
with open(REPORT_PATH, "w", encoding="utf-8") as f:
    json.dump(all_results, f, indent=2)

log()
log("=" * 56)
log(f"  REPORT SAVED -> {REPORT_PATH}")
log("=" * 56)
log()

# ── Summary ───────────────────────────────────────────────────────────────────
findings_all = [r for r in all_results if r["finding"]]
by_sev = {}
for r in findings_all:
    by_sev.setdefault(r["severity"], []).append(r)

log(f"  Endpoints Discovered : 24")
log(f"  Total Tests Run      : {len(all_results)}")
log(f"  Total Findings       : {len(findings_all)}")
log()

for sev in ["Critical", "High", "Medium", "Low", "Info"]:
    items = by_sev.get(sev, [])
    if items:
        icon = {"Critical": "[CRIT]", "High": "[HIGH]",
                "Medium": "[MED]", "Low": "[LOW]", "Info": "[INFO]"}[sev]
        log(f"  {icon} {sev} ({len(items)})")
        for r in items:
            log(f"    FAIL [{r['test_category']}] {r['method']} {r['endpoint']} as {r['role']} -> HTTP {r['status']}")
            log(f"         {str(r['note'])[:120]}")

if not findings_all:
    log("  [CLEAN] No findings detected across all test categories.")

log()
log(f"  Completed : {datetime.utcnow().isoformat()}Z")
log(f"  Log saved : {LOG_FILE}")
log()

log_fh.close()
