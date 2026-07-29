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
    email = f"user_journey_{ts}@vitalcore.test"
    password = "TestPassword123!"
    full_name = f"User Journey Explorer {ts}"
    username = f"journey_{ts}"

    results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context()
        page = context.new_page()

        # STEP 1 & 2: Create Account & Verify Initial Profile Row
        print(f"[STEP 1 & 2] Creating brand-new account: {email}")
        page.goto(f"{BASE_URL}/auth/signup")
        page.fill('input[placeholder="e.g. David R."]', full_name)
        page.fill('input[placeholder="e.g. davidr_longevity"]', username)
        page.fill('input[placeholder="david@company.com"]', email)
        page.fill('input[placeholder="Minimum 6 characters"]', password)
        page.click('button:has-text("Initialize Profile Console")')
        page.wait_for_timeout(3000)

        # Get User ID
        users_resp = db_query("/auth/v1/admin/users")
        user_id = None
        created_at = None
        if isinstance(users_resp, dict) and "users" in users_resp:
            users_list = users_resp["users"]
        else:
            users_list = users_resp or []

        for u in users_list:
            if u.get("email") == email:
                user_id = u["id"]
                created_at = u["created_at"]
                break

        assert user_id is not None, "Failed to get user ID after sign up"

        # Fetch initial profile row
        initial_prof = db_query(f"/rest/v1/profiles?id=eq.{user_id}")[0]
        results["initial_profile"] = {
            "id": initial_prof["id"],
            "full_name": initial_prof["full_name"],
            "username": initial_prof["username"],
            "onboarding_completed": initial_prof["onboarding_completed"],
            "created_at": created_at
        }
        print(f"[STEP 2 VERIFIED] Profile exists with onboarding_completed: {initial_prof['onboarding_completed']}")

        # STEP 3 & 4: Complete Onboarding & Verify onboarding_completed becomes True
        print("[STEP 3 & 4] Completing onboarding steps...")
        for step in range(1, 7):
            page.click('button:has-text("Continue")')
            page.wait_for_timeout(400)

        page.click('button:has-text("Save Profile & Get Started")')
        page.wait_for_timeout(3000)

        # Fetch updated profile row
        updated_prof = db_query(f"/rest/v1/profiles?id=eq.{user_id}")[0]
        results["updated_profile"] = {
            "id": updated_prof["id"],
            "full_name": updated_prof["full_name"],
            "username": updated_prof["username"],
            "weight_kg": updated_prof["weight_kg"],
            "height_cm": updated_prof["height_cm"],
            "fitness_goal": updated_prof["fitness_goal"],
            "onboarding_completed": updated_prof["onboarding_completed"],
            "updated_at": updated_prof["updated_at"]
        }
        print(f"[STEP 4 VERIFIED] Updated profile onboarding_completed: {updated_prof['onboarding_completed']}")
        assert updated_prof["onboarding_completed"] == True, "onboarding_completed did not become True"

        # STEP 5 & 6: Log one meal & Show new nutrition_logs row
        print("[STEP 5 & 6] Logging a meal...")
        page.goto(f"{BASE_URL}/calorie-tracker")
        page.wait_for_timeout(1500)

        page.click('button:has-text("Add Food") >> nth=0')
        page.wait_for_timeout(1000)
        page.click('button:has-text("Save Food Log")')
        page.wait_for_timeout(2500)

        # Fetch nutrition log row from Supabase DB
        food_logs = db_query(f"/rest/v1/nutrition_logs?user_id=eq.{user_id}")
        assert len(food_logs) > 0, "No food log created in DB"
        new_food_row = food_logs[0]
        results["nutrition_log_row"] = {
            "id": new_food_row["id"],
            "user_id": new_food_row["user_id"],
            "meal_type": new_food_row["meal_type"],
            "food_name": new_food_row["food_name"],
            "calories": new_food_row["calories"],
            "protein_g": new_food_row["protein_g"],
            "carbs_g": new_food_row["carbs_g"],
            "fat_g": new_food_row["fat_g"],
            "created_at": new_food_row["created_at"]
        }
        logged_calories = new_food_row["calories"]
        print(f"[STEP 6 VERIFIED] Logged meal: {new_food_row['food_name']} ({logged_calories} kcal)")

        # STEP 7 & 8: Refresh application & Verify Dashboard displays logged calories
        print("[STEP 7 & 8] Refreshing application & checking Dashboard...")
        page.goto(f"{BASE_URL}/dashboard")
        page.reload()
        page.wait_for_timeout(2000)

        # Check calories value rendered on Dashboard UI
        calories_element_text = page.locator('a[href="/calorie-tracker"] div.text-2xl').inner_text()
        print(f"[STEP 8 VERIFIED] Dashboard displays calories text: '{calories_element_text}' kcal")
        assert str(logged_calories) in calories_element_text, f"Dashboard UI expected {logged_calories}, got '{calories_element_text}'"

        # STEP 9: Logout
        print("[STEP 9] Logging out...")
        page.click('button:has-text("Sign Out")')
        page.wait_for_timeout(2000)
        assert "/auth/login" in page.url or page.url == f"{BASE_URL}/", f"Logout failed, url: {page.url}"
        print("[STEP 9 VERIFIED] Successfully logged out")

        # STEP 10 & 11: Login again & Verify Dashboard still displays the same calories and profile
        print("[STEP 10 & 11] Logging in again and verifying data persistence...")
        page.goto(f"{BASE_URL}/auth/login")
        page.fill('input[type="email"]', email)
        page.fill('input[type="password"]', password)
        page.click('button:has-text("Validate and Enter Console")')
        page.wait_for_timeout(3000)

        assert "/dashboard" in page.url, f"Login failed, url: {page.url}"

        relogin_calories_text = page.locator('a[href="/calorie-tracker"] div.text-2xl').inner_text()
        print(f"[STEP 11 VERIFIED] After re-login, Dashboard displays calories: '{relogin_calories_text}' kcal")
        assert str(logged_calories) in relogin_calories_text, "Calories missing after re-login"

        browser.close()

    print("\nFINAL_OUTPUT_JSON_START")
    print(json.dumps(results, indent=2))
    print("FINAL_OUTPUT_JSON_END")

if __name__ == "__main__":
    main()
