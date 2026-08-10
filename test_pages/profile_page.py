"""Page Object Model for Profile Page (/profile)."""

from selenium.webdriver.common.by import By
from test_pages.base_page import BasePage

class ProfilePage(BasePage):
    EDIT_BTN = (By.ID, "profile-save-btn")
    SAVE_CHANGES_BTN = (By.XPATH, "//button[contains(text(), 'Save Changes') or contains(text(), 'Edit Profile') or @id='profile-save-btn']")
    CANCEL_BTN = (By.XPATH, "//button[contains(text(), 'Cancel')]")
    SAVE_SUCCESS_ALERT = (By.XPATH, "//*[contains(text(), 'saved successfully') or contains(text(), 'Updated')]")
    SAVE_ERROR_ALERT = (By.XPATH, "//*[contains(text(), 'Save failed') or contains(text(), 'Couldn\'t save')]")
    
    # Category Tabs
    TAB_PERSONAL = (By.XPATH, "//button[contains(., 'Personal')]")
    TAB_BODY = (By.XPATH, "//button[contains(., 'Body')]")
    TAB_MEDICAL = (By.XPATH, "//button[contains(., 'Medical')]")
    TAB_LIFESTYLE = (By.XPATH, "//button[contains(., 'Lifestyle')]")
    TAB_NUTRITION = (By.XPATH, "//button[contains(., 'Nutrition')]")
    TAB_FITNESS = (By.XPATH, "//button[contains(., 'Fitness')]")
    TAB_SLEEP = (By.XPATH, "//button[contains(., 'Sleep')]")
    TAB_EMERGENCY = (By.XPATH, "//button[contains(., 'Emergency')]")

    # Inputs
    FULLNAME_INPUT = (By.NAME, "full_name")
    HEIGHT_INPUT = (By.NAME, "height_cm")
    WEIGHT_INPUT = (By.NAME, "weight_kg")
    MEDICAL_CONDITIONS_INPUT = (By.NAME, "medical_conditions")
    MEDICATIONS_INPUT = (By.NAME, "medications")
    ALLERGIES_INPUT = (By.NAME, "allergies")

    def open(self):
        self.navigate_to("/profile")

    def enable_edit(self):
        btns = self.find_all(*self.EDIT_BTN)
        if not btns:
            btns = self.find_all(By.XPATH, "//button[contains(., 'Edit Profile') or contains(., 'Save Changes')]")
        if btns:
            try:
                self.driver.execute_script("arguments[0].click();", btns[0])
            except Exception:
                btns[0].click()

    def click_save(self):
        self.click(*self.SAVE_CHANGES_BTN)
