"""
VitalCore Expo - API Load Test (Backend Layer)
==============================================
Tests Supabase + Vercel API endpoints with 100 virtual users for 60 seconds.
No device needed - pure HTTP concurrency test.

Usage:
    python api_load_test.py
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import time
import json
import threading
import statistics
import sys
from datetime import datetime
from collections import defaultdict

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

import config


# ─────────────────────────────────────────────────────────────────────────────
# Thread-safe metrics store
# ─────────────────────────────────────────────────────────────────────────────
class MetricsStore:
    def __init__(self):
        self._lock        = threading.Lock()
        self.results      = defaultdict(list)   # endpoint -> [response_time_ms, ...]
        self.errors       = defaultdict(int)    # endpoint -> error_count
        self.status_codes = defaultdict(lambda: defaultdict(int))  # endpoint -> {code: count}
        self.total_requests = 0
        self.start_time   = None
        self.end_time     = None

    def record(self, endpoint_label: str, response_time_ms: float, status_code: int):
        with self._lock:
            self.results[endpoint_label].append(response_time_ms)
            self.status_codes[endpoint_label][status_code] += 1
            self.total_requests += 1

    def record_error(self, endpoint_label: str):
        with self._lock:
            self.errors[endpoint_label] += 1
            self.total_requests += 1

    def rps(self) -> float:
        elapsed = (self.end_time or time.monotonic()) - (self.start_time or time.monotonic())
        return self.total_requests / elapsed if elapsed > 0 else 0.0


metrics = MetricsStore()


# ─────────────────────────────────────────────────────────────────────────────
# HTTP session factory (per-thread, connection pooled)
# ─────────────────────────────────────────────────────────────────────────────
def make_session() -> requests.Session:
    session = requests.Session()
    retry   = Retry(total=0)   # no retries – we want to measure real failures
    adapter = HTTPAdapter(max_retries=retry, pool_connections=10, pool_maxsize=50)
    session.mount("https://", adapter)
    session.mount("http://",  adapter)
    return session


# ─────────────────────────────────────────────────────────────────────────────
# Worker: hammers all endpoints round-robin for TEST_DURATION_S
# ─────────────────────────────────────────────────────────────────────────────
def virtual_user_worker(user_id: int, stop_event: threading.Event):
    """One virtual user – loops until stop_event is set."""
    session   = make_session()
    endpoints = config.SUPABASE_ENDPOINTS + config.VERCEL_ENDPOINTS

    # stagger the ramp-up
    ramp_delay = (user_id / config.VIRTUAL_USERS) * config.RAMP_UP_S
    time.sleep(ramp_delay)

    endpoint_idx = user_id % len(endpoints)   # each user starts at a different endpoint

    while not stop_event.is_set():
        label, method, url, body = endpoints[endpoint_idx % len(endpoints)]
        endpoint_idx += 1

        try:
            t0 = time.monotonic()
            if method == "GET":
                resp = session.get(
                    url,
                    headers=config.SUPABASE_HEADERS,
                    timeout=10,
                )
            else:
                resp = session.post(
                    url,
                    headers=config.SUPABASE_HEADERS,
                    json=body,
                    timeout=10,
                )
            elapsed_ms = (time.monotonic() - t0) * 1000
            metrics.record(label, elapsed_ms, resp.status_code)

        except Exception:
            metrics.record_error(label)


# ─────────────────────────────────────────────────────────────────────────────
# Report generation
# ─────────────────────────────────────────────────────────────────────────────
def percentile(data: list, pct: float) -> float:
    if not data:
        return 0.0
    sorted_data = sorted(data)
    k = (len(sorted_data) - 1) * pct / 100
    f = int(k)
    c = f + 1 if f + 1 < len(sorted_data) else f
    return sorted_data[f] + (sorted_data[c] - sorted_data[f]) * (k - f)


def build_report(duration_actual: float) -> dict:
    report = {
        "test_name":        "VitalCore Expo – API Baseline / Load Test",
        "timestamp":        datetime.now().isoformat(),
        "virtual_users":    config.VIRTUAL_USERS,
        "duration_s":       round(duration_actual, 2),
        "total_requests":   metrics.total_requests,
        "rps":              round(metrics.rps(), 2),
        "endpoints":        [],
    }

    all_times = []
    for endpoint_label in sorted(metrics.results.keys()):
        times = metrics.results[endpoint_label]
        all_times.extend(times)
        errors = metrics.errors.get(endpoint_label, 0)
        codes  = dict(metrics.status_codes[endpoint_label])
        total  = len(times) + errors
        entry  = {
            "endpoint":       endpoint_label.strip(),
            "total_calls":    total,
            "errors":         errors,
            "success_rate_%": round((len(times) / total * 100) if total else 0, 2),
            "avg_ms":         round(statistics.mean(times), 2)   if times else 0,
            "min_ms":         round(min(times), 2)               if times else 0,
            "max_ms":         round(max(times), 2)               if times else 0,
            "p50_ms":         round(percentile(times, 50), 2)    if times else 0,
            "p90_ms":         round(percentile(times, 90), 2)    if times else 0,
            "p95_ms":         round(percentile(times, 95), 2)    if times else 0,
            "p99_ms":         round(percentile(times, 99), 2)    if times else 0,
            "status_codes":   codes,
        }
        report["endpoints"].append(entry)

    if all_times:
        report["overall"] = {
            "avg_ms": round(statistics.mean(all_times), 2),
            "min_ms": round(min(all_times), 2),
            "max_ms": round(max(all_times), 2),
            "p50_ms": round(percentile(all_times, 50), 2),
            "p90_ms": round(percentile(all_times, 90), 2),
            "p95_ms": round(percentile(all_times, 95), 2),
            "p99_ms": round(percentile(all_times, 99), 2),
        }
    return report


def print_report(report: dict):
    sep  = "=" * 72
    sep2 = "-" * 72

    print(f"\n{sep}")
    print(f"  VitalCore Expo  ·  API Baseline / Load Test Report")
    print(f"{sep}")
    print(f"  Timestamp      : {report['timestamp']}")
    print(f"  Virtual Users  : {report['virtual_users']}")
    print(f"  Duration       : {report['duration_s']} s")
    print(f"  Total Requests : {report['total_requests']:,}")
    print(f"  Overall RPS    : {report['rps']} req/s")
    print(f"{sep}")

    if "overall" in report:
        o = report["overall"]
        print(f"\n  ── OVERALL RESPONSE TIMES ──────────────────────────────────────")
        print(f"  Avg   : {o['avg_ms']} ms    Min : {o['min_ms']} ms    Max : {o['max_ms']} ms")
        print(f"  P50   : {o['p50_ms']} ms    P90 : {o['p90_ms']} ms")
        print(f"  P95   : {o['p95_ms']} ms    P99 : {o['p99_ms']} ms")

    print(f"\n{sep}")
    print(f"  ── PER-ENDPOINT BREAKDOWN ──────────────────────────────────────")
    print(f"{sep}")
    for ep in report["endpoints"]:
        print(f"\n  Endpoint   : {ep['endpoint']}")
        print(f"  Calls      : {ep['total_calls']:,}   Errors: {ep['errors']}   "
              f"Success: {ep['success_rate_%']}%")
        print(f"  Avg: {ep['avg_ms']} ms  |  Min: {ep['min_ms']} ms  |  Max: {ep['max_ms']} ms")
        print(f"  P50: {ep['p50_ms']} ms  |  P90: {ep['p90_ms']} ms  |  "
              f"P95: {ep['p95_ms']} ms  |  P99: {ep['p99_ms']} ms")
        code_str = "  ".join(f"HTTP {k}: {v}" for k, v in sorted(ep["status_codes"].items()))
        print(f"  Status Codes: {code_str}")
        print(f"  {sep2}")

    print(f"\n  Reports saved -> {config.REPORT_FILE}  &  {config.REPORT_JSON}\n")


# ─────────────────────────────────────────────────────────────────────────────
# Main runner
# ─────────────────────────────────────────────────────────────────────────────
def run():
    print(f"\n{'='*60}")
    print(f"  VitalCore Expo – API Load Test")
    print(f"  Virtual Users : {config.VIRTUAL_USERS}")
    print(f"  Duration      : {config.TEST_DURATION_S}s")
    print(f"  Ramp-Up       : {config.RAMP_UP_S}s")
    print(f"{'='*60}\n")

    stop_event = threading.Event()
    threads    = []

    print(f"  [--> ] Spawning {config.VIRTUAL_USERS} virtual user threads...")
    metrics.start_time = time.monotonic()

    for i in range(config.VIRTUAL_USERS):
        t = threading.Thread(
            target=virtual_user_worker,
            args=(i, stop_event),
            daemon=True,
        )
        t.start()
        threads.append(t)

    # Live progress every 10s
    elapsed = 0
    interval = 10
    while elapsed < config.TEST_DURATION_S:
        time.sleep(interval)
        elapsed += interval
        snap_rps = metrics.rps()
        print(f"  [{elapsed:>3}s] Requests so far: {metrics.total_requests:,}  |  RPS ≈ {snap_rps:.1f}")

    stop_event.set()
    metrics.end_time = time.monotonic()
    duration_actual  = metrics.end_time - metrics.start_time

    print(f"\n  [OK] Test complete. Joining threads...")
    for t in threads:
        t.join(timeout=2)

    # Build and print report
    report = build_report(duration_actual)
    print_report(report)

    # Save text report
    import io, contextlib
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        print_report(report)
    with open(config.REPORT_FILE, "w", encoding="utf-8") as f:
        f.write(buf.getvalue())

    # Save JSON report
    with open(config.REPORT_JSON, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)


if __name__ == "__main__":
    run()
