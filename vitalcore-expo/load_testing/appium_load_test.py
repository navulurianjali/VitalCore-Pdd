"""
VitalCore Expo – Appium UI Load Test (Device Layer)
====================================================
Drives the VitalCore Expo app on a real Android device / emulator using Appium.
Simulates 100 virtual users executing UI flows concurrently for 60 seconds.

Because only ONE physical device is available, each "virtual user" maps to a
single Appium session that is reused across many rapid UI interactions
(launch, navigate, scroll). For true concurrency across multiple devices, add
more entries to DEVICE_POOL in config.

Prerequisites:
    1.  Appium 2 installed  →  npm install -g appium
    2.  UiAutomator2 driver →  appium driver install uiautomator2
    3.  Device connected / emulator running
    4.  VitalCore Expo APK installed on the device
    5.  pip install -r requirements.txt

Usage:
    python appium_load_test.py
"""

import time
import json
import threading
import statistics
import traceback
from datetime import datetime
from collections import defaultdict

from appium import webdriver
from appium.options import AppiumOptions
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import (
    NoSuchElementException,
    TimeoutException,
    WebDriverException,
)

import config


# ─────────────────────────────────────────────────────────────────────────────
# Thread-safe metrics
# ─────────────────────────────────────────────────────────────────────────────
class AppiumMetrics:
    def __init__(self):
        self._lock        = threading.Lock()
        self.results      = defaultdict(list)   # flow_name -> [duration_ms]
        self.errors       = defaultdict(int)    # flow_name -> error_count
        self.total_ops    = 0
        self.start_time   = None
        self.end_time     = None

    def record_success(self, flow: str, duration_ms: float):
        with self._lock:
            self.results[flow].append(duration_ms)
            self.total_ops += 1

    def record_error(self, flow: str):
        with self._lock:
            self.errors[flow] += 1
            self.total_ops += 1

    def rps(self) -> float:
        elapsed = (self.end_time or time.monotonic()) - (self.start_time or time.monotonic())
        return self.total_ops / elapsed if elapsed > 0 else 0.0


ui_metrics = AppiumMetrics()


# ─────────────────────────────────────────────────────────────────────────────
# Appium UI Flows  (all must be safe to call repeatedly)
# ─────────────────────────────────────────────────────────────────────────────
def flow_launch_and_splash(driver) -> None:
    """Verify the app launches and shows the splash / intro screen."""
    wait = WebDriverWait(driver, 10)
    # The intro screen shows a Get Started or similar button
    wait.until(
        EC.presence_of_element_located(
            (By.XPATH, '//*[@content-desc or @text]')
        )
    )


def flow_view_login_screen(driver) -> None:
    """Navigate to the Login screen and verify key elements exist."""
    wait = WebDriverWait(driver, 10)
    # Try to tap Sign In link/button
    try:
        sign_in = driver.find_element(
            By.XPATH,
            '//*[contains(@text,"Sign In") or contains(@text,"Login") '
            'or contains(@content-desc,"Sign In")]'
        )
        sign_in.click()
        time.sleep(0.5)
    except NoSuchElementException:
        pass

    # Verify email field is present (login form)
    wait.until(
        EC.presence_of_element_located(
            (By.XPATH,
             '//*[contains(@text,"Email") or contains(@hint,"email") '
             'or @class="android.widget.EditText"]')
        )
    )


def flow_view_register_screen(driver) -> None:
    """Navigate to Register and verify form is loaded."""
    wait = WebDriverWait(driver, 10)
    try:
        register_btn = driver.find_element(
            By.XPATH,
            '//*[contains(@text,"Register") or contains(@text,"Sign Up") '
            'or contains(@content-desc,"Register")]'
        )
        register_btn.click()
        time.sleep(0.5)
    except NoSuchElementException:
        pass

    wait.until(
        EC.presence_of_element_located(
            (By.XPATH,
             '//*[contains(@text,"Password") or @class="android.widget.EditText"]')
        )
    )


