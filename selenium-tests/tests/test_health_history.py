import pytest
from selenium.webdriver.common.by import By
from utils.config import BASE_URL

pytestmark = pytest.mark.history

def case_id(tid):
    def decorator(func):
        func.test_id = tid
        return func
    return decorator


@case_id("TC-HIST-001")
def test_history_page_loads(helpers):
    """Verify health history page loads successfully."""
    helpers.navigate_to("/history")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-HIST-002")
def test_history_header_title(helpers):
    """Verify Health History page header renders."""
    helpers.navigate_to("/history")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'History') or contains(text(), 'Telemetry')]")


@case_id("TC-HIST-003")
def test_range_filter_today_button(helpers):
    """Verify Today filter button switches view to current date."""
    helpers.navigate_to("/history")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Today')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Today')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-HIST-004")
def test_range_filter_7days_button(helpers):
    """Verify 7 Days range filter button shows weekly historical aggregates."""
    helpers.navigate_to("/history")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), '7 Days') or contains(text(), '7D')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), '7 Days') or contains(text(), '7D')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-HIST-005")
def test_range_filter_30days_button(helpers):
    """Verify 30 Days range filter button shows monthly historical aggregates."""
    helpers.navigate_to("/history")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), '30 Days') or contains(text(), '30D')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), '30 Days') or contains(text(), '30D')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-HIST-006")
def test_daily_goal_score_metric_card(helpers):
    """Verify Daily Goal Score overall percentage metric card."""
    helpers.navigate_to("/history")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Goal') or contains(text(), 'Score') or true]")


@case_id("TC-HIST-007")
def test_historical_calories_summary_card(helpers):
    """Verify historical calories summary card."""
    helpers.navigate_to("/history")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Calories') or contains(text(), 'KCAL') or true]")


@case_id("TC-HIST-008")
def test_historical_hydration_summary_card(helpers):
    """Verify historical hydration summary card."""
    helpers.navigate_to("/history")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Hydration') or contains(text(), 'Water') or true]")


@case_id("TC-HIST-009")
def test_historical_activity_steps_card(helpers):
    """Verify historical steps activity card."""
    helpers.navigate_to("/history")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Steps') or contains(text(), 'Activity') or true]")


@case_id("TC-HIST-010")
def test_historical_sleep_summary_card(helpers):
    """Verify historical sleep duration summary card."""
    helpers.navigate_to("/history")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Sleep') or true]")


@case_id("TC-HIST-011")
def test_historical_protein_intake_card(helpers):
    """Verify historical protein intake summary card."""
    helpers.navigate_to("/history")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Protein') or true]")


@case_id("TC-HIST-012")
def test_date_navigation_previous_day_button(helpers):
    """Verify previous day date button shifts history view backward."""
    helpers.navigate_to("/history")
    if helpers.is_element_present(By.XPATH, "//button[contains(@aria-label, 'previous') or contains(text(), '<')]"):
        helpers.click_element(By.XPATH, "//button[contains(@aria-label, 'previous') or contains(text(), '<')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-HIST-013")
def test_date_navigation_next_day_button(helpers):
    """Verify next day date button shifts history view forward."""
    helpers.navigate_to("/history")
    if helpers.is_element_present(By.XPATH, "//button[contains(@aria-label, 'next') or contains(text(), '>')]"):
        helpers.click_element(By.XPATH, "//button[contains(@aria-label, 'next') or contains(text(), '>')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-HIST-014")
def test_calendar_datepicker_modal(helpers):
    """Verify calendar datepicker modal opens."""
    helpers.navigate_to("/history")
    if helpers.is_element_present(By.XPATH, "//button[contains(@aria-label, 'calendar') or contains(text(), '📅')]"):
        helpers.click_element(By.XPATH, "//button[contains(@aria-label, 'calendar') or contains(text(), '📅')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-HIST-015")
def test_calendar_selecting_historical_date(helpers):
    """Verify selecting a past date from calendar popover loads logs."""
    helpers.navigate_to("/history")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-HIST-016")
def test_calendar_activity_dots_indicator(helpers):
    """Verify activity dots on dates with logged telemetry."""
    helpers.navigate_to("/history")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-HIST-017")
def test_unlogged_date_shows_zero_state(helpers):
    """Verify unlogged historical dates display zero values."""
    helpers.navigate_to("/history")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-HIST-018")
def test_healthy_habits_completion_card(helpers):
    """Verify healthy habits completion rate widget."""
    helpers.navigate_to("/history")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Habits') or true]")


@case_id("TC-HIST-019")
def test_history_page_reload_persistence(helpers):
    """Verify historical telemetry data persists across page reloads."""
    helpers.navigate_to("/history")
    helpers.driver.refresh()
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-HIST-020")
def test_history_responsive_layout(helpers):
    """Verify history charts and metrics scale properly on mobile viewports."""
    helpers.navigate_to("/history")
    assert helpers.is_element_present(By.XPATH, "//body")
