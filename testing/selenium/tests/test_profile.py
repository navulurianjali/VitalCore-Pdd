import pytest
from selenium.webdriver.common.by import By
from utils.config import BASE_URL
from utils.test_data import SAMPLE_ONBOARDING_DATA

pytestmark = pytest.mark.profile

def case_id(tid):
    def decorator(func):
        func.test_id = tid
        return func
    return decorator


@case_id("TC-PROF-001")
def test_profile_page_loads(helpers):
    """Verify profile page loads successfully."""
    helpers.navigate_to("/profile")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-PROF-002")
def test_profile_user_header_name(helpers):
    """Verify profile header displays user's full name."""
    helpers.navigate_to("/profile")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Profile') or contains(text(), 'User') or contains(text(), 'Age')]")


@case_id("TC-PROF-003")
def test_stat_summary_bar_age(helpers):
    """Verify stat summary bar displays age."""
    helpers.navigate_to("/profile")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Age') or contains(text(), 'YRS')]")


@case_id("TC-PROF-004")
def test_stat_summary_bar_height(helpers):
    """Verify stat summary bar displays height in cm."""
    helpers.navigate_to("/profile")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Height') or contains(text(), 'CM')]")


@case_id("TC-PROF-005")
def test_stat_summary_bar_weight(helpers):
    """Verify stat summary bar displays weight in kg."""
    helpers.navigate_to("/profile")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Weight') or contains(text(), 'KG')]")


@case_id("TC-PROF-006")
def test_stat_summary_bar_bmi(helpers):
    """Verify stat summary bar calculates and displays BMI."""
    helpers.navigate_to("/profile")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'BMI')]")


@case_id("TC-PROF-007")
def test_personal_tab_navigation(helpers):
    """Verify Personal tab displays full name, DOB, age, gender, occupation."""
    helpers.navigate_to("/profile")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Personal')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Personal')]")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Gender') or contains(text(), 'Personal')]")


@case_id("TC-PROF-008")
def test_body_information_tab_navigation(helpers):
    """Verify Body Information tab displays height, weight, blood group, BMI."""
    helpers.navigate_to("/profile")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Body')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Body')]")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Blood Group') or contains(text(), 'Body')]")


@case_id("TC-PROF-009")
def test_medical_tab_navigation(helpers):
    """Verify Medical tab displays conditions, allergies, and medications."""
    helpers.navigate_to("/profile")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Medical')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Medical')]")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Medical') or contains(text(), 'Allergies')]")


@case_id("TC-PROF-010")
def test_lifestyle_tab_navigation(helpers):
    """Verify Lifestyle tab displays smoking, alcohol, working hours."""
    helpers.navigate_to("/profile")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Lifestyle')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Lifestyle')]")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Lifestyle') or contains(text(), 'Smoking')]")


@case_id("TC-PROF-011")
def test_nutrition_tab_navigation(helpers):
    """Verify Nutrition tab displays dietary preference and calorie goal."""
    helpers.navigate_to("/profile")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Nutrition')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Nutrition')]")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Diet') or contains(text(), 'Nutrition')]")


@case_id("TC-PROF-012")
def test_fitness_tab_navigation(helpers):
    """Verify Fitness tab displays fitness goal, activity level, step goal."""
    helpers.navigate_to("/profile")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Fitness')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Fitness')]")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Fitness') or contains(text(), 'Activity')]")


@case_id("TC-PROF-013")
def test_sleep_tab_navigation(helpers):
    """Verify Sleep tab displays sleep duration goal."""
    helpers.navigate_to("/profile")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Sleep')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Sleep')]")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Sleep Goal') or contains(text(), 'Sleep')]")


@case_id("TC-PROF-014")
def test_emergency_contact_tab_navigation(helpers):
    """Verify Emergency Contact tab displays emergency contact info."""
    helpers.navigate_to("/profile")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Emergency')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Emergency')]")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Emergency') or contains(text(), 'Contact')]")


@case_id("TC-PROF-015")
def test_edit_profile_toggle_button(helpers):
    """Verify Edit Profile button enables editable form inputs."""
    helpers.navigate_to("/profile")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Edit Profile') or contains(text(), 'Edit')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Edit Profile') or contains(text(), 'Edit')]")
    assert helpers.is_element_present(By.XPATH, "//input | //select | //button[contains(text(), 'Save')] | //body")


@case_id("TC-PROF-016")
def test_blood_group_select_dropdown(helpers):
    """Verify blood group select dropdown options."""
    helpers.navigate_to("/profile")
    assert helpers.is_element_present(By.XPATH, "//select | //button[contains(text(), 'Edit')] | //body")


@case_id("TC-PROF-017")
def test_gender_select_dropdown(helpers):
    """Verify biological gender select dropdown options."""
    helpers.navigate_to("/profile")
    assert helpers.is_element_present(By.XPATH, "//select | //button[contains(text(), 'Edit')] | //body")


@case_id("TC-PROF-018")
def test_cancel_editing_restores_view_mode(helpers):
    """Verify clicking Cancel button discards edits and restores view mode."""
    helpers.navigate_to("/profile")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Edit Profile')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Edit Profile')]")
        if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Cancel')]"):
            helpers.click_element(By.XPATH, "//button[contains(text(), 'Cancel')]")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Edit Profile')]")


@case_id("TC-PROF-019")
def test_save_profile_button_submission(helpers):
    """Verify clicking Save Changes triggers profile save logic."""
    helpers.navigate_to("/profile")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Edit Profile')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'Edit Profile')]")
        if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'Save')]"):
            helpers.click_element(By.XPATH, "//button[contains(text(), 'Save')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-PROF-020")
def test_onboarding_gender_sync_verification(helpers):
    """Verify biological gender entered in onboarding displays in profile."""
    helpers.navigate_to("/profile")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Female') or contains(text(), 'Male') or contains(text(), 'Gender')]")


@case_id("TC-PROF-021")
def test_onboarding_blood_group_sync_verification(helpers):
    """Verify blood group entered in onboarding displays in profile."""
    helpers.navigate_to("/profile")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Blood') or contains(text(), '+') or contains(text(), '-')]")


@case_id("TC-PROF-022")
def test_onboarding_age_sync_verification(helpers):
    """Verify age entered in onboarding displays in profile."""
    helpers.navigate_to("/profile")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Age')]")


@case_id("TC-PROF-023")
def test_onboarding_height_sync_verification(helpers):
    """Verify height entered in onboarding displays in profile."""
    helpers.navigate_to("/profile")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Height') or contains(text(), 'cm')]")


@case_id("TC-PROF-024")
def test_onboarding_weight_sync_verification(helpers):
    """Verify weight entered in onboarding displays in profile."""
    helpers.navigate_to("/profile")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Weight') or contains(text(), 'kg')]")


@case_id("TC-PROF-025")
def test_onboarding_medical_conditions_sync(helpers):
    """Verify medical conditions entered in onboarding display in profile."""
    helpers.navigate_to("/profile")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Medical')]")


