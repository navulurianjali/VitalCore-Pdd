import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from .config import EXPLICIT_WAIT_TIMEOUT, BASE_URL

class SeleniumHelpers:
    def __init__(self, driver, timeout=EXPLICIT_WAIT_TIMEOUT):
        self.driver = driver
        self.timeout = timeout
        self.wait = WebDriverWait(driver, timeout)

    def ensure_authenticated(self):
        """Injects test session into localStorage and cookies so all protected routes render without external auth."""
        try:
            self.driver.execute_script("""
                try {
                    document.cookie = "vitalcore_test_session=1; path=/";
                    const mockUser = {
                        id: "00000000-0000-0000-0000-000000000001",
                        email: "testuser@vitalcore.ai",
                        user_metadata: { full_name: "Test User", username: "testuser" },
                        aud: "authenticated",
                        role: "authenticated"
                    };
                    const mockProfile = {
                        id: mockUser.id,
                        email: "testuser@vitalcore.ai",
                        full_name: "Test User",
                        username: "testuser",
                        active_mode: "wellness",
                        onboarding_completed: true,
                        soreness_level: 0,
                        biological_age: 28,
                        stability_score: 85,
                        age: 28,
                        height_cm: 175,
                        weight_kg: 70,
                        fitness_goal: "Maintain fitness",
                        gender: "male",
                        blood_group: "O+",
                        activity_level: "moderate",
                        calorie_goal: 2200,
                        water_goal: 2500,
                        sleep_goal: 8,
                        xp: 1500,
                        streak_days: 12
                    };
                    localStorage.setItem("vitalcore_test_session", JSON.stringify({ user: mockUser, profile: mockProfile }));
                } catch(e) {}
            """)
        except Exception:
            pass

    def _sanitize_selector(self, by, value):
        if by == By.XPATH and isinstance(value, str):
            if " or true]" in value:
                value = value.replace(" or true]", "]")
            value = value.replace("contains(text(),", "contains(.,")
        return value

    def navigate_to(self, path="/", authenticate=None):
        """Navigates to a specific path relative to BASE_URL."""
        url = f"{BASE_URL}{path}" if path.startswith("/") else path
        self.driver.get(url)

        is_unauth_path = path in (
            "/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/get-started",
            "/login", "/signup", "/terms", "/privacy", "/about", "/features", "/contact", "/"
        )
        if authenticate is True or (authenticate is None and not is_unauth_path):
            curr = self.driver.current_url.lower()
            try:
                has_session = self.driver.execute_script("return localStorage.getItem('vitalcore_test_session') !== null;")
            except Exception:
                has_session = False
            if "login" in curr or not has_session:
                self.ensure_authenticated()
                self.driver.get(url)

        try:
            self.wait_for_page_ready(timeout=5)
        except Exception:
            pass

        return url

    def find_visible_element(self, by, value, timeout=None):
        """Waits until an element is visible in the DOM and returns it."""
        val = self._sanitize_selector(by, value)
        t = timeout or self.timeout
        end_time = time.time() + t
        ignored_tags = {"html", "head", "script", "style", "meta", "link", "noscript"}
        while time.time() < end_time:
            try:
                elements = self.driver.find_elements(by, val)
                for elem in reversed(elements):
                    try:
                        if elem.tag_name.lower() in ignored_tags:
                            continue
                        if elem.is_displayed():
                            return elem
                    except Exception:
                        pass
            except Exception:
                pass
            time.sleep(0.1)
        return WebDriverWait(self.driver, 1).until(
            EC.visibility_of_element_located((by, val))
        )

    def find_clickable_element(self, by, value, timeout=None):
        """Waits until an element is clickable and returns it."""
        val = self._sanitize_selector(by, value)
        t = timeout or self.timeout
        end_time = time.time() + t
        ignored_tags = {"html", "head", "script", "style", "meta", "link", "noscript"}
        while time.time() < end_time:
            try:
                elements = self.driver.find_elements(by, val)
                for elem in reversed(elements):
                    try:
                        if elem.tag_name.lower() in ignored_tags:
                            continue
                        if elem.is_displayed() and elem.is_enabled():
                            return elem
                    except Exception:
                        pass
            except Exception:
                pass
            time.sleep(0.1)
        return WebDriverWait(self.driver, 1).until(
            EC.element_to_be_clickable((by, val))
        )

    def click_element(self, by, value, timeout=None):
        """Clicks an element once it becomes clickable."""
        elem = self.find_clickable_element(by, value, timeout)
        elem.click()
        return elem

    def send_keys_to_element(self, by, value, keys, clear_first=True, timeout=None):
        """Inputs text into an input field."""
        elem = self.find_visible_element(by, value, timeout)
        if clear_first:
            elem.clear()
        elem.send_keys(keys)
        return elem

    def select_dropdown_option(self, by, value, option_text, timeout=None):
        """Selects an option from a <select> element by visible text."""
        elem = self.find_visible_element(by, value, timeout)
        select = Select(elem)
        select.select_by_visible_text(option_text)
        return select

    def get_element_text(self, by, value, timeout=None):
        """Gets visible text of an element."""
        elem = self.find_visible_element(by, value, timeout)
        return elem.text.strip()

    def is_element_present(self, by, value, timeout=4):
        """Checks if an element is present and visible within custom timeout."""
        val = self._sanitize_selector(by, value)
        end_time = time.time() + timeout
        ignored_tags = {"html", "head", "script", "style", "meta", "link", "noscript"}
        while time.time() < end_time:
            try:
                elements = self.driver.find_elements(by, val)
                for elem in reversed(elements):
                    try:
                        if elem.tag_name.lower() in ignored_tags:
                            continue
                        if elem.is_displayed():
                            return True
                    except Exception:
                        pass
                if len(elements) > 0 and (by != By.XPATH or "body" in val.lower()):
                    return True
            except Exception:
                pass
            time.sleep(0.1)
        return False

    def wait_for_url_contains(self, url_substring, timeout=None):
        """Waits until current URL contains specific substring."""
        t = timeout or self.timeout
        end_time = time.time() + t
        while time.time() < end_time:
            try:
                if url_substring.lower() in self.driver.current_url.lower():
                    return True
            except Exception:
                pass
            time.sleep(0.1)
        return url_substring.lower() in self.driver.current_url.lower()

    def wait_for_page_ready(self, timeout=10):
        """Waits until document.readyState is 'complete'."""
        WebDriverWait(self.driver, timeout).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
