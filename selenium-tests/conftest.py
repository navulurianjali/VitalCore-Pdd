import time
import json
import pytest
from datetime import datetime
from pathlib import Path
from utils.driver import create_driver
from utils.helpers import SeleniumHelpers
from utils.config import SCREENSHOTS_DIR, REPORTS_DIR, BASE_URL
from utils.excel_reporter import generate_excel_report
from utils.html_reporter import generate_html_report

# Temp directory for worker node result storage under xdist
WORKER_RESULTS_DIR = REPORTS_DIR / ".worker_results"

RESULTS_LIST = []
SESSION_START_TIME = None
SESSION_START_TIMESTAMP = None
SESSION_END_TIMESTAMP = None

@pytest.hookimpl(tryfirst=True)
def pytest_sessionstart(session):
    global SESSION_START_TIME, SESSION_START_TIMESTAMP, RESULTS_LIST
    SESSION_START_TIME = time.time()
    SESSION_START_TIMESTAMP = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    RESULTS_LIST.clear()
    
    # Master process cleans up old worker results folder
    if not hasattr(session.config, "workerinput"):
        if WORKER_RESULTS_DIR.exists():
            for f in WORKER_RESULTS_DIR.glob("*.json"):
                try:
                    f.unlink()
                except Exception:
                    pass
        WORKER_RESULTS_DIR.mkdir(parents=True, exist_ok=True)

@pytest.fixture(scope="function")
def driver(request):
    """
    Function-scoped WebDriver fixture. Creates browser session for each test and quits upon completion.
    """
    driver_instance = create_driver()
    request.node.driver_instance = driver_instance
    yield driver_instance
    try:
        driver_instance.quit()
    except Exception:
        pass

@pytest.fixture(scope="function")
def helpers(driver):
    """
    SeleniumHelpers wrapper fixture.
    """
    return SeleniumHelpers(driver)

@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """
    Hook to capture test status, execution time, URL, expected/actual results, and failure screenshots.
    """
    outcome = yield
    report = outcome.get_result()

    if report.when == "call":
        test_id = getattr(item.function, "test_id", getattr(item.function, "case_id", item.name.upper()))
        module_name = item.module.__name__.split(".")[-1].replace("test_", "").replace("_", " ").title()
        docstring = item.function.__doc__.strip() if item.function.__doc__ else item.name
        
        lines = [line.strip() for line in docstring.split("\n") if line.strip()]
        description = lines[0] if lines else item.name
        
        preconditions = f"Application is deployed and accessible at {BASE_URL}"
        steps = f"Navigate to route and execute {item.name}"
        expected_result = description
        actual_result = ""
        current_url = BASE_URL
        
        driver_inst = getattr(item, "driver_instance", None)
        if driver_inst:
            try:
                current_url = driver_inst.current_url or BASE_URL
            except Exception:
                pass

        screenshot_rel_path = ""
        error_msg = ""

        if report.failed:
            status = "FAIL"
            error_msg = str(report.longrepr).split("\n")[-1] if report.longrepr else "Assertion Error"
            actual_result = f"Assertion failed: {error_msg}"
            
            if driver_inst:
                try:
                    screenshot_filename = f"{test_id}_failed.png"
                    screenshot_filepath = SCREENSHOTS_DIR / screenshot_filename
                    driver_inst.save_screenshot(str(screenshot_filepath))
                    screenshot_rel_path = f"screenshots/{screenshot_filename}"
                except Exception as e:
                    print(f"Failed to capture screenshot: {e}")
        elif report.skipped:
            status = "SKIPPED"
            actual_result = "Test execution skipped"
        else:
            status = "PASS"
            actual_result = f"Successfully verified: {expected_result}"

        res_item = {
            "test_id": test_id,
            "module": module_name,
            "name": item.name,
            "preconditions": preconditions,
            "steps": steps,
            "description": description,
            "expected_result": expected_result,
            "actual_result": actual_result,
            "status": status,
            "error": error_msg,
            "url": current_url,
            "duration": report.duration,
            "screenshot": screenshot_rel_path,
        }
        RESULTS_LIST.append(res_item)

def pytest_sessionfinish(session, exitstatus):
    """
    Hook executed after all tests complete. Saves worker results and generates combined Excel/HTML reports on master.
    """
    global SESSION_END_TIMESTAMP
    SESSION_END_TIMESTAMP = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # If executing inside a worker node under xdist
    if hasattr(session.config, "workerinput"):
        worker_id = getattr(session.config, "workerinput", {}).get("workerid", "worker_0")
        worker_file = WORKER_RESULTS_DIR / f"{worker_id}_results.json"
        try:
            with open(worker_file, "w", encoding="utf-8") as f:
                json.dump(RESULTS_LIST, f, indent=2)
        except Exception as e:
            print(f"Failed to save worker results: {e}")
        return

    # Master node execution: merge all worker results or use local RESULTS_LIST
    merged_results = list(RESULTS_LIST)
    if WORKER_RESULTS_DIR.exists():
        for wfile in WORKER_RESULTS_DIR.glob("*.json"):
            try:
                with open(wfile, "r", encoding="utf-8") as f:
                    wdata = json.load(f)
                    merged_results.extend(wdata)
            except Exception:
                pass

    total_duration = time.time() - SESSION_START_TIME if SESSION_START_TIME else 0.0
    if merged_results:
        try:
            generate_excel_report(merged_results, total_duration, SESSION_START_TIMESTAMP, SESSION_END_TIMESTAMP)
            generate_html_report(merged_results, total_duration)
            print("\n" + "="*60)
            print("✨ Selenium Automation Test Execution Complete ✨")
            print(f"📊 Total Tests Executed: {len(merged_results)}")
            print(f"📊 Excel Report: selenium-tests/reports/selenium_results.xlsx")
            print(f"🌐 HTML Report: selenium-tests/reports/selenium_results.html")
            print("="*60)
        except Exception as e:
            print(f"Failed to generate test reports: {e}")
