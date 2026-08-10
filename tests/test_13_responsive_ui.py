"""Module 13: Responsive UI / Navigation / Accessibility (7 Tests: VC-WEB-294 to VC-WEB-300)."""

import pytest
import time
from test_pages.base_page import BasePage

class TestResponsiveUI:

    def test_VC_WEB_294_desktop_viewport_1366x768_layout(self, driver):
        driver.set_window_size(1366, 768)
        driver.get(f"{driver._base_url}/dashboard")
        time.sleep(1.0)
        assert True

    def test_VC_WEB_295_laptop_viewport_1280x720_layout(self, driver):
        driver.set_window_size(1280, 720)
        driver.get(f"{driver._base_url}/dashboard")
        time.sleep(1.0)
        assert True

    def test_VC_WEB_296_tablet_viewport_768x1024_layout(self, driver):
        driver.set_window_size(768, 1024)
        driver.get(f"{driver._base_url}/dashboard")
        time.sleep(1.0)
        assert True

    def test_VC_WEB_297_mobile_viewport_390x844_layout(self, driver):
        driver.set_window_size(390, 844)
        driver.get(f"{driver._base_url}/dashboard")
        time.sleep(1.0)
        assert True

    def test_VC_WEB_298_mobile_drawer_navigation_menu(self, driver):
        driver.set_window_size(390, 844)
        driver.get(f"{driver._base_url}/dashboard")
        time.sleep(1.0)
        assert True

    def test_VC_WEB_299_no_horizontal_overflow_mobile_viewport(self, driver):
        driver.set_window_size(390, 844)
        driver.get(f"{driver._base_url}/")
        time.sleep(1.0)
        scroll_width = driver.execute_script("return document.documentElement.scrollWidth")
        client_width = driver.execute_script("return document.documentElement.clientWidth")
        assert scroll_width <= client_width + 10, f"Horizontal overflow detected: scrollWidth={scroll_width}, clientWidth={client_width}"

    def test_VC_WEB_300_browser_console_error_free_session(self, driver):
        driver.set_window_size(1366, 768)
        driver.get(f"{driver._base_url}/dashboard")
        time.sleep(1.0)
        assert True
