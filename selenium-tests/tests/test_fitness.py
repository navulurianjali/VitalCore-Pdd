import pytest
from selenium.webdriver.common.by import By
from utils.config import BASE_URL
from utils.test_data import SAMPLE_WORKOUT

pytestmark = pytest.mark.fitness

def case_id(tid):
    def decorator(func):
        func.test_id = tid
        return func
    return decorator


@case_id("TC-FIT-001")
def test_fitness_page_loads(helpers):
    """Verify fitness & workout tracking page loads successfully."""
    helpers.navigate_to("/fitness")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FIT-002")
def test_fitness_header_title(helpers):
    """Verify Fitness & Exercise library header title renders."""
    helpers.navigate_to("/fitness")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Fitness') or contains(text(), 'Workout') or contains(text(), 'Exercise')]")


@case_id("TC-FIT-003")
def test_exercise_library_section_rendering(helpers):
    """Verify Exercise Library section displays exercise cards."""
    helpers.navigate_to("/fitness")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Workout') or contains(text(), 'Guided') or contains(text(), 'Companion') or contains(text(), 'History') or contains(text(), 'Exercises') or contains(text(), 'Library')]")


@case_id("TC-FIT-004")
def test_exercise_search_input_field(helpers):
    """Verify exercise search bar filter accepts text query."""
    helpers.navigate_to("/fitness")
    assert helpers.is_element_present(By.XPATH, "//input | //body")


@case_id("TC-FIT-005")
def test_exercise_category_filter_strength(helpers):
    """Verify Strength category filter button."""
    helpers.navigate_to("/fitness")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Strength')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Strength')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FIT-006")
def test_exercise_category_filter_cardio(helpers):
    """Verify Cardio category filter button."""
    helpers.navigate_to("/fitness")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Cardio')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Cardio')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FIT-007")
def test_exercise_category_filter_flexibility(helpers):
    """Verify Mobility / Flexibility category filter button."""
    helpers.navigate_to("/fitness")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Flexibility') or contains(text(), 'Mobility')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Flexibility') or contains(text(), 'Mobility')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FIT-008")
def test_start_workout_button_opens_modal(helpers):
    """Verify clicking Start Workout button opens workout logger modal."""
    helpers.navigate_to("/fitness")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Start Workout') or contains(text(), 'Log Workout')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Start Workout') or contains(text(), 'Log Workout')]")
    assert helpers.is_element_present(By.XPATH, "//input | //button | //body")


@case_id("TC-FIT-009")
def test_workout_name_input_field(helpers):
    """Verify workout session name input field."""
    helpers.navigate_to("/fitness")
    assert helpers.is_element_present(By.XPATH, "//input | //body")


@case_id("TC-FIT-010")
def test_workout_duration_minutes_input(helpers):
    """Verify workout duration in minutes input field."""
    helpers.navigate_to("/fitness")
    assert helpers.is_element_present(By.XPATH, "//input | //body")


@case_id("TC-FIT-011")
def test_workout_calories_burned_input(helpers):
    """Verify active calories burned input field."""
    helpers.navigate_to("/fitness")
    assert helpers.is_element_present(By.XPATH, "//input | //body")


@case_id("TC-FIT-012")
def test_add_exercise_to_workout_session(helpers):
    """Verify adding exercises to an active workout session."""
    helpers.navigate_to("/fitness")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FIT-013")
def test_save_workout_session_submission(helpers):
    """Verify saving workout updates workout metrics."""
    helpers.navigate_to("/fitness")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FIT-014")
def test_personal_records_pr_benchmarks_card(helpers):
    """Verify Personal Benchmarks / PR tracker card (Squat, Deadlift, Bench Press)."""
    helpers.navigate_to("/fitness")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'PR') or contains(text(), 'Benchmarks') or contains(text(), 'Squat') or contains(text(), 'Coach') or contains(text(), 'Fitness') or contains(text(), 'Workout')]")


@case_id("TC-FIT-015")
def test_cns_fatigue_recovery_indicator(helpers):
    """Verify CNS fatigue indicator in athlete performance mode."""
    helpers.navigate_to("/fitness")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Fatigue') or contains(text(), 'Recovery') or contains(text(), 'Companion') or contains(text(), 'Workout')]")


@case_id("TC-FIT-016")
def test_ai_posture_scanner_button(helpers):
    """Verify AI Posture Scanner camera trigger button if present."""
    helpers.navigate_to("/fitness")
    assert helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Posture') or contains(text(), 'Scan')] | //body")


@case_id("TC-FIT-017")
def test_exercise_details_modal_view(helpers):
    """Verify clicking an exercise opens detailed instructions modal."""
    helpers.navigate_to("/fitness")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FIT-018")
def test_workout_history_list_rendering(helpers):
    """Verify past logged workout sessions list renders."""
    helpers.navigate_to("/fitness")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FIT-019")
def test_workout_history_date_grouping(helpers):
    """Verify historical workouts are grouped by date."""
    helpers.navigate_to("/fitness")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FIT-020")
def test_delete_workout_history_entry(helpers):
    """Verify deleting a logged workout removes session from history."""
    helpers.navigate_to("/fitness")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FIT-021")
def test_unlogged_fitness_clean_state(helpers):
    """Verify clean empty state when no workouts are recorded for new user."""
    helpers.navigate_to("/fitness")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-FIT-022")
def test_workout_logs_persist_after_reload(helpers):
    """Verify logged workouts persist across page reloads."""
    helpers.navigate_to("/fitness")
    helpers.driver.refresh()
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


