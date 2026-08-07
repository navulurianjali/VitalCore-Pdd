"""
VitalCore Expo – Combined Load Test Runner
==========================================
Runs BOTH the API load test (100 virtual users) AND the Appium UI test
simultaneously, then merges results into a single unified report.

Usage:
    python run_all_tests.py
"""

import threading
import json
import time
from datetime import datetime

# ── Import the two test modules ───────────────────────────────────────────────
import api_load_test
import appium_load_test
import config


def run_api_test_thread():
    """Run the API load test in a background thread."""
    api_load_test.run()


def run_appium_test_thread():
    """Run the Appium UI test in a background thread."""
    appium_load_test.run()


def merge_reports(api_json: str, appium_json: str) -> dict:
    """Merge JSON reports from both test runs into one unified report."""
    try:
        with open(api_json, "r") as f:
            api_data = json.load(f)
    except FileNotFoundError:
        api_data = {}

    try:
        with open(appium_json, "r") as f:
            appium_data = json.load(f)
    except FileNotFoundError:
        appium_data = {}

    return {
        "test_suite":   "VitalCore Expo – Full Baseline / Load Test",
        "timestamp":    datetime.now().isoformat(),
        "api_results":  api_data,
        "ui_results":   appium_data,
    }


def main():
    sep = "=" * 72
    print(f"\n{sep}")
    print(f"  VitalCore Expo  ·  FULL Load Test Suite")
    print(f"  [ API layer + Appium UI layer running simultaneously ]")
    print(f"{sep}\n")

    # Run both test suites concurrently
    api_thread    = threading.Thread(target=run_api_test_thread,    daemon=False)
    appium_thread = threading.Thread(target=run_appium_test_thread, daemon=False)

    print("  [→] Starting API load test (100 virtual users) …")
    api_thread.start()

    print("  [→] Starting Appium UI test (single-device mode) …\n")
    appium_thread.start()

    api_thread.join()
    appium_thread.join()

    print(f"\n{sep}")
    print(f"  [✓] Both test suites complete. Merging reports …")

    merged = merge_reports(config.REPORT_JSON, "appium_load_test_report.json")
    merged_path = "load_test_merged_report.json"
    with open(merged_path, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2)

    print(f"\n  ═══════════════════════════════════════════════════════════════")
    print(f"  REPORT SUMMARY")
    print(f"  ═══════════════════════════════════════════════════════════════")

    if merged.get("api_results"):
        api = merged["api_results"]
        print(f"\n  ── API Layer ────────────────────────────────────────────────")
        print(f"  Total Requests  : {api.get('total_requests', 0):,}")
        print(f"  RPS             : {api.get('rps', 0)} req/s")
        if "overall" in api:
            o = api["overall"]
            print(f"  Avg Response    : {o['avg_ms']} ms")
            print(f"  Min Response    : {o['min_ms']} ms")
            print(f"  Max Response    : {o['max_ms']} ms")
            print(f"  P95             : {o['p95_ms']} ms")

    if merged.get("ui_results"):
        ui = merged["ui_results"]
        print(f"\n  ── Appium UI Layer ──────────────────────────────────────────")
        print(f"  Total UI Ops    : {ui.get('total_ui_ops', 0):,}")
        print(f"  UI Ops/sec      : {ui.get('rps_ui_ops', 0)} ops/s")
        if "overall" in ui:
            o = ui["overall"]
            print(f"  Avg Interaction : {o['avg_ms']} ms")
            print(f"  Min Interaction : {o['min_ms']} ms")
            print(f"  Max Interaction : {o['max_ms']} ms")
            print(f"  P95             : {o['p95_ms']} ms")

    print(f"\n  Merged report saved ➜ {merged_path}")
    print(f"  {sep}\n")


if __name__ == "__main__":
    main()
