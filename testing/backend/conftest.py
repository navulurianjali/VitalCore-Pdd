"""
testing/backend/conftest.py
Shared pytest configuration, HTTP helpers, result recorder, and report
generators for all 300 VitalCore backend API test cases.
Every test calls record() which stores real HTTP outcomes – nothing is mocked.
"""
import json
import os
import sys
import time
import pathlib
from datetime import datetime

import pytest
import requests

# ── Configuration ────────────────────────────────────────────────────────────
BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3000").rstrip("/")
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://bevolemwakfozxuymxsn.supabase.co")
SUPABASE_ANON_KEY = os.environ.get(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldm9sZW13YWtmb3p4dXlteHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTUyNjUsImV4cCI6MjA5NTQ5MTI2NX0.ZRyBiaR7vhG8O2FEdPEQOBErLrSF5AxK_PASy87Odlk"
)
TEST_EMAIL = os.environ.get("TEST_EMAIL", "testuser@vitalcore.ai")
TEST_PASSWORD = os.environ.get("TEST_PASSWORD", "VitalCoreTest123!")

REPORTS_DIR = pathlib.Path(__file__).parent / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# ── Shared result store (module-level, populated across all test files) ───────
_RESULTS: list[dict] = []

# ── HTTP helpers ──────────────────────────────────────────────────────────────
def _post(endpoint: str, payload: dict | None = None, headers: dict | None = None,
          base: str | None = None, timeout: int = 20):
    url_base = base or BASE_URL
    hdrs = {"Content-Type": "application/json"}
    if headers:
        hdrs.update(headers)
    t0 = time.time()
    try:
        r = requests.post(f"{url_base}{endpoint}", json=payload, headers=hdrs, timeout=timeout)
        return r, round(time.time() - t0, 3), ""
    except Exception as exc:
        return None, round(time.time() - t0, 3), str(exc)


def _get(endpoint: str, headers: dict | None = None,
         params: dict | None = None, base: str | None = None, timeout: int = 20):
    url_base = base or BASE_URL
    t0 = time.time()
    try:
        r = requests.get(f"{url_base}{endpoint}", headers=headers or {}, params=params, timeout=timeout)
        return r, round(time.time() - t0, 3), ""
    except Exception as exc:
        return None, round(time.time() - t0, 3), str(exc)


def _patch(endpoint: str, payload: dict | None = None, headers: dict | None = None,
           base: str | None = None, timeout: int = 20):
    url_base = base or BASE_URL
    hdrs = {"Content-Type": "application/json"}
    if headers:
        hdrs.update(headers)
    t0 = time.time()
    try:
        r = requests.patch(f"{url_base}{endpoint}", json=payload, headers=hdrs, timeout=timeout)
        return r, round(time.time() - t0, 3), ""
    except Exception as exc:
        return None, round(time.time() - t0, 3), str(exc)


def _delete(endpoint: str, headers: dict | None = None,
            base: str | None = None, timeout: int = 20):
    url_base = base or BASE_URL
    t0 = time.time()
    try:
        r = requests.delete(f"{url_base}{endpoint}", headers=headers or {}, timeout=timeout)
        return r, round(time.time() - t0, 3), ""
    except Exception as exc:
        return None, round(time.time() - t0, 3), str(exc)


# ── Result recorder ──────────────────────────────────────────────────────────
def record(tid: str, module: str, case: str, endpoint: str, method: str,
           payload, expected_status: int, expected_desc: str,
           resp, elapsed: float, err: str = "",
           preconditions: str = "", steps: str = "") -> bool:
    """Record a real HTTP test result into the shared store. Returns True if PASS."""
    actual_status = resp.status_code if resp else "NO_RESPONSE"
    try:
        actual_body = resp.json() if resp else {}
    except Exception:
        actual_body = {"raw": (resp.text[:400] if resp else "")}

    passed = resp is not None and resp.status_code == expected_status
    _RESULTS.append({
        "Test ID": tid,
        "Module": module,
        "Test Case": case,
        "Preconditions": preconditions or f"App running at {BASE_URL}",
        "Steps": steps or f"{method} {endpoint}",
        "Endpoint": f"{method} {endpoint}",
        "Input": (json.dumps(payload)[:250] if payload is not None else "(none)"),
        "Expected Result": f"HTTP {expected_status} — {expected_desc}",
        "Actual Result": json.dumps(actual_body)[:250],
        "HTTP Status": actual_status,
        "Pass/Fail": "PASS" if passed else "FAIL",
        "Error Details": (err or (f"Expected {expected_status}, got {actual_status}")) if not passed else "",
        "Execution Time (s)": elapsed,
    })
    return passed


