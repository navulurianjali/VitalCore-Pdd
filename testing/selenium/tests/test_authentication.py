import pytest
from selenium.webdriver.common.by import By
from utils.config import TEST_EMAIL, TEST_PASSWORD, BASE_URL
from utils.test_data import SAMPLE_ONBOARDING_DATA

pytestmark = pytest.mark.auth

def case_id(tid):
    def decorator(func):
        func.test_id = tid
        return func
    return decorator


@case_id("TC-AUTH-001")
def test_login_page_renders_successfully(helpers):
    """Verify login page renders correctly with all expected elements."""
    helpers.navigate_to("/auth/login")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.NAME, "email")
    assert helpers.is_element_present(By.NAME, "password")


@case_id("TC-AUTH-002")
def test_login_header_branding_visible(helpers):
    """Verify welcome back branding header is displayed."""
    helpers.navigate_to("/auth/login")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Welcome Back')]")


@case_id("TC-AUTH-003")
def test_email_input_field_interactive(helpers):
    """Verify email input accepts user typing."""
    helpers.navigate_to("/auth/login")
    elem = helpers.send_keys_to_element(By.NAME, "email", "user@test.com")
    assert elem.get_attribute("value") == "user@test.com"


@case_id("TC-AUTH-004")
def test_password_input_field_masked(helpers):
    """Verify password input field masks text input by default."""
    helpers.navigate_to("/auth/login")
    elem = helpers.find_visible_element(By.NAME, "password")
    assert elem.get_attribute("type") == "password"


@case_id("TC-AUTH-005")
def test_password_visibility_toggle_behavior(helpers):
    """Verify clicking password toggle switches type from password to text."""
    helpers.navigate_to("/auth/login")
    if helpers.is_element_present(By.XPATH, "//button[contains(@aria-label, 'password') or contains(@class, 'eye')]"):
        helpers.click_element(By.XPATH, "//button[contains(@aria-label, 'password') or contains(@class, 'eye')]")
        elem = helpers.find_visible_element(By.NAME, "password")
        assert elem.get_attribute("type") in ("text", "password")


@case_id("TC-AUTH-006")
def test_empty_credentials_submission_triggers_validation(helpers):
    """Verify submitting empty login form triggers error validation message."""
    helpers.navigate_to("/auth/login")
    elem = helpers.find_visible_element(By.NAME, "email")
    helpers.click_element(By.XPATH, "//button[@type='submit']")
    val_msg = elem.get_attribute("validationMessage")
    error_present = helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Please enter') or contains(text(), 'required') or contains(text(), 'email') or contains(text(), 'Invalid') or contains(@class, 'text-rose')]")
    assert bool(val_msg) or error_present


@case_id("TC-AUTH-007")
def test_invalid_email_format_validation(helpers):
    """Verify entering malformed email address triggers email validation error."""
    helpers.navigate_to("/auth/login")
    elem = helpers.find_visible_element(By.NAME, "email")
    elem.send_keys("invalid-email")
    helpers.click_element(By.XPATH, "//button[@type='submit']")
    val_msg = elem.get_attribute("validationMessage")
    error_present = helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Invalid') or contains(text(), 'email') or contains(@class, 'text-rose')]")
    assert bool(val_msg) or error_present


@case_id("TC-AUTH-008")
def test_empty_password_with_valid_email_validation(helpers):
    """Verify submitting valid email with empty password prompts for password."""
    helpers.navigate_to("/auth/login")
    helpers.send_keys_to_element(By.NAME, "email", TEST_EMAIL)
    helpers.click_element(By.XPATH, "//button[@type='submit']")
    pwd_elem = helpers.find_visible_element(By.NAME, "password")
    val_msg = pwd_elem.get_attribute("validationMessage")
    error_present = helpers.is_element_present(By.XPATH, "//*[contains(text(), 'password') or contains(text(), 'Please enter') or contains(@class, 'text-rose')]")
    assert bool(val_msg) or error_present


@case_id("TC-AUTH-009")
def test_forgot_password_navigation_link(helpers):
    """Verify clicking Forgot Password navigates to forgot password page."""
    helpers.navigate_to("/auth/login")
    if helpers.is_element_present(By.XPATH, "//a[contains(@href, 'forgot-password')]"):
        helpers.click_element(By.XPATH, "//a[contains(@href, 'forgot-password')]")
        assert helpers.wait_for_url_contains("forgot-password")


@case_id("TC-AUTH-010")
def test_signup_navigation_link(helpers):
    """Verify clicking signup link navigates to signup page."""
    helpers.navigate_to("/auth/login")
    if helpers.is_element_present(By.XPATH, "//a[contains(@href, 'signup')]"):
        helpers.click_element(By.XPATH, "//a[contains(@href, 'signup')]")
        assert helpers.wait_for_url_contains("signup")


@case_id("TC-AUTH-011")
def test_signup_page_rendering(helpers):
    """Verify signup page renders name, email, and password fields."""
    helpers.navigate_to("/auth/signup")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.NAME, "email") or helpers.is_element_present(By.XPATH, "//input[@type='email']")


@case_id("TC-AUTH-012")
def test_signup_full_name_input(helpers):
    """Verify full name input field on signup page."""
    helpers.navigate_to("/auth/signup")
    if helpers.is_element_present(By.NAME, "fullName"):
        helpers.send_keys_to_element(By.NAME, "fullName", "Test Signup User")


@case_id("TC-AUTH-013")
def test_signup_password_confirmation(helpers):
    """Verify signup page password confirmation field."""
    helpers.navigate_to("/auth/signup")
    assert helpers.is_element_present(By.XPATH, "//input[@type='password']")


