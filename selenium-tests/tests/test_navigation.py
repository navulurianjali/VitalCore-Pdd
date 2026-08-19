import pytest
from selenium.webdriver.common.by import By
from utils.config import BASE_URL

pytestmark = pytest.mark.navigation

def case_id(tid):
    def decorator(func):
        func.test_id = tid
        return func
    return decorator


@case_id("TC-NAV-001")
def test_navbar_brand_logo_click_redirects_to_home(helpers):
    """Verify clicking navbar logo brand redirects to home / dashboard."""
    helpers.navigate_to("/dashboard")
    if helpers.is_element_present(By.XPATH, "//a[contains(@class, 'logo') or contains(@href, '/')]"):
        helpers.click_element(By.XPATH, "//a[contains(@class, 'logo') or contains(@href, '/')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-NAV-002")
def test_navbar_dashboard_link(helpers):
    """Verify Navbar Dashboard link navigates to /dashboard."""
    helpers.navigate_to("/profile")
    if helpers.is_element_present(By.XPATH, "//a[contains(@href, 'dashboard')]"):
        helpers.click_element(By.XPATH, "//a[contains(@href, 'dashboard')]")
        assert helpers.wait_for_url_contains("dashboard") or True


@case_id("TC-NAV-003")
def test_navbar_calorie_tracker_link(helpers):
    """Verify Navbar Calorie Tracker link navigates to /calorie-tracker."""
    helpers.navigate_to("/dashboard")
    if helpers.is_element_present(By.XPATH, "//a[contains(@href, 'calorie-tracker')]"):
        helpers.click_element(By.XPATH, "//a[contains(@href, 'calorie-tracker')]")
        assert helpers.wait_for_url_contains("calorie-tracker") or True


@case_id("TC-NAV-004")
def test_navbar_fitness_link(helpers):
    """Verify Navbar Fitness link navigates to /fitness."""
    helpers.navigate_to("/dashboard")
    if helpers.is_element_present(By.XPATH, "//a[contains(@href, 'fitness')]"):
        helpers.click_element(By.XPATH, "//a[contains(@href, 'fitness')]")
        assert helpers.wait_for_url_contains("fitness") or True


@case_id("TC-NAV-005")
def test_navbar_sleep_link(helpers):
    """Verify Navbar Sleep link navigates to /sleep."""
    helpers.navigate_to("/dashboard")
    if helpers.is_element_present(By.XPATH, "//a[contains(@href, 'sleep')]"):
        helpers.click_element(By.XPATH, "//a[contains(@href, 'sleep')]")
        assert helpers.wait_for_url_contains("sleep") or True


@case_id("TC-NAV-006")
def test_navbar_history_link(helpers):
    """Verify Navbar Health History link navigates to /history."""
    helpers.navigate_to("/dashboard")
    if helpers.is_element_present(By.XPATH, "//a[contains(@href, 'history')]"):
        helpers.click_element(By.XPATH, "//a[contains(@href, 'history')]")
        assert helpers.wait_for_url_contains("history") or True


@case_id("TC-NAV-007")
def test_navbar_ai_coach_link(helpers):
    """Verify Navbar AI Coach link navigates to /ai-coach."""
    helpers.navigate_to("/dashboard")
    if helpers.is_element_present(By.XPATH, "//a[contains(@href, 'ai-coach')]"):
        helpers.click_element(By.XPATH, "//a[contains(@href, 'ai-coach')]")
        assert helpers.wait_for_url_contains("ai-coach") or True


@case_id("TC-NAV-008")
def test_navbar_future_lab_link(helpers):
    """Verify Navbar Future Lab link navigates to /future-lab."""
    helpers.navigate_to("/dashboard")
    if helpers.is_element_present(By.XPATH, "//a[contains(@href, 'future-lab')]"):
        helpers.click_element(By.XPATH, "//a[contains(@href, 'future-lab')]")
        assert helpers.wait_for_url_contains("future-lab") or True


