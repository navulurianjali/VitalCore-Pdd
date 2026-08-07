"""
VitalCore Expo - Load / Baseline Test Configuration
----------------------------------------------------
Adjust these values before running the test suite.
"""

# ── Appium Server ─────────────────────────────────────────────────────────────
APPIUM_HOST = "http://127.0.0.1"
APPIUM_PORT = 4723
APPIUM_SERVER_URL = f"{APPIUM_HOST}:{APPIUM_PORT}"

# ── Android Desired Capabilities ─────────────────────────────────────────────
# Update deviceName and app path to match your environment.
APPIUM_CAPABILITIES = {
    "platformName":        "Android",
    "appium:automationName": "UiAutomator2",
    "appium:deviceName":   "emulator-5554",          # adb devices output
    "appium:platformVersion": "13",                  # your emulator/device API
    "appium:appPackage":   "com.vitalcore.app",       # from app.json
    "appium:appActivity":  "com.vitalcore.app.MainActivity",
    "appium:noReset":      True,                      # keep app state between sessions
    "appium:newCommandTimeout": 60,
    "appium:autoGrantPermissions": True,
}

# ── Load Test Parameters ──────────────────────────────────────────────────────
VIRTUAL_USERS   = 100          # concurrent virtual users
TEST_DURATION_S = 60           # 1 minute
RAMP_UP_S       = 5            # seconds to ramp to full concurrency

# ── Backend Endpoints (direct API load, no device needed) ────────────────────
SUPABASE_URL      = "https://bevolemwakfozxuymxsn.supabase.co"
SUPABASE_ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldm9sZW13YWtmb3p4dXlteHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTUyNjUsImV4cCI6MjA5NTQ5MTI2NX0"
    ".ZRyBiaR7vhG8O2FEdPEQOBErLrSF5AxK_PASy87Odlk"
)
BASE_API_URL      = "https://vita-core-ai.vercel.app"

SUPABASE_HEADERS = {
    "apikey":        SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type":  "application/json",
}

# ── Supabase REST API Endpoints to load-test ─────────────────────────────────
# Each entry: (label, method, url, optional_json_body)
SUPABASE_ENDPOINTS = [
    (
        "GET  /health",
        "GET",
        f"{SUPABASE_URL}/rest/v1/",
        None,
    ),
    (
        "GET  profiles (anon, limit 1)",
        "GET",
        f"{SUPABASE_URL}/rest/v1/profiles?select=id&limit=1",
        None,
    ),
    (
        "GET  meal_logs (anon, limit 1)",
        "GET",
        f"{SUPABASE_URL}/rest/v1/meal_logs?select=id&limit=1",
        None,
    ),
    (
        "GET  workout_logs (anon, limit 1)",
        "GET",
        f"{SUPABASE_URL}/rest/v1/workout_logs?select=id&limit=1",
        None,
    ),
    (
        "GET  sleep_logs (anon, limit 1)",
        "GET",
        f"{SUPABASE_URL}/rest/v1/sleep_logs?select=id&limit=1",
        None,
    ),
]

# ── Next.js / Vercel API Endpoints to load-test ──────────────────────────────
VERCEL_ENDPOINTS = [
    (
        "GET  /api/health",
        "GET",
        f"{BASE_API_URL}/api/health",
        None,
    ),
    (
        "GET  /api/user/profile",
        "GET",
        f"{BASE_API_URL}/api/user/profile",
        None,
    ),
    (
        "POST /api/ai-coach/chat",
        "POST",
        f"{BASE_API_URL}/api/ai-coach/chat",
        {"message": "What is a healthy breakfast?", "userId": "load-test-user"},
    ),
    (
        "GET  /api/nutrition/search",
        "GET",
        f"{BASE_API_URL}/api/nutrition/search?q=apple",
        None,
    ),
]

# ── Report ────────────────────────────────────────────────────────────────────
REPORT_FILE = "load_test_report.txt"
REPORT_JSON = "load_test_report.json"
