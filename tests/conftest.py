"""Shared conftest for VitalCore E2E tests."""

def pytest_addoption(parser):
    parser.addoption("--headless", action="store_true", default=False,
                     help="Run Chrome in headless mode")