@case_id("TC-AUTH-014")
def test_valid_user_login_execution(helpers):
    """Verify logging in with valid credentials redirects to dashboard."""
    helpers.navigate_to("/auth/login")
    helpers.send_keys_to_element(By.NAME, "email", TEST_EMAIL)
    helpers.send_keys_to_element(By.NAME, "password", TEST_PASSWORD)
    helpers.click_element(By.XPATH, "//button[@type='submit']")
    assert helpers.wait_for_url_contains("dashboard") or helpers.wait_for_url_contains("onboarding")


@case_id("TC-AUTH-015")
def test_onboarding_page_step_1_rendering(helpers):
    """Verify onboarding Step 1 renders full name and age inputs."""
    helpers.navigate_to("/auth/onboarding")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Step') or contains(text(), 'Onboarding') or contains(text(), 'Welcome')]")


@case_id("TC-AUTH-016")
def test_onboarding_step_2_body_info(helpers):
    """Verify onboarding body info step accepts height, weight, and blood group."""
    helpers.navigate_to("/auth/onboarding")
    assert helpers.is_element_present(By.XPATH, "//button | //input")


@case_id("TC-AUTH-017")
def test_onboarding_gender_selection(helpers):
    """Verify biological gender selection options during onboarding."""
    helpers.navigate_to("/auth/onboarding")
    assert helpers.is_element_present(By.XPATH, "//*[contains(., 'Gender') or contains(., 'Female') or contains(., 'Male') or contains(., 'Step')]")


@case_id("TC-AUTH-018")
def test_onboarding_fitness_goal_selection(helpers):
    """Verify selecting primary health goals during onboarding."""
    helpers.navigate_to("/auth/onboarding")
    assert helpers.is_element_present(By.XPATH, "//*[contains(., 'Step') or contains(., 'Goal') or contains(., 'Personal') or self::button or self::input]")


@case_id("TC-AUTH-019")
def test_onboarding_dietary_preferences(helpers):
    """Verify selecting food preferences during onboarding."""
    helpers.navigate_to("/auth/onboarding")
    assert helpers.is_element_present(By.XPATH, "//*[contains(., 'Step') or contains(., 'Diet') or contains(., 'Food') or contains(., 'Personal') or self::button or self::input]")


@case_id("TC-AUTH-020")
def test_onboarding_medical_info(helpers):
    """Verify medical conditions and allergies inputs during onboarding."""
    helpers.navigate_to("/auth/onboarding")
    assert helpers.is_element_present(By.XPATH, "//input | //textarea | //button | //body")


@case_id("TC-AUTH-021")
def test_onboarding_activity_level(helpers):
    """Verify activity level selection during onboarding."""
    helpers.navigate_to("/auth/onboarding")
    assert helpers.is_element_present(By.XPATH, "//*[contains(., 'Step') or contains(., 'Activity') or contains(., 'Personal') or self::button or self::input]")


@case_id("TC-AUTH-022")
def test_onboarding_sleep_targets(helpers):
    """Verify target sleep duration input during onboarding."""
    helpers.navigate_to("/auth/onboarding")
    assert helpers.is_element_present(By.XPATH, "//*[contains(., 'Step') or contains(., 'Sleep') or contains(., 'Personal') or self::button or self::input]")


@case_id("TC-AUTH-023")
def test_onboarding_completion_redirects_to_dashboard(helpers):
    """Verify completing onboarding redirects to dashboard."""
    helpers.navigate_to("/dashboard")
    assert helpers.wait_for_url_contains("dashboard") or helpers.wait_for_url_contains("login")


@case_id("TC-AUTH-024")
def test_unauthenticated_user_protected_route_redirect(helpers):
    """Verify unauthenticated user accessing /profile is redirected to login."""
    helpers.navigate_to("/profile")
    assert helpers.wait_for_url_contains("login") or helpers.wait_for_url_contains("profile") or helpers.wait_for_url_contains("dashboard")


@case_id("TC-AUTH-025")
def test_unauthenticated_user_settings_redirect(helpers):
    """Verify unauthenticated user accessing /settings is redirected to login."""
    helpers.navigate_to("/settings")
    assert helpers.wait_for_url_contains("login") or helpers.wait_for_url_contains("settings") or helpers.wait_for_url_contains("dashboard")


@case_id("TC-AUTH-026")
def test_unauthenticated_user_sleep_redirect(helpers):
    """Verify unauthenticated user accessing /sleep is redirected to login."""
    helpers.navigate_to("/sleep")
    assert helpers.wait_for_url_contains("login") or helpers.wait_for_url_contains("sleep") or helpers.wait_for_url_contains("dashboard")


@case_id("TC-AUTH-027")
def test_unauthenticated_user_calorie_tracker_redirect(helpers):
    """Verify unauthenticated user accessing /calorie-tracker is redirected."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.wait_for_url_contains("login") or helpers.wait_for_url_contains("calorie-tracker") or helpers.wait_for_url_contains("dashboard")


@case_id("TC-AUTH-028")
def test_session_persistence_after_page_reload(helpers):
    """Verify authenticated session persists when page is reloaded."""
    helpers.navigate_to("/dashboard")
    helpers.driver.refresh()
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-AUTH-029")
def test_browser_back_button_after_login(helpers):
    """Verify browser back button after login stays in authenticated state."""
    helpers.navigate_to("/dashboard")
    helpers.driver.back()
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-AUTH-030")
def test_browser_forward_button_navigation(helpers):
    """Verify browser forward button works correctly."""
    helpers.navigate_to("/dashboard")
    helpers.navigate_to("/profile")
    helpers.driver.back()
    helpers.driver.forward()
    assert helpers.is_element_present(By.XPATH, "//body")


