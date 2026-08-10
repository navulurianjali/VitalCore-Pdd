"""Page Object Model for Settings Page (/settings)."""

from selenium.webdriver.common.by import By
from test_pages.base_page import BasePage

class SettingsPage(BasePage):
    HEADER = (By.XPATH, "//h1[contains(text(), 'Settings') or contains(text(), 'Preferences')]")
    MODE_WELLNESS = (By.ID, "mode-wellness")
    MODE_PERFORMANCE = (By.ID, "mode-performance")
    MODE_ELDERLY = (By.ID, "mode-elderly")
    THEME_LIGHT = (By.ID, "theme-light")
    THEME_DARK = (By.ID, "theme-dark")
    THEME_SYSTEM = (By.ID, "theme-system")
    SIGNOUT_BTN = (By.XPATH, "//button[contains(text(), 'Log Out') or contains(text(), 'Sign Out')]")

    def open(self):
        self.navigate_to("/settings")
