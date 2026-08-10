"""Page Object Model for AI Coach Page (/ai-coach)."""

from selenium.webdriver.common.by import By
from test_pages.base_page import BasePage

class AICoachPage(BasePage):
    HEADER = (By.XPATH, "//h1[contains(text(), 'Wellness Coach') or contains(text(), 'AI Coach')]")
    MESSAGE_INPUT = (By.XPATH, "//input[contains(@placeholder, 'Ask') or contains(@placeholder, 'wellness') or contains(@placeholder, 'message')] | //textarea")
    SEND_BUTTON = (By.XPATH, "//button[@type='submit' or .//*[name()='svg']]")
    MESSAGES_CONTAINER = (By.XPATH, "//div[contains(@className, 'chat') or contains(@className, 'messages') or contains(@className, 'space-y')]")

    def open(self):
        self.navigate_to("/ai-coach")

    def send_message(self, text):
        self.send_keys(*self.MESSAGE_INPUT, text)
        self.click(*self.SEND_BUTTON)