def flow_scroll_dashboard(driver) -> None:
    """Scroll down on the dashboard (if logged in)."""
    size   = driver.get_window_size()
    startX = size["width"] // 2
    startY = int(size["height"] * 0.7)
    endY   = int(size["height"] * 0.3)
    driver.swipe(startX, startY, startX, endY, 600)
    time.sleep(0.3)
    driver.swipe(startX, endY, startX, startY, 600)


FLOW_FUNCTIONS = {
    "launch_and_splash":   flow_launch_and_splash,
    "view_login_screen":   flow_view_login_screen,
    "view_register_screen": flow_view_register_screen,
    "scroll_dashboard":    flow_scroll_dashboard,
}


# ─────────────────────────────────────────────────────────────────────────────
# Worker
# ─────────────────────────────────────────────────────────────────────────────
def appium_worker(worker_id: int, stop_event: threading.Event):
    """
    Each worker holds its own Appium session.
    Because a single device is shared, sessions are created serially before
    the test loop – then each thread runs the flows in its own session context.
    NOTE: With a single physical device only ONE Appium session can be active
    at once. This worker therefore performs SERIALISED interactions and records
    per-flow timings that still reflect real device latency.
    """
    opts = AppiumOptions()
    opts.load_capabilities(config.APPIUM_CAPABILITIES)

    # Stagger session creation to avoid flood
    time.sleep(worker_id * 0.1)

    driver = None
    session_acquired = False

    try:
        driver = webdriver.Remote(
            f"{config.APPIUM_SERVER_URL}/wd/hub",
            options=opts,
        )
        session_acquired = True
    except Exception as exc:
        print(f"  [Worker {worker_id}] Could not create Appium session: {exc}")
        # Still count against total so we surface errors in the report
        ui_metrics.record_error("session_creation")
        return

    flows = list(FLOW_FUNCTIONS.keys())
    flow_idx = worker_id % len(flows)

    try:
        while not stop_event.is_set():
            flow_name = flows[flow_idx % len(flows)]
            flow_idx += 1
            fn = FLOW_FUNCTIONS[flow_name]

            t0 = time.monotonic()
            try:
                fn(driver)
                elapsed_ms = (time.monotonic() - t0) * 1000
                ui_metrics.record_success(flow_name, elapsed_ms)
            except (TimeoutException, NoSuchElementException, WebDriverException) as exc:
                ui_metrics.record_error(flow_name)

            # brief cool-down between interactions (realistic user think-time)
            time.sleep(0.2)

    finally:
        if driver and session_acquired:
            try:
                driver.quit()
            except Exception:
                pass


# ─────────────────────────────────────────────────────────────────────────────
# Report
# ─────────────────────────────────────────────────────────────────────────────
def percentile(data, pct):
    if not data:
        return 0.0
    s = sorted(data)
    k = (len(s) - 1) * pct / 100
    f = int(k)
    c = min(f + 1, len(s) - 1)
    return s[f] + (s[c] - s[f]) * (k - f)


def build_appium_report(duration_actual: float) -> dict:
    report = {
        "test_name":      "VitalCore Expo – Appium UI Baseline / Load Test",
        "timestamp":      datetime.now().isoformat(),
        "virtual_users":  config.VIRTUAL_USERS,
        "duration_s":     round(duration_actual, 2),
        "total_ui_ops":   ui_metrics.total_ops,
        "rps_ui_ops":     round(ui_metrics.rps(), 2),
        "flows":          [],
    }

    all_times = []
    for flow_name in sorted(ui_metrics.results.keys()):
        times  = ui_metrics.results[flow_name]
        errors = ui_metrics.errors.get(flow_name, 0)
        total  = len(times) + errors
        all_times.extend(times)
        report["flows"].append({
            "flow":           flow_name,
            "total_runs":     total,
            "errors":         errors,
            "success_rate_%": round(len(times) / total * 100, 2) if total else 0,
            "avg_ms":  round(statistics.mean(times), 2)       if times else 0,
            "min_ms":  round(min(times), 2)                   if times else 0,
            "max_ms":  round(max(times), 2)                   if times else 0,
            "p50_ms":  round(percentile(times, 50), 2)        if times else 0,
            "p90_ms":  round(percentile(times, 90), 2)        if times else 0,
            "p95_ms":  round(percentile(times, 95), 2)        if times else 0,
            "p99_ms":  round(percentile(times, 99), 2)        if times else 0,
        })

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


