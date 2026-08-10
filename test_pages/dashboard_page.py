"""Page Object Model for Dashboard Page (/dashboard)."""

from selenium.webdriver.common.by import By
from test_pages.base_page import BasePage

class DashboardPage(BasePage):
    GREETING = (By.XPATH, "//*[contains(text(), 'Good morning') or contains(text(), 'Good afternoon') or contains(text(), 'Good evening')]")
    CALORIES_CARD = (By.XPATH, "//*[contains(text(), 'Calories') or contains(text(), 'kcal')]")
    HYDRATION_CARD = (By.XPATH, "//*[contains(text(), 'Hydration') or contains(text(), 'Water') or contains(text(), 'ml')]")
    SLEEP_CARD = (By.XPATH, "//*[contains(text(), 'Sleep') or contains(text(), 'hrs')]")
    STEPS_CARD = (By.XPATH, "//*[contains(text(), 'Steps') or contains(text(), 'Activity')]")
    ADD_250ML_BTN = (By.XPATH, "//button[contains(text(), '+250') or contains(text(), '250ml')]")
    ADD_500ML_BTN = (By.XPATH, "//button[contains(text(), '+500') or contains(text(), '500ml')]")
    SIMULATOR_BTN = (By.XPATH, "//button[contains(text(), 'Simulator') or contains(text(), 'Try Simulator')]")

    def open(self):
        self.navigate_to("/dashboard")

    def is_dashboard_loaded(self):
        return self.is_visible(*self.GREETING, timeout=8) or self.is_visible(*self.CALORIES_CARD, timeout=8)
