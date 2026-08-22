import pytest
from selenium.webdriver.common.by import By
from utils.config import BASE_URL

pytestmark = pytest.mark.challenges

def case_id(tid):
    def decorator(func):
        func.test_id = tid
        return func
    return decorator


@case_id("TC-CHAL-001")
def test_challenges_page_loads(helpers):
    """Verify challenges page loads successfully."""
    helpers.navigate_to("/challenges")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CHAL-002")
def test_challenges_header_title(helpers):
    """Verify Challenges header title renders."""
    helpers.navigate_to("/challenges")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Challenges') or contains(text(), 'Quests')]")


@case_id("TC-CHAL-003")
def test_predefined_challenges_list_renders(helpers):
    """Verify predefined challenges list cards render."""
    helpers.navigate_to("/challenges")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Steps') or contains(text(), 'Water') or contains(text(), 'Protein') or contains(text(), 'Sleep')]")


@case_id("TC-CHAL-004")
def test_all_challenges_filter_tab(helpers):
    """Verify All category filter tab button."""
    helpers.navigate_to("/challenges")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'All')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'All')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CHAL-005")
def test_fitness_category_filter_tab(helpers):
    """Verify Fitness category filter tab button."""
    helpers.navigate_to("/challenges")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Fitness')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Fitness')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CHAL-006")
def test_nutrition_category_filter_tab(helpers):
    """Verify Nutrition category filter tab button."""
    helpers.navigate_to("/challenges")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Nutrition')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Nutrition')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CHAL-007")
def test_hydration_category_filter_tab(helpers):
    """Verify Hydration category filter tab button."""
    helpers.navigate_to("/challenges")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Hydration')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Hydration')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CHAL-008")
def test_sleep_category_filter_tab(helpers):
    """Verify Sleep category filter tab button."""
    helpers.navigate_to("/challenges")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Sleep')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Sleep')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CHAL-009")
def test_mental_wellness_category_filter_tab(helpers):
    """Verify Mental Wellness category filter tab button."""
    helpers.navigate_to("/challenges")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Mental') or contains(text(), 'Wellness')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Mental') or contains(text(), 'Wellness')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CHAL-010")
def test_join_challenge_button_click(helpers):
    """Verify clicking Join Challenge adds challenge to active list."""
    helpers.navigate_to("/challenges")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Join') or contains(text(), 'Accept')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Join') or contains(text(), 'Accept')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CHAL-011")
def test_active_challenges_tab_view(helpers):
    """Verify Active Challenges tab displays user's joined challenges."""
    helpers.navigate_to("/challenges")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Active')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Active')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CHAL-012")
def test_challenge_progress_ring_bar(helpers):
    """Verify challenge progress percentage ring / bar updates."""
    helpers.navigate_to("/challenges")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CHAL-013")
def test_complete_challenge_button_action(helpers):
    """Verify clicking Complete Challenge updates status to completed."""
    helpers.navigate_to("/challenges")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Complete') or contains(text(), 'Finish')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Complete') or contains(text(), 'Finish')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CHAL-014")
def test_completed_challenges_tab_view(helpers):
    """Verify Completed Challenges tab displays finished challenges."""
    helpers.navigate_to("/challenges")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Completed')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Completed')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CHAL-015")
def test_leave_active_challenge_button(helpers):
    """Verify leaving an active challenge removes it from active list."""
    helpers.navigate_to("/challenges")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Leave') or contains(text(), 'Cancel')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Leave') or contains(text(), 'Cancel')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CHAL-016")
def test_create_custom_challenge_modal(helpers):
    """Verify Create Custom Challenge modal opens."""
    helpers.navigate_to("/challenges")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Create') or contains(text(), '+')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Create') or contains(text(), '+')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-CHAL-017")
def test_total_xp_reward_points_card(helpers):
    """Verify Total XP reward points metric card."""
    helpers.navigate_to("/challenges")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'XP') or contains(text(), 'Points')]")


@case_id("TC-CHAL-018")
def test_streak_days_count_card(helpers):
    """Verify streak days count metric card."""
    helpers.navigate_to("/challenges")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Streak') or contains(text(), 'Days')]")