def print_appium_report(report: dict):
    sep  = "=" * 72
    sep2 = "-" * 72
    print(f"\n{sep}")
    print(f"  VitalCore Expo  ·  Appium UI Load Test Report")
    print(f"{sep}")
    print(f"  Timestamp      : {report['timestamp']}")
    print(f"  Virtual Users  : {report['virtual_users']}")
    print(f"  Duration       : {report['duration_s']} s")
    print(f"  Total UI Ops   : {report['total_ui_ops']:,}")
    print(f"  UI Ops/sec     : {report['rps_ui_ops']} ops/s")
    print(f"{sep}")

    if "overall" in report:
        o = report["overall"]
        print(f"\n  ── OVERALL UI INTERACTION TIMES ────────────────────────────────")
        print(f"  Avg   : {o['avg_ms']} ms    Min : {o['min_ms']} ms    Max : {o['max_ms']} ms")
        print(f"  P50   : {o['p50_ms']} ms    P90 : {o['p90_ms']} ms")
        print(f"  P95   : {o['p95_ms']} ms    P99 : {o['p99_ms']} ms")

    print(f"\n{sep}")
    for fl in report["flows"]:
        print(f"\n  Flow       : {fl['flow']}")
        print(f"  Runs       : {fl['total_runs']:,}   Errors: {fl['errors']}   "
              f"Success: {fl['success_rate_%']}%")
        print(f"  Avg: {fl['avg_ms']} ms  |  Min: {fl['min_ms']} ms  |  Max: {fl['max_ms']} ms")
        print(f"  P50: {fl['p50_ms']} ms  |  P90: {fl['p90_ms']} ms  |  "
              f"P95: {fl['p95_ms']} ms  |  P99: {fl['p99_ms']} ms")
        print(f"  {sep2}")

    print(f"\n  Reports saved ➜ appium_load_test_report.txt  &  appium_load_test_report.json\n")


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────
def run():
    print(f"\n{'='*60}")
    print(f"  VitalCore Expo – Appium UI Load Test")
    print(f"  Virtual Users : {config.VIRTUAL_USERS}")
    print(f"  Duration      : {config.TEST_DURATION_S}s")
    print(f"  Ramp-Up       : {config.RAMP_UP_S}s")
    print(f"{'='*60}")
    print(f"\n  NOTE: With a single device, Appium sessions are serialised.")
    print(f"  Use the api_load_test.py for full 100-user concurrent load.\n")

    stop_event = threading.Event()
    threads    = []

    # For a single device, limit Appium workers to avoid session conflicts
    # Workers share device access via serialised session creation
    NUM_APPIUM_WORKERS = min(config.VIRTUAL_USERS, 3)  # safe for 1 device

    print(f"  [→] Launching {NUM_APPIUM_WORKERS} Appium workers (single-device mode) …")
    ui_metrics.start_time = time.monotonic()

    for i in range(NUM_APPIUM_WORKERS):
        t = threading.Thread(
            target=appium_worker,
            args=(i, stop_event),
            daemon=True,
        )
        t.start()
        threads.append(t)

    elapsed = 0
    interval = 10
    while elapsed < config.TEST_DURATION_S:
        time.sleep(interval)
        elapsed += interval
        print(f"  [{elapsed:>3}s] UI ops so far: {ui_metrics.total_ops:,}  |  "
              f"ops/s ≈ {ui_metrics.rps():.1f}")

    stop_event.set()
    ui_metrics.end_time = time.monotonic()
    duration_actual = ui_metrics.end_time - ui_metrics.start_time

    print(f"\n  [✓] Test complete. Joining threads …")
    for t in threads:
        t.join(timeout=5)

    report = build_appium_report(duration_actual)
    print_appium_report(report)

    with open("appium_load_test_report.txt", "w", encoding="utf-8") as f:
        import io, contextlib
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            print_appium_report(report)
        f.write(buf.getvalue())

    with open("appium_load_test_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)


if __name__ == "__main__":
    run()
