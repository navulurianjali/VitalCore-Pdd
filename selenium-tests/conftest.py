import time
import pytest
from pathlib import Path
from utils.driver import create_driver
from utils.helpers import SeleniumHelpers
from utils.config import SCREENSHOTS_DIR
from utils.excel_reporter import generate_excel_report
from utils.html_reporter import generate_html_report

# Global List to store test execution metadata
RESULTS_LIST = []
SESSION_START_TIME = None

@pytest.hookimpl(tryfirst=True)
def pytest_sessionstart(session):
    global SESSION_START_TIME, RESULTS_LIST
    SESSION_START_TIME = time.time()
    RESULTS_LIST.clear()

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
    Hook to capture test status, execution time, and failure screenshots.
    """
    outcome = yield
    report = outcome.get_result()

    if report.when == "call":
        test_id = getattr(item.function, "test_id", getattr(item.function, "case_id", item.name.upper()))
        module_name = item.module.__name__.split(".")[-1].replace("test_", "").capitalize()
        docstring = item.function.__doc__.strip() if item.function.__doc__ else item.name
        description = docstring.split("\n")[0]

        screenshot_rel_path = ""
        error_msg = ""

        if report.failed:
            status = "FAIL"
            error_msg = str(report.longrepr).split("\n")[-1] if report.longrepr else "Test Failure"
            
            # Capture screenshot if driver instance is attached
            driver_inst = getattr(item, "driver_instance", None)
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
        else:
            status = "PASS"

        RESULTS_LIST.append({
            "test_id": test_id,
            "module": module_name,
            "name": item.name,
            "description": description,
            "status": status,
            "duration": report.duration,
            "screenshot": screenshot_rel_path,
            "error": error_msg,
        })

def pytest_sessionfinish(session, exitstatus):
    """
    Hook executed after all tests complete. Triggers Excel and HTML report generation.
    """
    total_duration = time.time() - SESSION_START_TIME if SESSION_START_TIME else 0.0
    if RESULTS_LIST:
        try:
            generate_excel_report(RESULTS_LIST, total_duration)
            generate_html_report(RESULTS_LIST, total_duration)
            print("\n" + "="*60)
            print("✨ Selenium Automation Test Execution Complete ✨")
            print(f"📊 Excel Report: selenium-tests/reports/selenium_results.xlsx")
            print(f"🌐 HTML Report: selenium-tests/reports/selenium_results.html")
            print("="*60)
        except Exception as e:
            print(f"Failed to generate test reports: {e}")
