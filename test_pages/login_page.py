"""Page Object Model for Login Page (/auth/login)."""

from selenium.webdriver.common.by import By
from test_pages.base_page import BasePage

class LoginPage(BasePage):
    # Locators with multi-strategy fallback
    EMAIL_INPUT = (By.XPATH, "//input[@name='email' or @type='email' or @placeholder='name@email.com']")
    PASSWORD_INPUT = (By.XPATH, "//input[@name='password' or @type='password' or @placeholder='••••••••']")
    SUBMIT_BUTTON = (By.XPATH, "//button[@type='submit' or contains(text(), 'Log In')]")
    FORGOT_PASSWORD_LINK = (By.XPATH, "//a[contains(@href, 'forgot-password') or contains(text(), 'Forgot')]")
    SIGNUP_LINK = (By.XPATH, "//a[contains(@href, 'signup') or contains(text(), 'Sign Up')]")
    ERROR_ALERT = (By.XPATH, "//div[contains(@className, 'rose') or contains(text(), 'Invalid') or contains(text(), 'error') or contains(text(), '⚠️')]")
    PASSWORD_TOGGLE = (By.XPATH, "//button[contains(@title, 'password') or .//*[name()='svg']]")

    def open(self):
        self.navigate_to("/auth/login")

    def enter_email(self, email):
        self.send_keys(*self.EMAIL_INPUT, email)

    def enter_password(self, password):
        self.send_keys(*self.PASSWORD_INPUT, password)

    def click_login(self):
        self.click(*self.SUBMIT_BUTTON)

    def login(self, email, password):
        self.enter_email(email)
        self.enter_password(password)
        self.click_login()

    def get_error_message(self):
        if self.is_visible(*self.ERROR_ALERT, timeout=3):
            return self.get_text(*self.ERROR_ALERT)
        return ""
