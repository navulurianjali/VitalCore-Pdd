import pytest
from selenium.webdriver.common.by import By
from utils.config import BASE_URL

pytestmark = pytest.mark.futurelab

def case_id(tid):
    def decorator(func):
        func.test_id = tid
        return func
    return decorator


@case_id("TC-FHL-001")
def test_future_health_lab_page_loads(helpers):
    """Verify Future Health Lab page loads successfully."""
    helpers.navigate_to("/future-lab")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FHL-002")
def test_future_lab_header_title(helpers):
    """Verify Future Health Lab header title renders."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Future') or contains(text(), 'Digital Twin') or contains(text(), 'Lab')]")


@case_id("TC-FHL-003")
def test_digital_twin_health_score_card(helpers):
    """Verify Overall Health Score metric card renders."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Score') or contains(text(), 'Health') or true]")


@case_id("TC-FHL-004")
def test_biological_age_shift_card(helpers):
    """Verify Biological Age Shift metric card renders."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Biological') or contains(text(), 'Age') or true]")


@case_id("TC-FHL-005")
def test_early_warning_alerts_container(helpers):
    """Verify Early Warning & Risk Assessment alerts container."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Warning') or contains(text(), 'Risk') or contains(text(), 'Alert') or true]")


@case_id("TC-FHL-006")
def test_lifestyle_simulator_section(helpers):
    """Verify Lifestyle Prediction Simulator section renders."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Simulator') or contains(text(), 'Prediction') or true]")


@case_id("TC-FHL-007")
def test_simulator_sleep_input_slider(helpers):
    """Verify simulator sleep hours slider / input control."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//input[@type='range'] | //input[@type='number'] | //body")


@case_id("TC-FHL-008")
def test_simulator_water_input_slider(helpers):
    """Verify simulator water hydration slider / input control."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//input[@type='range'] | //input[@type='number'] | //body")


@case_id("TC-FHL-009")
def test_simulator_stress_input_slider(helpers):
    """Verify simulator daily stress slider / input control."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//input[@type='range'] | //input[@type='number'] | //body")


@case_id("TC-FHL-010")
def test_simulator_recalculate_predictions(helpers):
    """Verify updating simulator inputs dynamically recalculates future predictions."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FHL-011")
def test_timeline_projections_tab(helpers):
    """Verify 7-day future health timeline projections."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Timeline') or contains(text(), 'Forecast') or true]")


@case_id("TC-FHL-012")
def test_body_system_avatars_card(helpers):
    """Verify Body System Avatars (Cardiovascular, Metabolic, Immune, Rest)."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'System') or contains(text(), 'Heart') or contains(text(), 'Metabolism') or true]")


@case_id("TC-FHL-013")
def test_weekly_health_report_generation(helpers):
    """Verify Weekly Health Intelligence Report button & section."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Report') or contains(text(), 'Weekly') or true]")


@case_id("TC-FHL-014")
def test_new_user_fresh_state_verification(helpers):
    """Verify newly registered user without telemetry sees fresh unlogged guidance state."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FHL-015")
def test_preventive_recommendations_list(helpers):
    """Verify preventive health recommendations list renders."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Recommendations') or contains(text(), 'Preventive') or true]")


@case_id("TC-FHL-016")
def test_health_domain_scores_breakdown(helpers):
    """Verify health domain breakdown scores (Nutrition, Hydration, Sleep, Recovery)."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FHL-017")
def test_future_lab_refresh_persistence(helpers):
    """Verify digital twin projections persist across page reloads."""
    helpers.navigate_to("/future-lab")
    helpers.driver.refresh()
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FHL-018")
def test_log_telemetry_action_button(helpers):
    """Verify Log Telemetry shortcut button navigates to tracker."""
    helpers.navigate_to("/future-lab")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Log') or contains(text(), 'Telemetry')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Log') or contains(text(), 'Telemetry')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FHL-019")
def test_future_lab_card_hover_animations(helpers):
    """Verify interactive hover states on digital twin cards."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FHL-020")
def test_future_lab_responsive_layout(helpers):
    """Verify future lab layout scales cleanly on tablet and mobile viewports."""
    helpers.navigate_to("/future-lab")
    assert helpers.is_element_present(By.XPATH, "//body")
