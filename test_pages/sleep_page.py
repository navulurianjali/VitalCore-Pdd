"""Page Object Model for Sleep Page (/sleep)."""

from selenium.webdriver.common.by import By
from test_pages.base_page import BasePage

class SleepPage(BasePage):
    HEADER = (By.XPATH, "//h1[contains(text(), 'Sleep')]")
    LOG_SLEEP_BTN = (By.XPATH, "//button[contains(text(), 'Log Sleep') or contains(text(), 'Record Sleep')]")
    SLEEP_DEBT_CARD = (By.XPATH, "//*[contains(text(), 'Sleep Debt') or contains(text(), 'Recovery')]")
    ONSET_INPUT = (By.NAME, "onset")
    WAKE_INPUT = (By.NAME, "wake")
    SUBMIT_SLEEP_BTN = (By.XPATH, "//button[@type='submit' or contains(text(), 'Save Sleep Log')]")

    def open(self):
        self.navigate_to("/sleep")
