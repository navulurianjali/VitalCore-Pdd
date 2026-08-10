"""Page Object Model for Health Onboarding (/auth/onboarding)."""

from selenium.webdriver.common.by import By
from test_pages.base_page import BasePage

class OnboardingPage(BasePage):
    NEXT_BUTTON = (By.XPATH, "//button[contains(text(), 'Next') or contains(text(), 'Continue')]")
    BACK_BUTTON = (By.XPATH, "//button[contains(text(), 'Back')]")
    COMPLETE_BUTTON = (By.XPATH, "//button[contains(text(), 'Complete') or contains(text(), 'Finish')]")
    STEP_HEADER = (By.XPATH, "//h1 | //h2 | //*[contains(text(), 'Step')]")
    
    # Inputs
    AGE_INPUT = (By.NAME, "age")
    HEIGHT_INPUT = (By.NAME, "height")
    WEIGHT_INPUT = (By.NAME, "weight")
    GENDER_MALE = (By.XPATH, "//button[contains(text(), 'Male') or @value='male']")
    GENDER_FEMALE = (By.XPATH, "//button[contains(text(), 'Female') or @value='female']")
    MEDICAL_SEARCH_INPUT = (By.XPATH, "//input[@placeholder='Search conditions...']")

    def open(self):
        self.navigate_to("/auth/onboarding")

    def click_next(self):
        self.click(*self.NEXT_BUTTON)

    def click_back(self):
        self.click(*self.BACK_BUTTON)

    def click_complete(self):
        self.click(*self.COMPLETE_BUTTON)
