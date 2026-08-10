"""Page Object Model for Calorie Tracker Page (/calorie-tracker)."""

from selenium.webdriver.common.by import By
from test_pages.base_page import BasePage

class NutritionPage(BasePage):
    HEADER = (By.XPATH, "//h1[contains(text(), 'Calorie') or contains(text(), 'Nutrition')]")
    ADD_BREAKFAST_BTN = (By.XPATH, "//button[contains(text(), 'Breakfast') or contains(text(), 'Add Food')]")
    ADD_LUNCH_BTN = (By.XPATH, "//button[contains(text(), 'Lunch')]")
    ADD_DINNER_BTN = (By.XPATH, "//button[contains(text(), 'Dinner')]")
    ADD_SNACK_BTN = (By.XPATH, "//button[contains(text(), 'Snack')]")
    SEARCH_INPUT = (By.XPATH, "//input[@placeholder='Search food database...' or contains(@placeholder, 'Search')]")
    GRAMS_INPUT = (By.XPATH, "//input[@type='number']")
    SAVE_FOOD_BTN = (By.XPATH, "//button[contains(text(), 'Add to Log') or contains(text(), 'Save')]")
    TOTAL_CALORIES = (By.XPATH, "//*[contains(text(), 'Total Calories') or contains(text(), 'Consumed') or contains(text(), 'kcal')]")

    def open(self):
        self.navigate_to("/calorie-tracker")
