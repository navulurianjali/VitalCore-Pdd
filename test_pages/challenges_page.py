"""Page Object Model for Healthy Habits / Challenges Page (/challenges)."""

from selenium.webdriver.common.by import By
from test_pages.base_page import BasePage

class ChallengesPage(BasePage):
    HEADER = (By.XPATH, "//h1[contains(text(), 'Habits') or contains(text(), 'Challenges')]")
    CREATE_CHALLENGE_BTN = (By.XPATH, "//button[contains(text(), 'Create Challenge') or contains(text(), 'New Challenge')]")
    CATEGORY_FITNESS = (By.XPATH, "//button[contains(text(), 'Fitness')]")
    CATEGORY_NUTRITION = (By.XPATH, "//button[contains(text(), 'Nutrition')]")
    JOIN_BTN = (By.XPATH, "//button[contains(text(), 'Join Challenge') or contains(text(), 'Join')]")

    def open(self):
        self.navigate_to("/challenges")
