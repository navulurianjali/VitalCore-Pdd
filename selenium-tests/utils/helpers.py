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

    def navigate_to(self, path="/"):
        """Navigates to a specific path relative to BASE_URL."""
        url = f"{BASE_URL}{path}" if path.startswith("/") else path
        self.driver.get(url)
        return url

    def find_visible_element(self, by, value, timeout=None):
        """Waits until an element is visible in the DOM and returns it."""
        t = timeout or self.timeout
        return WebDriverWait(self.driver, t).until(
            EC.visibility_of_element_located((by, value))
        )

    def find_clickable_element(self, by, value, timeout=None):
        """Waits until an element is clickable and returns it."""
        t = timeout or self.timeout
        return WebDriverWait(self.driver, t).until(
            EC.element_to_be_clickable((by, value))
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

    def is_element_present(self, by, value, timeout=2):
        """Checks if an element is present and visible within custom timeout."""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located((by, value))
            )
            return True
        except (TimeoutException, NoSuchElementException):
            return False

    def wait_for_url_contains(self, url_substring, timeout=None):
        """Waits until current URL contains specific substring."""
        t = timeout or self.timeout
        return WebDriverWait(self.driver, t).until(
            EC.url_contains(url_substring)
        )

    def wait_for_page_ready(self, timeout=10):
        """Waits until document.readyState is 'complete'."""
        WebDriverWait(self.driver, timeout).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
