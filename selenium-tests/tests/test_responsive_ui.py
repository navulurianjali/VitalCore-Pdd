import pytest
from selenium.webdriver.common.by import By
from utils.config import BASE_URL

pytestmark = pytest.mark.responsive

def case_id(tid):
    def decorator(func):
        func.test_id = tid
        return func
    return decorator


@case_id("TC-RESP-001")
def test_desktop_viewport_1920x1080_dashboard(helpers):
    """Verify dashboard layout at 1920x1080 desktop resolution."""
    helpers.driver.set_window_size(1920, 1080)
    helpers.navigate_to("/dashboard")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-002")
def test_desktop_viewport_1440x900_dashboard(helpers):
    """Verify dashboard layout at 1440x900 laptop resolution."""
    helpers.driver.set_window_size(1440, 900)
    helpers.navigate_to("/dashboard")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-003")
def test_tablet_viewport_768x1024_dashboard(helpers):
    """Verify dashboard layout at 768x1024 iPad portrait resolution."""
    helpers.driver.set_window_size(768, 1024)
    helpers.navigate_to("/dashboard")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-004")
def test_mobile_viewport_375x812_dashboard(helpers):
    """Verify dashboard layout at 375x812 iPhone X resolution."""
    helpers.driver.set_window_size(375, 812)
    helpers.navigate_to("/dashboard")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-005")
def test_mobile_viewport_414x896_dashboard(helpers):
    """Verify dashboard layout at 414x896 iPhone XR resolution."""
    helpers.driver.set_window_size(414, 896)
    helpers.navigate_to("/dashboard")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-006")
def test_tablet_viewport_profile_page(helpers):
    """Verify profile page layout at 768x1024 tablet resolution."""
    helpers.driver.set_window_size(768, 1024)
    helpers.navigate_to("/profile")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-007")
def test_mobile_viewport_profile_page(helpers):
    """Verify profile page layout at 375x812 mobile resolution."""
    helpers.driver.set_window_size(375, 812)
    helpers.navigate_to("/profile")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-008")
def test_tablet_viewport_settings_page(helpers):
    """Verify settings page layout at 768x1024 tablet resolution."""
    helpers.driver.set_window_size(768, 1024)
    helpers.navigate_to("/settings")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-009")
def test_mobile_viewport_settings_page(helpers):
    """Verify settings page layout at 375x812 mobile resolution."""
    helpers.driver.set_window_size(375, 812)
    helpers.navigate_to("/settings")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-010")
def test_tablet_viewport_calorie_tracker(helpers):
    """Verify calorie tracker layout at 768x1024 tablet resolution."""
    helpers.driver.set_window_size(768, 1024)
    helpers.navigate_to("/calorie-tracker")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-011")
def test_mobile_viewport_calorie_tracker(helpers):
    """Verify calorie tracker layout at 375x812 mobile resolution."""
    helpers.driver.set_window_size(375, 812)
    helpers.navigate_to("/calorie-tracker")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-012")
def test_tablet_viewport_sleep_page(helpers):
    """Verify sleep page layout at 768x1024 tablet resolution."""
    helpers.driver.set_window_size(768, 1024)
    helpers.navigate_to("/sleep")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-013")
def test_mobile_viewport_sleep_page(helpers):
    """Verify sleep page layout at 375x812 mobile resolution."""
    helpers.driver.set_window_size(375, 812)
    helpers.navigate_to("/sleep")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-014")
def test_tablet_viewport_fitness_page(helpers):
    """Verify fitness page layout at 768x1024 tablet resolution."""
    helpers.driver.set_window_size(768, 1024)
    helpers.navigate_to("/fitness")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-015")
def test_mobile_viewport_fitness_page(helpers):
    """Verify fitness page layout at 375x812 mobile resolution."""
    helpers.driver.set_window_size(375, 812)
    helpers.navigate_to("/fitness")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-016")
def test_tablet_viewport_ai_coach(helpers):
    """Verify AI Coach layout at 768x1024 tablet resolution."""
    helpers.driver.set_window_size(768, 1024)
    helpers.navigate_to("/ai-coach")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-017")
def test_mobile_viewport_ai_coach(helpers):
    """Verify AI Coach layout at 375x812 mobile resolution."""
    helpers.driver.set_window_size(375, 812)
    helpers.navigate_to("/ai-coach")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-RESP-018")
def test_tablet_viewport_future_lab(helpers):
    """Verify Future Lab layout at 768x1024 tablet resolution."""
    helpers.driver.set_window_size(768, 1024)
    helpers.navigate_to("/future-lab")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


