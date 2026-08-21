import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from webdriver_manager.chrome import ChromeDriverManager
from .config import HEADLESS, IMPLICIT_WAIT_TIMEOUT, PAGE_LOAD_TIMEOUT

def create_driver(headless=HEADLESS, viewport_width=1280, viewport_height=800):
    """
    Creates and configures a Selenium Chrome WebDriver instance.
    Supports headless mode and customizable viewport sizes.
    """
    options = ChromeOptions()
    if headless:
        options.add_argument("--headless=new")
    
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-infobars")
    options.add_argument(f"--window-size={viewport_width},{viewport_height}")

    try:
        driver = webdriver.Chrome(options=options)
    except Exception as e:
        service = ChromeService(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)

    driver.implicitly_wait(IMPLICIT_WAIT_TIMEOUT)
    driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
    return driver
