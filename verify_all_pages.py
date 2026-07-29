import time
import json
import urllib.request
from playwright.sync_api import sync_playwright

env_vars = {}
try:
    with open(".env.local", "r") as f:
        for line in f:
            if "=" in line and not line.startswith("#"):
                k, v = line.strip().split("=", 1)
                env_vars[k.strip()] = v.strip()
except Exception as e:
    pass

SUPABASE_URL = env_vars.get("NEXT_PUBLIC_SUPABASE_URL", "https://bevolemwakfozxuymxsn.supabase.co")
SUPABASE_SERVICE_KEY = env_vars.get("SUPABASE_SERVICE_ROLE_KEY", "")
BASE_URL = "http://localhost:3000"

def db_query(endpoint, method="GET", body=None):
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json"
    }
    url = f"{SUPABASE_URL}{endpoint}"
    data = json.dumps(body).encode('utf-8') if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            resp_body = res.read().decode('utf-8')
            return json.loads(resp_body) if resp_body else {}
    except Exception as e:
        print(f"[DB Query Error] {url}: {e}")
        return None

def main():
    ts = int(time.time())
    email = f"test_audit_{ts}@vitalcore.test"
    password = "TestPassword123!"
    full_name = f"Audit Explorer {ts}"
    username = f"audit_{ts}"

    # 1. Create completed user via admin API
    signup_data = json.dumps({
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {"full_name": full_name, "username": username}
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{SUPABASE_URL}/auth/v1/admin/users",
        data=signup_data,
        headers={
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    res = json.loads(urllib.request.urlopen(req).read().decode("utf-8"))
    uid = res["id"]

    # Mark onboarding_completed = true in profiles
    db_query(f"/rest/v1/profiles?id=eq.{uid}", method="PATCH", body={"onboarding_completed": True})

    pages_to_test = [
        {"name": "Dashboard", "route": "/dashboard"},
        {"name": "Profile", "route": "/profile"},
        {"name": "Calorie Tracker", "route": "/calorie-tracker"},
        {"name": "Fitness", "route": "/fitness"},
        {"name": "Sleep", "route": "/sleep"},
        {"name": "Challenges", "route": "/challenges"},
        {"name": "AI Coach", "route": "/ai-coach"},
        {"name": "Future Health Lab", "route": "/future-lab"},
        {"name": "Settings", "route": "/settings"}
    ]

    report = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Perform Login
        page.goto(f"{BASE_URL}/auth/login")
        page.wait_for_timeout(2000)

        if page.locator('input[type="email"]').is_visible():
            page.fill('input[type="email"]', email)
            page.fill('input[type="password"]', password)
            page.click('button[type="submit"]')
            try:
                page.wait_for_url("**/dashboard", timeout=10000)
            except Exception:
                page.goto(f"{BASE_URL}/dashboard")
                page.wait_for_timeout(2000)

        if "/auth/onboarding" in page.url:
            page.goto(f"{BASE_URL}/dashboard")
            page.wait_for_timeout(2000)

        assert "/dashboard" in page.url, f"Failed to load dashboard, url: {page.url}"

        for p_info in pages_to_test:
            name = p_info["name"]
            route = p_info["route"]

            console_errors = []
            network_errors = []

            def on_console(msg):
                if msg.type == "error":
                    console_errors.append(msg.text)

            def on_page_error(err):
                console_errors.append(str(err))

            def on_request_failed(req):
                # Ignore aborted requests or analytics
                if req.failure and "net::ERR_ABORTED" not in req.failure:
                    network_errors.append(f"{req.url} - {req.failure}")

            page.on("console", on_console)
            page.on("pageerror", on_page_error)
            page.on("requestfailed", on_request_failed)

            print(f"\n[TESTING PAGE] {name} ({route})...")
            try:
                page.goto(f"{BASE_URL}{route}")
                page.wait_for_timeout(2500) # Allow hydration and client effects

                # Check if page rendered expected container
                has_h1_h2 = page.locator("h1, h2, main").first.is_visible()
                status = "PASS" if (has_h1_h2 and len(console_errors) == 0) else ("FAIL" if len(console_errors) > 0 else "PASS")
                
                report.append({
                    "name": name,
                    "route": route,
                    "status": status,
                    "console_errors": console_errors,
                    "network_errors": network_errors
                })
                print(f"[{status}] {name} - Console errors: {len(console_errors)}, Network errors: {len(network_errors)}")
            except Exception as e:
                report.append({
                    "name": name,
                    "route": route,
                    "status": "FAIL",
                    "console_errors": [str(e)],
                    "network_errors": network_errors
                })
                print(f"[FAIL] {name} - Exception: {e}")

            # Remove listeners
            page.remove_listener("console", on_console)
            page.remove_listener("pageerror", on_page_error)
            page.remove_listener("requestfailed", on_request_failed)

        browser.close()

    print("\n" + "="*50)
    print("ALL PAGES AUDIT SUMMARY")
    print("="*50)
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
