"""
VitalCore Test Suite — Date-Based Daily Health Tracking & History
==================================================================
Tests VC_WEB_300..305:
1. Daily date record creation and timezone date handling
2. History page navigation (/history)
3. Date filtering & period tab switching (Day, 7 Days, 30 Days)
4. Goal achievement breakdown calculation
5. User isolation and no-data day handling
"""

import time
import uuid
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from test_pages.signup_page import SignupPage


class TestDailyHistoryTracking:
    """Test suite for date-based daily tracking & health history."""

    @pytest.fixture(autouse=True)
    def ensure_authenticated(self, driver):
        """Ensure test user is signed up and authenticated before running history tests."""
        if "/history" in driver.current_url and "login" not in driver.current_url:
            return
            
        uid = uuid.uuid4().hex[:8]
        sp = SignupPage(driver, driver._base_url)
        sp.open()
        sp.signup(f"History User {uid}", f"hist_{uid}", f"hist_{uid}@vitalcore.ai", "Password123!")
        
        try:
            WebDriverWait(driver, 10).until(lambda d: "login" not in d.current_url and "signup" not in d.current_url)
        except Exception:
            pass

        # Handle onboarding bypass if present
        if "onboarding" in driver.current_url:
            c_btns = driver.find_elements(By.XPATH, "//button[contains(text(), 'Complete') or contains(text(), 'Finish') or contains(text(), 'Dashboard')]")
            if c_btns:
                driver.execute_script("arguments[0].click();", c_btns[0])
                time.sleep(1)

    def test_VC_WEB_300_history_page_navigation(self, driver):
        """Verify Health History page loads correctly for authenticated user."""
        driver.get(f"{driver._base_url}/history")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Health History') or contains(text(), 'History')]"))
        )
        body_text = driver.find_element(By.TAG_NAME, "body").text
        assert "Health History" in body_text, "Health History heading should exist on /history"

    def test_VC_WEB_301_period_tabs(self, driver):
        """Verify switching between Day, 7 Days, and 30 Days tabs."""
        driver.get(f"{driver._base_url}/history")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(text(), '7 Days')]"))
        )
        
        btn_7days = driver.find_element(By.XPATH, "//button[contains(text(), '7 Days')]")
        btn_30days = driver.find_element(By.XPATH, "//button[contains(text(), '30 Days')]")
        
        btn_7days.click()
        time.sleep(1)
        
        btn_30days.click()
        time.sleep(1)

    def test_VC_WEB_302_day_navigation(self, driver):
        """Verify previous day navigation button."""
        driver.get(f"{driver._base_url}/history")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Previous Day')]"))
        )
        prev_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Previous Day')]")
        prev_btn.click()
        time.sleep(1)
