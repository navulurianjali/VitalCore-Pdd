import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env if present
env_file = Path(__file__).resolve().parent.parent / ".env"
if env_file.exists():
    load_dotenv(env_file)

# Target Web Application Base URL (Configurable via BASE_URL env var)
BASE_URL = os.getenv("BASE_URL", "http://localhost:3000").rstrip("/")

# Test User Credentials
TEST_EMAIL = os.getenv("TEST_EMAIL", "testuser@vitalcore.ai")
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "VitalCoreTest123!")

# Driver & Timeout Settings
HEADLESS = os.getenv("HEADLESS", "true").lower() in ("true", "1", "yes")
EXPLICIT_WAIT_TIMEOUT = int(os.getenv("EXPLICIT_WAIT_TIMEOUT", "10"))
IMPLICIT_WAIT_TIMEOUT = int(os.getenv("IMPLICIT_WAIT_TIMEOUT", "2"))
PAGE_LOAD_TIMEOUT = int(os.getenv("PAGE_LOAD_TIMEOUT", "25"))

# Directory Paths
SELENIUM_ROOT = Path(__file__).resolve().parent.parent
REPORTS_DIR = SELENIUM_ROOT / "reports"
SCREENSHOTS_DIR = REPORTS_DIR / "screenshots"

EXCEL_REPORT_PATH = REPORTS_DIR / "selenium_results.xlsx"
HTML_REPORT_PATH = REPORTS_DIR / "selenium_results.html"

# Ensure reports and screenshots directories exist
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
