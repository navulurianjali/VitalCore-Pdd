"""Base Page Object Model providing reusable Selenium interactions and explicit waits."""

import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException

class BasePage:
    def __init__(self, driver, base_url="http://localhost:3000"):
        self.driver = driver
        self.base_url = base_url.rstrip('/')
        self.timeout = 10

    def navigate_to(self, path=""):
        target = f"{self.base_url}{path}"
        try:
            self.driver.get(target)
        except Exception as e:
            print(f"Navigation error to {target}: {e}")
        time.sleep(0.5)

    def find(self, by, locator, timeout=None):
        t = timeout or self.timeout
        return WebDriverWait(self.driver, t).until(
            EC.presence_of_element_located((by, locator))
        )

    def find_visible(self, by, locator, timeout=None):
        t = timeout or self.timeout
        return WebDriverWait(self.driver, t).until(
            EC.visibility_of_element_located((by, locator))
        )

    def find_all(self, by, locator):
        return self.driver.find_elements(by, locator)

    def click(self, by, locator, timeout=None):
        t = timeout or self.timeout
        elem = WebDriverWait(self.driver, t).until(
            EC.element_to_be_clickable((by, locator))
        )
        try:
            elem.click()
        except ElementClickInterceptedException:
            self.driver.execute_script("arguments[0].click();", elem)

    def send_keys(self, by, locator, text, clear=True, timeout=None):
        elem = self.find_visible(by, locator, timeout)
        if clear:
            elem.clear()
        elem.send_keys(text)

    def get_text(self, by, locator, timeout=None):
        return self.find_visible(by, locator, timeout).text.strip()

    def is_visible(self, by, locator, timeout=3):
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located((by, locator))
            )
            return True
        except (TimeoutException, NoSuchElementException):
            return False

    def is_present(self, by, locator, timeout=3):
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, locator))
            )
            return True
        except (TimeoutException, NoSuchElementException):
            return False

    def get_current_url(self):
        return self.driver.current_url

    def get_title(self):
        return self.driver.title

    def scroll_into_view(self, by, locator):
        elem = self.find(by, locator)
        self.driver.execute_script("arguments[0].scrollIntoView(true);", elem)
        time.sleep(0.3)
