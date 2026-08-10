"""Page Object Model for Future Health Lab Page (/future-lab)."""

from selenium.webdriver.common.by import By
from test_pages.base_page import BasePage

class FutureLabPage(BasePage):
    HEADER = (By.XPATH, "//h1[contains(text(), 'Future Health Lab') or contains(text(), 'Digital Twin')]")
    HEALTH_SCORE = (By.XPATH, "//*[contains(text(), 'Score') or contains(text(), 'Bio Age')]")
    ACTION_PLAN = (By.XPATH, "//*[contains(text(), 'AI Action Plan') or contains(text(), 'Daily Protocol')]")
    DETAILED_INSIGHTS_BTN = (By.XPATH, "//button[contains(text(), 'Detailed Insights')]")

    def open(self):
        self.navigate_to("/future-lab")
