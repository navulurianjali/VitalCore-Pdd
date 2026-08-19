# 🧪 VitalCore Selenium End-to-End Testing Suite

Automated Selenium E2E testing framework built with Python, Selenium, Pytest, and OpenPyXL for the VitalCore Web Application.

---

## 📁 Repository Structure

```
selenium-tests/
├── tests/                           # 14 Test Modules (~330 Test Cases)
│   ├── test_authentication.py       # Login, Signup, Onboarding, Sessions
│   ├── test_dashboard.py            # Focus metrics, Modes, Quick actions
│   ├── test_profile.py              # Profile tabs, Edits, Supabase sync
│   ├── test_settings.py             # Themes, Modes, Preferences
│   ├── test_calorie_tracker.py      # Food logging, Meal sections, Macros
│   ├── test_sleep.py                # Sleep logs, Duration, Quality
│   ├── test_health_history.py       # Ranges, Aggregates, Calendar
│   ├── test_fitness.py              # Workouts, Exercises, PRs
│   ├── test_ai_coach.py             # Companion prompts, History
│   ├── test_future_health_lab.py    # Digital Twin, Simulator, Predictions
│   ├── test_challenges.py           # Predefined list, Active, Complete
│   ├── test_navigation.py           # Navbar, Sidebar, Route protection
│   ├── test_responsive_ui.py        # Desktop, Tablet, Mobile viewports
│   └── test_cross_page_workflows.py # Cross-tab sync, Telemetry flow
│
├── utils/                           # Core Framework Utilities
│   ├── driver.py                    # WebDriver setup (Headless / Desktop)
│   ├── helpers.py                   # Explicit wait & interaction wrappers
│   ├── config.py                    # Path definitions & Env vars
│   ├── test_data.py                 # Mock payloads & inputs
│   ├── excel_reporter.py            # openpyxl 5-sheet report generator
│   └── html_reporter.py             # Standalone HTML report builder
│
├── reports/                         # Generated Test Execution Artifacts
│   ├── selenium_results.xlsx        # Excel Report
│   ├── selenium_results.html        # HTML Report
│   └── screenshots/                 # Failure Screenshots (TC-XXX_failed.png)
│
├── conftest.py                      # Pytest fixtures & Hooks
├── requirements.txt                 # Dependencies
├── pytest.ini                       # Pytest configuration
└── README.md                        # Framework Documentation
```

---

## 🛠️ Prerequisites & Installation

1. **Python 3.10+**: Ensure Python is installed.
2. **Install Dependencies**:
   ```bash
   pip install -r selenium-tests/requirements.txt
   ```

---

## ⚙️ Environment Configuration

Set the target Web Application `BASE_URL` and login credentials via environment variables or a `.env` file inside `/selenium-tests`:

```env
BASE_URL=http://localhost:3000
TEST_EMAIL=testuser@vitalcore.ai
TEST_PASSWORD=VitalCoreTest123!
HEADLESS=true
```

To run tests against the production Vercel deployment:
```env
BASE_URL=https://vitalcore-pdd.vercel.app
```

---

## 🚀 Running Tests

### Run Full Test Suite
```bash
pytest selenium-tests/tests -v
```

### Run Specific Test Module
```bash
pytest selenium-tests/tests/test_authentication.py -v
```

### Run by Pytest Marker
```bash
pytest -m dashboard -v
```

---

## 📊 Automated Reports & Artifacts

After every test execution, reports are automatically generated under `selenium-tests/reports/`:

1. **Excel Report**: `selenium_results.xlsx`
   - Sheet 1: **Test Results** (Detailed per test ID, status, execution time, error message)
   - Sheet 2: **Summary** (Total, Passed, Failed, Skipped, Pass %)
   - Sheet 3: **Module Summary** (Breakdown per test module)
   - Sheet 4: **Failed Tests** (Dedicated failure analysis tab)
   - Sheet 5: **Execution Details** (Environment & browser metadata)

2. **HTML Report**: `selenium_results.html`
   - Visual dashboard summary with pass percentage, total execution duration, and screenshot links.

3. **Failure Screenshots**: `selenium-tests/reports/screenshots/`
   - Automatic screenshot captured for any failing test (e.g. `TC-AUTH-004_failed.png`).