# ── pytest fixtures ──────────────────────────────────────────────────────────
@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def supabase_anon_headers():
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
    }


@pytest.fixture(scope="session")
def auth_token(supabase_anon_headers):
    """Obtain a real Supabase auth token for use in authenticated tests."""
    payload = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
    try:
        r = requests.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            json=payload,
            headers={**supabase_anon_headers, "Content-Type": "application/json"},
            timeout=20,
        )
        if r.status_code == 200:
            data = r.json()
            return data.get("access_token", "")
    except Exception:
        pass
    return ""


@pytest.fixture(scope="session")
def auth_headers(auth_token, supabase_anon_headers):
    """Headers with a real authenticated user token."""
    if auth_token:
        return {**supabase_anon_headers, "Authorization": f"Bearer {auth_token}"}
    return supabase_anon_headers


# ── Session finish: generate all reports ────────────────────────────────────
def pytest_sessionfinish(session, exitstatus):
    """After all 300 tests complete, write JSON, HTML, and Excel reports from real results."""
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
        from openpyxl.utils import get_column_letter
        HAS_XLSX = True
    except ImportError:
        HAS_XLSX = False

    # Collect results from all imported test modules
    all_results = list(_RESULTS)
    for name, mod in sys.modules.items():
        if hasattr(mod, "_RESULTS") and mod._RESULTS is not _RESULTS:
            all_results.extend(mod._RESULTS)

    # Deduplicate by Test ID
    seen = set()
    results = []
    for r in all_results:
        if r["Test ID"] not in seen:
            seen.add(r["Test ID"])
            results.append(r)

    total = len(results)
    passed = sum(1 for r in results if r["Pass/Fail"] == "PASS")
    failed = total - passed
    skipped = 0
    pct = round(passed / total * 100, 1) if total > 0 else 0.0
    generated = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

    # JSON
    json_path = REPORTS_DIR / "backend_results.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    # HTML
    rows_html = ""
    for r in results:
        bg = "#d4edda" if r["Pass/Fail"] == "PASS" else "#f8d7da"
        badge_bg = "#28a745" if r["Pass/Fail"] == "PASS" else "#dc3545"
        badge = f'<span style="background:{badge_bg};color:#fff;padding:2px 8px;border-radius:4px;">{r["Pass/Fail"]}</span>'
        rows_html += (
            f'<tr style="background:{bg}">'
            f'<td>{r["Test ID"]}</td><td>{r["Module"]}</td><td>{r["Test Case"]}</td>'
            f'<td style="font-size:11px">{r["Endpoint"]}</td>'
            f'<td style="font-size:10px">{r["Input"]}</td>'
            f'<td style="font-size:10px">{r["Expected Result"]}</td>'
            f'<td style="font-size:10px">{r["Actual Result"]}</td>'
            f'<td>{r["HTTP Status"]}</td><td>{badge}</td>'
            f'<td style="font-size:10px;color:#c00">{r["Error Details"]}</td>'
            f'<td>{r["Execution Time (s)"]}s</td></tr>'
        )
    html = f"""<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>VitalCore Backend Test Report</title>
<style>
body{{font-family:Arial,sans-serif;margin:24px;background:#f5f5f5}}
h1{{color:#1a1a2e}} .summary{{display:flex;gap:12px;margin:16px 0}}
.card{{padding:10px 18px;border-radius:8px;color:#fff;font-size:15px;font-weight:bold}}
table{{border-collapse:collapse;width:100%;background:#fff;font-size:12px}}
th{{background:#1a1a2e;color:#fff;padding:8px;text-align:left}}
td{{border:1px solid #ccc;padding:5px 7px;vertical-align:top}}
</style></head><body>
<h1>VitalCore Backend API Test Report</h1>
<p><strong>Generated:</strong> {generated}</p>
<p><strong>Target:</strong> {BASE_URL}</p>
<div class="summary">
<div class="card" style="background:#1a1a2e">Total: {total}</div>
<div class="card" style="background:#28a745">Passed: {passed}</div>
<div class="card" style="background:#dc3545">Failed: {failed}</div>
<div class="card" style="background:#007bff">Pass Rate: {pct}%</div>
</div>
<table><thead><tr>
<th>Test ID</th><th>Module</th><th>Test Case</th><th>Endpoint</th><th>Input</th>
<th>Expected</th><th>Actual</th><th>HTTP</th><th>Result</th><th>Error</th><th>Time</th>
</tr></thead><tbody>{rows_html}</tbody></table>
</body></html>"""
    html_path = REPORTS_DIR / "backend_results.html"
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)

    # Excel
    if HAS_XLSX:
        thin = Border(left=Side(style="thin"), right=Side(style="thin"),
                      top=Side(style="thin"), bottom=Side(style="thin"))
        hdr_font = Font(bold=True, color="FFFFFF", size=11)
        hdr_fill = PatternFill("solid", fgColor="1A1A2E")

        wb = Workbook()
        # Summary sheet
        ws = wb.active
        ws.title = "Summary"
        ws.append(["VitalCore Backend API Test Report"])
        ws.append(["Generated", generated])
        ws.append(["Target URL", BASE_URL])
        ws.append([])
        ws.append(["Metric", "Value"])
        ws.append(["Total Test Cases", total])
        ws.append(["Actually Executed", total])
        ws.append(["Passed", passed])
        ws.append(["Failed", failed])
        ws.append(["Skipped", skipped])
        ws.append(["Pass Percentage", f"{pct}%"])
        ws.append(["Fail Percentage", f"{round(100-pct,1)}%"])
        ws["A1"].font = Font(bold=True, size=14)
        for cell in ws[5]:
            cell.font = hdr_font; cell.fill = hdr_fill
        ws.column_dimensions["A"].width = 25
        ws.column_dimensions["B"].width = 40

        # Detailed Results sheet
        ws2 = wb.create_sheet("Detailed Results")
        cols = ["Test ID", "Module", "Test Case", "Preconditions", "Steps",
                "Endpoint", "Input", "Expected Result", "Actual Result",
                "HTTP Status", "Pass/Fail", "Error Details", "Execution Time (s)"]
        ws2.append(cols)
        for cell in ws2[1]:
            cell.font = hdr_font; cell.fill = hdr_fill
            cell.alignment = Alignment(horizontal="center", wrap_text=True)
            cell.border = thin
        for rec in results:
            ws2.append([rec.get(c, "") for c in cols])
            rn = ws2.max_row
            fill_color = "D4EDDA" if rec["Pass/Fail"] == "PASS" else "F8D7DA"
            rf = PatternFill("solid", fgColor=fill_color)
            for ci in range(1, len(cols) + 1):
                cell = ws2.cell(row=rn, column=ci)
                cell.fill = rf; cell.border = thin
                cell.alignment = Alignment(wrap_text=True, vertical="top")
        col_widths = [10, 18, 40, 28, 28, 28, 22, 28, 28, 12, 10, 28, 14]
        for i, w in enumerate(col_widths, 1):
            ws2.column_dimensions[get_column_letter(i)].width = w

        xlsx_path = REPORTS_DIR / "backend_results.xlsx"
        wb.save(xlsx_path)
        print(f"\n[BACKEND] Excel → {xlsx_path}")

    print(f"\n{'='*60}")
    print("  VitalCore Backend Test Summary  (300 test target)")
    print(f"{'='*60}")
    print(f"  Total    : {total}")
    print(f"  Passed   : {passed}")
    print(f"  Failed   : {failed}")
    print(f"  Pass Rate: {pct}%")
    print(f"{'='*60}\n")
