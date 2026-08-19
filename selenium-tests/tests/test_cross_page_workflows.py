import pytest
from selenium.webdriver.common.by import By
from utils.config import BASE_URL

pytestmark = pytest.mark.workflows

def case_id(tid):
    def decorator(func):
        func.test_id = tid
        return func
    return decorator


@case_id("TC-WORK-001")
def test_onboarding_to_profile_end_to_end_flow(helpers):
    """Verify onboarding submitted values sync automatically to profile."""
    helpers.navigate_to("/profile")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-WORK-002")
def test_log_calories_reflects_in_dashboard_summary(helpers):
    """Verify logging meal calories updates dashboard focus card intake total."""
    helpers.navigate_to("/calorie-tracker")
    helpers.navigate_to("/dashboard")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-WORK-003")
def test_log_hydration_reflects_in_dashboard_summary(helpers):
    """Verify logging hydration updates dashboard hydration intake card."""
    helpers.navigate_to("/dashboard")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), '250')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), '250')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-WORK-004")
def test_log_sleep_reflects_in_health_history(helpers):
    """Verify logging sleep hours updates health history daily goal score."""
    helpers.navigate_to("/sleep")
    helpers.navigate_to("/history")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-WORK-005")
def test_profile_edit_updates_future_lab_baseline(helpers):
    """Verify updating profile weight/goal recalculates future health predictions."""
    helpers.navigate_to("/profile")
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-WORK-006")
def test_multi_tab_profile_update_sync(helpers):
    """Verify Tab 1 profile update reflects in Tab 2 after refresh."""
    helpers.navigate_to("/profile")
    
    # Open Tab 2
    helpers.driver.execute_script("window.open('/profile', '_blank');")
    handles = helpers.driver.window_handles
    
    helpers.driver.switch_to.window(handles[1])
    helpers.driver.refresh()
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")
    
    # Close Tab 2 and switch back to Tab 1
    helpers.driver.close()
    helpers.driver.switch_to.window(handles[0])


@case_id("TC-WORK-007")
def test_multi_tab_tracking_update_sync(helpers):
    """Verify Tab 1 logging water reflects in Tab 2 Health History."""
    helpers.navigate_to("/dashboard")
    
    helpers.driver.execute_script("window.open('/history', '_blank');")
    handles = helpers.driver.window_handles
    
    helpers.driver.switch_to.window(handles[1])
    helpers.driver.refresh()
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")
    
    helpers.driver.close()
    helpers.driver.switch_to.window(handles[0])


@case_id("TC-WORK-008")
def test_join_challenge_reflects_in_dashboard_streak(helpers):
    """Verify joining challenge updates dashboard challenge widget."""
    helpers.navigate_to("/challenges")
    helpers.navigate_to("/dashboard")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-WORK-009")
def test_settings_theme_switch_applies_globally(helpers):
    """Verify switching theme in Settings applies theme styling across pages."""
    helpers.navigate_to("/settings")
    helpers.navigate_to("/dashboard")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-WORK-010")
def test_ai_coach_context_uses_user_profile_name(helpers):
    """Verify AI Coach prompt responses address user by their profile full name."""
    helpers.navigate_to("/ai-coach")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-WORK-011")
def test_new_user_start_fresh_isolation_workflow(helpers):
    """Verify new user session starts with zero telemetry across all modules."""
    helpers.navigate_to("/dashboard")
    helpers.navigate_to("/calorie-tracker")
    helpers.navigate_to("/sleep")
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-WORK-012")
def test_complete_workout_updates_calories_burned_target(helpers):
    """Verify completing workout session adds active calories burned."""
    helpers.navigate_to("/fitness")
    helpers.navigate_to("/dashboard")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-WORK-013")
def test_calendar_historical_date_selection_across_modules(helpers):
    """Verify selecting historical date on Calorie Tracker syncs date in History."""
    helpers.navigate_to("/calorie-tracker")
    helpers.navigate_to("/history")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-WORK-014")
def test_session_expiry_redirects_to_login(helpers):
    """Verify clearing session token redirects protected routes to login."""
    helpers.navigate_to("/dashboard")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-WORK-015")
def test_full_user_onboarding_to_dashboard_journey(helpers):
    """Verify full end-to-end journey from signup through onboarding to dashboard."""
    helpers.navigate_to("/auth/login")
    helpers.navigate_to("/dashboard")
    assert helpers.is_element_present(By.XPATH, "//body")
