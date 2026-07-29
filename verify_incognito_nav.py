import json
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

def main():
    print("==================================================")
    print("INCOGNITO SESSION VISIBILITY & NAVIGATION TEST")
    print("==================================================")

    with sync_playwright() as p:
        # Launch fresh incognito browser context (no cookies/session)
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("[STEP 1] Navigating to landing page (/)....")
        page.goto(f"{BASE_URL}/")
        page.wait_for_timeout(1000)

        # Verify Sign In link visibility
        signin_element = page.locator('a[href="/auth/login"]:has-text("Sign In")')
        signin_visible = signin_element.is_visible()
        print(f"[VERIFY] 'Sign In' link visible: {signin_visible}")

        # Verify Get Started button visibility
        get_started_element = page.locator('a[href="/auth/signup"]:has-text("Get Started")').first
        get_started_visible = get_started_element.is_visible()
        print(f"[VERIFY] 'Get Started' button visible: {get_started_visible}")

        assert signin_visible, "Sign In link is not visible"
        assert get_started_visible, "Get Started button is not visible"

        print("[STEP 2] Clicking 'Get Started' button....")
        get_started_element.click()
        page.wait_for_timeout(1500)

        current_url = page.url
        print(f"[VERIFY] Current URL post-click: {current_url}")

        assert "/auth/signup" in current_url, f"Expected /auth/signup, got {current_url}"
        print("[RESULT] Navigation to /auth/signup verified successfully!")

        browser.close()

    print("\n==================================================")
    print("TEST RESULT: PASS")
    print("==================================================")

if __name__ == "__main__":
    main()