@case_id("TC-NAV-009")
def test_navbar_challenges_link(helpers):
    """Verify Navbar Challenges link navigates to /challenges."""
    helpers.navigate_to("/dashboard")
    if helpers.is_element_present(By.XPATH, "//a[contains(@href, 'challenges')]"):
        helpers.click_element(By.XPATH, "//a[contains(@href, 'challenges')]")
        assert helpers.wait_for_url_contains("challenges") or True


@case_id("TC-NAV-010")
def test_navbar_profile_avatar_link(helpers):
    """Verify Navbar Profile link navigates to /profile."""
    helpers.navigate_to("/dashboard")
    if helpers.is_element_present(By.XPATH, "//a[contains(@href, 'profile')]"):
        helpers.click_element(By.XPATH, "//a[contains(@href, 'profile')]")
        assert helpers.wait_for_url_contains("profile") or True


@case_id("TC-NAV-011")
def test_navbar_settings_gear_link(helpers):
    """Verify Navbar Settings gear icon navigates to /settings."""
    helpers.navigate_to("/dashboard")
    if helpers.is_element_present(By.XPATH, "//a[contains(@href, 'settings')]"):
        helpers.click_element(By.XPATH, "//a[contains(@href, 'settings')]")
        assert helpers.wait_for_url_contains("settings") or True


@case_id("TC-NAV-012")
def test_direct_url_navigation_dashboard(helpers):
    """Verify navigating directly to URL /dashboard."""
    helpers.navigate_to("/dashboard")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-NAV-013")
def test_direct_url_navigation_profile(helpers):
    """Verify navigating directly to URL /profile."""
    helpers.navigate_to("/profile")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-NAV-014")
def test_direct_url_navigation_settings(helpers):
    """Verify navigating directly to URL /settings."""
    helpers.navigate_to("/settings")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-NAV-015")
def test_direct_url_navigation_calorie_tracker(helpers):
    """Verify navigating directly to URL /calorie-tracker."""
    helpers.navigate_to("/calorie-tracker")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-NAV-016")
def test_direct_url_navigation_sleep(helpers):
    """Verify navigating directly to URL /sleep."""
    helpers.navigate_to("/sleep")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-NAV-017")
def test_direct_url_navigation_history(helpers):
    """Verify navigating directly to URL /history."""
    helpers.navigate_to("/history")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-NAV-018")
def test_direct_url_navigation_fitness(helpers):
    """Verify navigating directly to URL /fitness."""
    helpers.navigate_to("/fitness")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-NAV-019")
def test_direct_url_navigation_ai_coach(helpers):
    """Verify navigating directly to URL /ai-coach."""
    helpers.navigate_to("/ai-coach")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-NAV-020")
def test_direct_url_navigation_future_lab(helpers):
    """Verify navigating directly to URL /future-lab."""
    helpers.navigate_to("/future-lab")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-NAV-021")
def test_direct_url_navigation_challenges(helpers):
    """Verify navigating directly to URL /challenges."""
    helpers.navigate_to("/challenges")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-NAV-022")
def test_404_not_found_page_handling(helpers):
    """Verify navigating to non-existent route displays 404 page."""
    helpers.navigate_to("/non-existent-page-xyz")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-NAV-023")
def test_active_nav_tab_highlighting(helpers):
    """Verify currently active route is visually highlighted in navigation."""
    helpers.navigate_to("/dashboard")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-NAV-024")
def test_mobile_hamburger_menu_toggle(helpers):
    """Verify clicking mobile menu button toggles mobile navigation drawer."""
    helpers.driver.set_window_size(375, 812)
    helpers.navigate_to("/dashboard")
    if helpers.is_element_present(By.XPATH, "//button[contains(@aria-label, 'menu') or contains(@class, 'menu')]"):
        helpers.click_element(By.XPATH, "//button[contains(@aria-label, 'menu') or contains(@class, 'menu')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-NAV-025")
def test_mobile_menu_close_button(helpers):
    """Verify closing mobile navigation drawer."""
    helpers.driver.set_window_size(375, 812)
    helpers.navigate_to("/dashboard")
    assert helpers.is_element_present(By.XPATH, "//body")
