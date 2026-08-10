"""PyTest shared fixtures for VitalCore 300 E2E Selenium Test Suite."""

import pytest
import os
import sys
import uuid
import time

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from utils.driver_factory import create_driver
from utils.screenshots import capture_failure_screenshot

def pytest_addoption(parser):
    parser.addoption("--headless", action="store_true", default=True,
                     help="Run Chrome in headless mode (default: True)")

@pytest.fixture(scope="class")
def driver(request):
    is_headless = request.config.getoption("--headless")
    drv = create_driver(headless=is_headless)
    
    # Class-level session setup if required
    class_name = request.cls.__name__ if hasattr(request, "cls") and request.cls else request.node.name
    auth_classes = [
        "TestOnboardingProfileModule", "TestDashboardPage", "TestNutritionPage", 
        "TestFitnessPage", "TestSleepPage", "TestChallengesPage", 
        "TestFutureLabPage", "TestAICoachPage", "TestSettingsPage", 
        "TestAPIPersistence", "TestSecurityRLS", "TestResponsiveUI", "TestDailyHistoryTracking"
    ]

    if class_name in auth_classes:
        uid = uuid.uuid4().hex[:8]
        try:
            from test_pages.signup_page import SignupPage
            sp = SignupPage(drv, drv._base_url)
            sp.open()
            sp.signup(f"Test User {uid}", f"user_{uid}", f"test_{uid}@vitalcore.ai", "Password123!")
            from selenium.webdriver.support.ui import WebDriverWait
            WebDriverWait(drv, 10).until(lambda d: "signup" not in d.current_url)
            time.sleep(1.0)

            # Complete onboarding to unlock /profile, /dashboard, and all protected routes
            drv.get(f"{drv._base_url}/auth/onboarding")
            time.sleep(1.0)
            from selenium.webdriver.common.by import By
            c_btns = drv.find_elements(By.XPATH, "//button[contains(text(), 'Complete') or contains(text(), 'Finish') or contains(text(), 'Dashboard')]")
            if c_btns:
                drv.execute_script("arguments[0].click();", c_btns[0])
                time.sleep(1.5)
        except Exception as e:
            print(f"[Conftest Auth Notice] Class {class_name} session auto-login notice: {e}")

    yield drv
    drv.quit()

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    if rep.when == "call" and rep.failed:
        drv = item.funcargs.get("driver")
        if drv:
            test_id = getattr(item.function, "__name__", "test_unknown")
            capture_failure_screenshot(drv, test_id)
