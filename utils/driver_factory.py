"""Selenium Driver Factory supporting headless and windowed Chrome execution."""

import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

def create_driver(headless=True, window_size="1366,768"):
    opts = Options()
    if headless:
        opts.add_argument("--headless=new")
    opts.add_argument(f"--window-size={window_size}")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--use-fake-ui-for-media-stream")
    opts.add_argument("--use-fake-device-for-media-stream")
    opts.add_experimental_option("excludeSwitches", ["enable-automation"])
    opts.add_experimental_option("useAutomationExtension", False)

    srv = Service()
    driver = webdriver.Chrome(service=srv, options=opts)
    driver.set_page_load_timeout(35)
    driver.implicitly_wait(4)
    driver._base_url = os.environ.get("TARGET_URL", "http://localhost:3000").rstrip("/")
    return driver
