"""Page Object Model for Signup Page (/auth/signup)."""

from selenium.webdriver.common.by import By
from test_pages.base_page import BasePage

class SignupPage(BasePage):
    # Locators with universal multi-strategy fallbacks
    FULLNAME_INPUT = (By.XPATH, "//input[@name='fullName'] | //input[@placeholder='John Doe'] | //input[@type='text'][1]")
    USERNAME_INPUT = (By.XPATH, "//input[@name='username'] | //input[@placeholder='johndoe_health'] | //input[@type='text'][2]")
    EMAIL_INPUT = (By.XPATH, "//input[@name='email'] | //input[@type='email'] | //input[contains(@placeholder, '@')]")
    PASSWORD_INPUT = (By.XPATH, "(//input[@type='password'])[1] | //input[@name='password']")
    CONFIRM_PASSWORD_INPUT = (By.XPATH, "(//input[@type='password'])[2] | //input[@name='confirmPassword']")
    SUBMIT_BUTTON = (By.XPATH, "//button[@type='submit'] | //button[contains(., 'Account')]")
    LOGIN_LINK = (By.XPATH, "//a[contains(@href, 'login') or contains(text(), 'Sign In')]")
    ERROR_ALERT = (By.XPATH, "//div[contains(@className, 'rose') or contains(text(), 'error')]")

    def open(self):
        self.navigate_to("/auth/signup")

    def fill_form(self, fullname, username, email, password, confirm_password=None):
        self.send_keys(*self.FULLNAME_INPUT, fullname)
        self.send_keys(*self.USERNAME_INPUT, username)
        self.send_keys(*self.EMAIL_INPUT, email)
        self.send_keys(*self.PASSWORD_INPUT, password)
        c_pwd = confirm_password if confirm_password is not None else password
        if self.is_present(*self.CONFIRM_PASSWORD_INPUT, timeout=2):
            self.send_keys(*self.CONFIRM_PASSWORD_INPUT, c_pwd)

    def click_signup(self):
        btns = self.find_all(*self.SUBMIT_BUTTON)
        if btns:
            try:
                self.driver.execute_script("arguments[0].click();", btns[0])
            except Exception:
                btns[0].click()

    def signup(self, fullname, username, email, password):
        self.fill_form(fullname, username, email, password, password)
        self.click_signup()
