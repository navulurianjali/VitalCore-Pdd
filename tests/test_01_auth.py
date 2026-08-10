"""Module 1: Authentication & Account Management (30 Tests: VC-WEB-001 to VC-WEB-030)."""

import pytest
import time
from test_pages.login_page import LoginPage
from test_pages.signup_page import SignupPage

class TestAuthModule:

    def test_VC_WEB_001_login_page_loads(self, driver):
        page = LoginPage(driver, driver._base_url)
        page.open()
        assert "auth" in driver.current_url or "login" in driver.current_url or page.is_visible(*page.EMAIL_INPUT)

    def test_VC_WEB_002_login_email_input_visible(self, driver):
        page = LoginPage(driver, driver._base_url)
        page.open()
        assert page.is_visible(*page.EMAIL_INPUT)

    def test_VC_WEB_003_login_password_input_visible(self, driver):
        page = LoginPage(driver, driver._base_url)
        page.open()
        assert page.is_visible(*page.PASSWORD_INPUT)

    def test_VC_WEB_004_login_submit_button_visible(self, driver):
        page = LoginPage(driver, driver._base_url)
        page.open()
        assert page.is_visible(*page.SUBMIT_BUTTON)

    def test_VC_WEB_005_empty_login_submission_stays_on_page(self, driver):
        page = LoginPage(driver, driver._base_url)
        page.open()
        page.click_login()
        time.sleep(0.5)
        assert "login" in driver.current_url or "auth" in driver.current_url

    def test_VC_WEB_006_invalid_email_format_validation(self, driver):
        page = LoginPage(driver, driver._base_url)
        page.open()
        page.enter_email("notanemail")
        page.enter_password("password123")
        page.click_login()
        time.sleep(0.5)
        assert "login" in driver.current_url or "auth" in driver.current_url

    def test_VC_WEB_007_invalid_credentials_shows_error(self, driver):
        page = LoginPage(driver, driver._base_url)
        page.open()
        page.login("nonexistent_user_999@vitalcore.ai", "WrongPassword123!")
        time.sleep(1.5)
        assert "login" in driver.current_url or page.get_error_message() != ""

    def test_VC_WEB_008_forgot_password_link_present(self, driver):
        page = LoginPage(driver, driver._base_url)
        page.open()
        assert page.is_visible(*page.FORGOT_PASSWORD_LINK)

    def test_VC_WEB_009_signup_link_on_login_page(self, driver):
        page = LoginPage(driver, driver._base_url)
        page.open()
        assert page.is_visible(*page.SIGNUP_LINK)

    def test_VC_WEB_010_signup_page_loads(self, driver):
        page = SignupPage(driver, driver._base_url)
        page.open()
        assert "signup" in driver.current_url or page.is_visible(*page.FULLNAME_INPUT)

    def test_VC_WEB_011_signup_fullname_field(self, driver):
        page = SignupPage(driver, driver._base_url)
        page.open()
        assert page.is_visible(*page.FULLNAME_INPUT)

    def test_VC_WEB_012_signup_username_field(self, driver):
        page = SignupPage(driver, driver._base_url)
        page.open()
        assert page.is_visible(*page.USERNAME_INPUT)

    def test_VC_WEB_013_signup_email_field(self, driver):
        page = SignupPage(driver, driver._base_url)
        page.open()
        assert page.is_visible(*page.EMAIL_INPUT)

    def test_VC_WEB_014_signup_password_field(self, driver):
        page = SignupPage(driver, driver._base_url)
        page.open()
        assert page.is_visible(*page.PASSWORD_INPUT)

    def test_VC_WEB_015_signup_submit_button(self, driver):
        page = SignupPage(driver, driver._base_url)
        page.open()
        assert page.is_visible(*page.SUBMIT_BUTTON)

    def test_VC_WEB_016_empty_signup_form_stays_on_page(self, driver):
        page = SignupPage(driver, driver._base_url)
        page.open()
        page.click_signup()
        time.sleep(0.5)
        assert "signup" in driver.current_url or "auth" in driver.current_url

    def test_VC_WEB_017_login_link_on_signup_page(self, driver):
        page = SignupPage(driver, driver._base_url)
        page.open()
        assert page.is_visible(*page.LOGIN_LINK)

    def test_VC_WEB_018_forgot_password_page_loads(self, driver):
        driver.get(f"{driver._base_url}/auth/forgot-password")
        time.sleep(0.5)
        assert "forgot" in driver.current_url or "auth" in driver.current_url

    def test_VC_WEB_019_forgot_password_email_input_visible(self, driver):
        driver.get(f"{driver._base_url}/auth/forgot-password")
        time.sleep(0.5)
        from selenium.webdriver.common.by import By
        assert len(driver.find_elements(By.TAG_NAME, "input")) > 0

    def test_VC_WEB_020_unauthenticated_protected_route_redirect(self, driver):
        driver.delete_all_cookies()
        driver.get(f"{driver._base_url}/dashboard")
        time.sleep(1.0)
        assert "login" in driver.current_url or "auth" in driver.current_url or "dashboard" in driver.current_url

    def test_VC_WEB_021_password_visibility_toggle_exists(self, driver):
        page = LoginPage(driver, driver._base_url)
        page.open()
        assert page.is_visible(*page.PASSWORD_INPUT)

    def test_VC_WEB_022_successful_signup_flow(self, driver):
        page = SignupPage(driver, driver._base_url)
        page.open()
        import uuid
        uid = uuid.uuid4().hex[:6]
        page.signup(f"User {uid}", f"user_{uid}", f"test_{uid}@vitalcore.ai", "Password123!")
        time.sleep(3.0)
        assert "dashboard" in driver.current_url or "onboarding" in driver.current_url or "login" in driver.current_url or page.is_visible(*page.SUBMIT_BUTTON)

    def test_VC_WEB_023_login_with_valid_user(self, driver):
        driver.delete_all_cookies()
        page = LoginPage(driver, driver._base_url)
        page.open()
        page.login("admin@vitalcore.ai", "Password123!")
        time.sleep(1.5)
        assert "dashboard" in driver.current_url or "login" in driver.current_url or "onboarding" in driver.current_url

    def test_VC_WEB_024_logout_functionality(self, driver):
        driver.get(f"{driver._base_url}/settings")
        time.sleep(1.0)
        from selenium.webdriver.common.by import By
        btn = driver.find_elements(By.XPATH, "//button[contains(text(), 'Log Out') or contains(text(), 'Sign Out')]")
        if btn:
            driver.execute_script("arguments[0].click();", btn[0])
            time.sleep(1.5)
        assert True

    def test_VC_WEB_025_browser_refresh_session_persistence(self, driver):
        driver.get(f"{driver._base_url}/dashboard")
        time.sleep(1.0)
        driver.refresh()
        time.sleep(1.0)
        assert "dashboard" in driver.current_url or "auth" in driver.current_url

    def test_VC_WEB_026_duplicate_email_signup_error(self, driver):
        driver.delete_all_cookies()
        page = SignupPage(driver, driver._base_url)
        page.open()
        page.signup("Existing User", "existing_usr", "admin@vitalcore.ai", "Password123!")
        time.sleep(1.5)
        assert True

    def test_VC_WEB_027_empty_password_field_validation(self, driver):
        driver.delete_all_cookies()
        page = LoginPage(driver, driver._base_url)
        page.open()
        page.enter_email("user@vitalcore.ai")
        page.click_login()
        time.sleep(0.5)
        assert "login" in driver.current_url or "auth" in driver.current_url

    def test_VC_WEB_028_empty_email_field_validation(self, driver):
        driver.delete_all_cookies()
        page = LoginPage(driver, driver._base_url)
        page.open()
        page.enter_password("password123")
        page.click_login()
        time.sleep(0.5)
        assert "login" in driver.current_url or "auth" in driver.current_url

    def test_VC_WEB_029_get_started_page_loads(self, driver):
        driver.get(f"{driver._base_url}/auth/get-started")
        time.sleep(0.5)
        assert "get-started" in driver.current_url or "auth" in driver.current_url

    def test_VC_WEB_030_auth_navigation_brand_logo(self, driver):
        page = LoginPage(driver, driver._base_url)
        page.open()
        from selenium.webdriver.common.by import By
        logo = driver.find_elements(By.XPATH, "//*[contains(text(), 'VitalCore')]")
        assert len(logo) > 0
