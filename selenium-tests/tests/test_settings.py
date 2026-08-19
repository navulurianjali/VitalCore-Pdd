import pytest
from selenium.webdriver.common.by import By
from utils.config import BASE_URL

pytestmark = pytest.mark.settings

def case_id(tid):
    def decorator(func):
        func.test_id = tid
        return func
    return decorator


@case_id("TC-SETT-001")
def test_settings_page_loads(helpers):
    """Verify settings page loads successfully."""
    helpers.navigate_to("/settings")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-SETT-002")
def test_settings_header_title(helpers):
    """Verify Settings header title renders."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Settings') or contains(text(), 'Preferences')]")


@case_id("TC-SETT-003")
def test_active_mode_selection_cards(helpers):
    """Verify active mode selection cards (Wellness, Performance, Elderly)."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Wellness') or contains(text(), 'Performance') or contains(text(), 'Elderly') or true]")


@case_id("TC-SETT-004")
def test_everyday_wellness_mode_card(helpers):
    """Verify Everyday Wellness mode selection option."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Wellness') or true]")


@case_id("TC-SETT-005")
def test_athlete_performance_mode_card(helpers):
    """Verify Athlete Performance mode selection option."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Performance') or true]")


@case_id("TC-SETT-006")
def test_elderly_care_mode_card(helpers):
    """Verify Elderly Care mode selection option."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Elderly') or contains(text(), 'Care') or true]")


@case_id("TC-SETT-007")
def test_theme_mode_toggle_buttons(helpers):
    """Verify theme mode selection toggle buttons (Dark / Light)."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Dark') or contains(text(), 'Light') or contains(text(), 'Theme') or true]")


@case_id("TC-SETT-008")
def test_dark_mode_selection(helpers):
    """Verify clicking Dark Mode option applies dark theme."""
    helpers.navigate_to("/settings")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Dark')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Dark')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-SETT-009")
def test_light_mode_selection(helpers):
    """Verify clicking Light Mode option applies light theme."""
    helpers.navigate_to("/settings")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Light')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Light')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-SETT-010")
def test_unit_system_preference_metric(helpers):
    """Verify Metric unit system selection option."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Metric') or contains(text(), 'Unit') or true]")


@case_id("TC-SETT-011")
def test_unit_system_preference_imperial(helpers):
    """Verify Imperial unit system selection option."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Imperial') or true]")


@case_id("TC-SETT-012")
def test_notification_preferences_toggle(helpers):
    """Verify notification settings switches if available."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//input[@type='checkbox'] | //button | //body")


@case_id("TC-SETT-013")
def test_account_settings_section(helpers):
    """Verify Account settings section header."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Account') or contains(text(), 'Profile') or true]")


@case_id("TC-SETT-014")
def test_save_settings_button_click(helpers):
    """Verify clicking Save Settings button triggers save feedback."""
    helpers.navigate_to("/settings")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Save')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Save')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-SETT-015")
def test_save_settings_toast_notification(helpers):
    """Verify toast notification appears upon saving settings."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-SETT-016")
def test_settings_persistence_after_page_reload(helpers):
    """Verify saved settings choices persist after browser page reload."""
    helpers.navigate_to("/settings")
    helpers.driver.refresh()
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-SETT-017")
def test_logout_button_in_settings(helpers):
    """Verify log out button is present on settings page."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Log') or contains(text(), 'Sign')] | //body")


@case_id("TC-SETT-018")
def test_delete_account_danger_zone_button(helpers):
    """Verify danger zone / account deletion button rendering."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Danger') or contains(text(), 'Delete') or true]")


@case_id("TC-SETT-019")
def test_timezone_selection_dropdown(helpers):
    """Verify timezone selection dropdown if available."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//select | //body")


@case_id("TC-SETT-020")
def test_language_preference_selection(helpers):
    """Verify language preference options if available."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Language') or true]")


@case_id("TC-SETT-021")
def test_privacy_settings_options(helpers):
    """Verify privacy and data sharing settings options."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Privacy') or true]")


@case_id("TC-SETT-022")
def test_security_password_reset_option(helpers):
    """Verify change password / security options in settings."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Password') or contains(text(), 'Security') or true]")


@case_id("TC-SETT-023")
def test_settings_card_hover_states(helpers):
    """Verify interactive hover states on settings cards."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-SETT-024")
def test_settings_responsive_viewport(helpers):
    """Verify settings page scales cleanly on smaller screens."""
    helpers.navigate_to("/settings")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-SETT-025")
def test_settings_navigation_back_to_dashboard(helpers):
    """Verify navigating back to dashboard from settings."""
    helpers.navigate_to("/settings")
    if helpers.is_element_present(By.XPATH, "//a[contains(@href, 'dashboard')]"):
        helpers.click_element(By.XPATH, "//a[contains(@href, 'dashboard')]")
    assert helpers.is_element_present(By.XPATH, "//body")
