"""Page Object Model for Fitness Page (/fitness)."""

from selenium.webdriver.common.by import By
from test_pages.base_page import BasePage

class FitnessPage(BasePage):
    HEADER = (By.XPATH, "//h1[contains(text(), 'Fitness') or contains(text(), 'Workout')]")
    COACH_TAB = (By.XPATH, "//button[contains(., 'Coach') or contains(., 'Workout')]")
    HISTORY_TAB = (By.XPATH, "//button[contains(., 'History')]")
    POSTURE_TAB = (By.XPATH, "//button[contains(., 'Posture')]")
    READINESS_SCORE = (By.XPATH, "//*[contains(text(), 'Readiness') or contains(text(), 'Stamina') or contains(text(), 'Score')]")
    GENERATE_WORKOUT_BTN = (By.XPATH, "//button[contains(text(), 'Generate') or contains(text(), 'Start Workout') or contains(text(), 'Next')]")

    def open(self):
        self.navigate_to("/fitness")
