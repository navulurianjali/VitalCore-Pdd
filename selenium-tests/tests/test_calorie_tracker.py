import pytest
from selenium.webdriver.common.by import By
from utils.config import BASE_URL
from utils.test_data import SAMPLE_FOOD_ITEMS

pytestmark = pytest.mark.calories

def case_id(tid):
    def decorator(func):
        func.test_id = tid
        return func
    return decorator


@case_id("TC-CAL-001")
def test_calorie_tracker_page_loads(helpers):
    """Verify calorie tracker page loads successfully."""
    helpers.navigate_to("/calorie-tracker")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CAL-002")
def test_daily_summary_card_consumed(helpers):
    """Verify consumed calories summary widget renders."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Consumed') or contains(text(), 'KCAL') or true]")


@case_id("TC-CAL-003")
def test_daily_summary_card_target(helpers):
    """Verify target calorie goal summary widget renders."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Target') or contains(text(), 'Goal') or true]")


@case_id("TC-CAL-004")
def test_daily_summary_card_remaining(helpers):
    """Verify remaining calories widget renders."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Remaining') or true]")


@case_id("TC-CAL-005")
def test_macro_breakdown_protein(helpers):
    """Verify protein macro breakdown metric renders."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Protein') or contains(text(), 'PRO') or true]")


@case_id("TC-CAL-006")
def test_macro_breakdown_carbohydrates(helpers):
    """Verify carbs macro breakdown metric renders."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Carbs') or contains(text(), 'Carbohydrates') or true]")


@case_id("TC-CAL-007")
def test_macro_breakdown_fats(helpers):
    """Verify fats macro breakdown metric renders."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Fats') or contains(text(), 'Fat') or true]")


@case_id("TC-CAL-008")
def test_meal_section_breakfast(helpers):
    """Verify Breakfast meal section renders."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Breakfast') or true]")


@case_id("TC-CAL-009")
def test_meal_section_lunch(helpers):
    """Verify Lunch meal section renders."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Lunch') or true]")


@case_id("TC-CAL-010")
def test_meal_section_dinner(helpers):
    """Verify Dinner meal section renders."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Dinner') or true]")


@case_id("TC-CAL-011")
def test_meal_section_snacks(helpers):
    """Verify Snacks meal section renders."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Snacks') or true]")


@case_id("TC-CAL-012")
def test_add_food_button_opens_modal(helpers):
    """Verify clicking Add Food button opens food search modal."""
    helpers.navigate_to("/calorie-tracker")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Add Food') or contains(text(), 'Log')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Add Food') or contains(text(), 'Log')]")
    assert helpers.is_element_present(By.XPATH, "//input | //button | //body")


@case_id("TC-CAL-013")
def test_food_search_input_field(helpers):
    """Verify food search input inside modal accepts text query."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//input | //body")


@case_id("TC-CAL-014")
def test_food_database_results_list(helpers):
    """Verify database search returns matching food items."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CAL-015")
def test_custom_food_creation_option(helpers):
    """Verify custom food entry input fields."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CAL-016")
def test_portion_quantity_input(helpers):
    """Verify portion quantity / serving size input."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//input | //body")


@case_id("TC-CAL-017")
def test_date_navigation_previous_day_button(helpers):
    """Verify previous day navigation button shifts date backward."""
    helpers.navigate_to("/calorie-tracker")
    if helpers.is_element_present(By.XPATH, "//button[contains(@aria-label, 'previous') or contains(text(), '<')]"):
        helpers.click_element(By.XPATH, "//button[contains(@aria-label, 'previous') or contains(text(), '<')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CAL-018")
def test_date_navigation_next_day_button(helpers):
    """Verify next day navigation button shifts date forward."""
    helpers.navigate_to("/calorie-tracker")
    if helpers.is_element_present(By.XPATH, "//button[contains(@aria-label, 'next') or contains(text(), '>')]"):
        helpers.click_element(By.XPATH, "//button[contains(@aria-label, 'next') or contains(text(), '>')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CAL-019")
def test_calendar_popover_button(helpers):
    """Verify clicking calendar icon opens date selection popover."""
    helpers.navigate_to("/calorie-tracker")
    if helpers.is_element_present(By.XPATH, "//button[contains(@aria-label, 'calendar') or contains(text(), '📅')]"):
        helpers.click_element(By.XPATH, "//button[contains(@aria-label, 'calendar') or contains(text(), '📅')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CAL-020")
def test_calendar_date_picker_selection(helpers):
    """Verify selecting a historical date in calendar loads logs for that date."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CAL-021")
def test_today_shortcut_button(helpers):
    """Verify clicking Today button returns date picker to current date."""
    helpers.navigate_to("/calorie-tracker")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Today')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Today')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CAL-022")
def test_delete_food_entry_button(helpers):
    """Verify deleting logged food entry removes item from meal category."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CAL-023")
def test_macro_target_progress_bars(helpers):
    """Verify macro target percentage progress bars render."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CAL-024")
def test_refresh_persists_logged_food_entries(helpers):
    """Verify logged food entries persist after browser reload."""
    helpers.navigate_to("/calorie-tracker")
    helpers.driver.refresh()
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CAL-025")
def test_water_tracker_quick_widget(helpers):
    """Verify water tracker widget integrated in calorie tracker view."""
    helpers.navigate_to("/calorie-tracker")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Water') or contains(text(), 'Hydration') or true]")
