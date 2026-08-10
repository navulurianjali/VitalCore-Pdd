"""Screenshots helper for capturing browser state on test failures."""

import os
import time

def capture_failure_screenshot(driver, test_id, report_dir="reports/screenshots"):
    os.makedirs(report_dir, exist_ok=True)
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    filename = f"{test_id}_{timestamp}.png"
    filepath = os.path.join(report_dir, filename)
    try:
        driver.save_screenshot(filepath)
        print(f"\n[Screenshot Captured] {filepath} (URL: {driver.current_url})")
        return filepath
    except Exception as e:
        print(f"Failed to capture screenshot for {test_id}: {e}")
        return None
