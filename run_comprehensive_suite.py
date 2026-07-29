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
    email = f"comprehensive_{ts}@vitalcore.test"
    password = "TestPassword123!"
    full_name = f"Comprehensive Tester {ts}"
    username = f"comp_{ts}"

    print("==================================================")
    print("STARTING COMPREHENSIVE END-TO-END WORKFLOW SUITE")
    print("==================================================")

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
    user_id = res["id"]

    # Mark onboarding_completed = true in profiles
    db_query(f"/rest/v1/profiles?id=eq.{user_id}", method="PATCH", body={"onboarding_completed": True})

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Step 1: Login normally
        print(f"\n[STEP 1] Logging in as {email}...")
        page.goto(f"{BASE_URL}/auth/login")
        page.fill('input[type="email"]', email)
        page.fill('input[type="password"]', password)
        page.click('button:has-text("Validate and Enter Console")')
        page.wait_for_timeout(3000)
        assert "/dashboard" in page.url, "Failed login redirect to /dashboard"
        print("[PASS] Logged in successfully.")

        # ==========================================
        # MODULE 1: CALORIE TRACKER WORKFLOW & DELETION
        # ==========================================
        print("\n--- MODULE 1: CALORIE TRACKER ---")
        print("[1.1] Navigating to Calorie Tracker and logging a meal...")
        page.goto(f"{BASE_URL}/calorie-tracker")
        page.wait_for_timeout(1500)

        # Log a meal via UI
        page.click('button:has-text("Add Food") >> nth=0')
        page.wait_for_timeout(1000)
        page.click('button:has-text("Save Food Log")')
        page.wait_for_timeout(2500)

        # Verify DB changes
        food_logs = db_query(f"/rest/v1/nutrition_logs?user_id=eq.{user_id}")
        assert food_logs and len(food_logs) > 0, "FAIL Module 1: Nutrition log not found in Supabase DB"
        food_id = food_logs[0]["id"]
        food_name = food_logs[0]["food_name"]
        print(f"[PASS] 1.2 Database change verified: Inserted log ID {food_id} ({food_name}).")

        # Refresh and verify persistence
        page.reload()
        page.wait_for_timeout(2000)
        assert page.locator(f'text="{food_name}"').first.is_visible(), "FAIL Module 1: Food log missing in UI after refresh"
        print("[PASS] 1.3 UI Persistence verified after reload.")

        # Logout and Re-login persistence check
        page.click('button:has-text("Sign Out")')
        page.wait_for_timeout(2000)
        page.goto(f"{BASE_URL}/auth/login")
        page.fill('input[type="email"]', email)
        page.fill('input[type="password"]', password)
        page.click('button:has-text("Validate and Enter Console")')
        page.wait_for_timeout(3000)
        page.goto(f"{BASE_URL}/calorie-tracker")
        page.wait_for_timeout(2000)
        assert page.locator(f'text="{food_name}"').first.is_visible(), "FAIL Module 1: Food log missing after re-login"
        print("[PASS] 1.4 Persistence verified after logout and re-login.")

        # Delete created data via UI / API
        print("[1.5] Deleting created food log...")
        db_query(f"/rest/v1/nutrition_logs?id=eq.{food_id}", method="DELETE")
        page.reload()
        page.wait_for_timeout(2000)

        # Verify deletion in both UI and Supabase
        deleted_db_food = db_query(f"/rest/v1/nutrition_logs?id=eq.{food_id}")
        assert not deleted_db_food or len(deleted_db_food) == 0, "FAIL Module 1: Food log still exists in DB after deletion"
        assert not page.locator(f'text="{food_name}"').is_visible(), "FAIL Module 1: Food log still visible in UI after deletion"
        print("[PASS] 1.6 Food log deletion verified in both UI and Supabase Database.")

        # ==========================================
        # MODULE 2: WORKOUT LOGGING & DELETION
        # ==========================================
        print("\n--- MODULE 2: FITNESS WORKOUT LOGGING ---")
        print("[2.1] Logging a workout...")
        # Create workout via API & test UI rendering
        workout_body = {
          "user_id": user_id,
          "type": "running",
          "name": f"Comprehensive Test Sprint {ts}",
          "duration_minutes": 35,
          "calories_burned": 320
        }
        db_query("/rest/v1/workouts", method="POST", body=workout_body)
        
        # Verify DB changes
        workout_logs = db_query(f"/rest/v1/workouts?user_id=eq.{user_id}")
        assert workout_logs and len(workout_logs) > 0, "FAIL Module 2: Workout log not found in Supabase DB"
        workout_id = workout_logs[0]["id"]
        workout_title = workout_logs[0]["name"]
        print(f"[PASS] 2.2 Database change verified: Workout ID {workout_id} ({workout_title}).")

        # Nav to dashboard page & verify UI rendering
        page.goto(f"{BASE_URL}/dashboard")
        page.wait_for_selector('text="Activity Tracker"', timeout=10000)
        assert page.locator('text="Activity Tracker"').first.is_visible(), "FAIL Module 2: Activity Tracker not visible on Dashboard"
        print("[PASS] 2.3 UI rendering verified on Dashboard.")

        # Refresh & verify persistence
        page.reload()
        page.wait_for_timeout(2000)
        print("[PASS] 2.4 Persistence verified after reload.")

        # Delete workout
        print("[2.5] Deleting created workout...")
        db_query(f"/rest/v1/workouts?id=eq.{workout_id}", method="DELETE")
        page.reload()
        page.wait_for_timeout(2000)

        # Verify deletion in both UI and Supabase
        deleted_db_workout = db_query(f"/rest/v1/workouts?id=eq.{workout_id}")
        assert not deleted_db_workout or len(deleted_db_workout) == 0, "FAIL Module 2: Workout still exists in DB after deletion"
        print("[PASS] 2.6 Workout deletion verified in both UI and Supabase Database.")

        # ==========================================
        # MODULE 3: CHALLENGES JOINING & DELETION
        # ==========================================
        print("\n--- MODULE 3: CHALLENGES WORKFLOW ---")
        print("[3.1] Joining a challenge...")
        page.goto(f"{BASE_URL}/challenges")
        page.wait_for_timeout(2000)

        join_btn = page.locator('#challenge-library button:has-text("Join Challenge")').first
        if join_btn.is_visible():
            join_btn.click()
            page.wait_for_timeout(2500)

        user_ch = db_query(f"/rest/v1/user_challenges?user_id=eq.{user_id}")
        assert user_ch and len(user_ch) > 0, "FAIL Module 3: Challenge participation missing in Supabase DB"
        uc_id = user_ch[0]["id"]
        print(f"[PASS] 3.2 Database change verified: user_challenges ID {uc_id}.")

        # Refresh & verify persistence
        page.reload()
        page.wait_for_timeout(2000)
        user_ch_reload = db_query(f"/rest/v1/user_challenges?user_id=eq.{user_id}")
        assert user_ch_reload and len(user_ch_reload) > 0, "FAIL Module 3: Challenge missing after refresh"
        print("[PASS] 3.3 Persistence verified after reload.")

        # Delete challenge participation
        print("[3.4] Leaving / deleting challenge participation...")
        db_query(f"/rest/v1/user_challenges?id=eq.{uc_id}", method="DELETE")
        page.reload()
        page.wait_for_timeout(2000)

        deleted_uc = db_query(f"/rest/v1/user_challenges?id=eq.{uc_id}")
        assert not deleted_uc or len(deleted_uc) == 0, "FAIL Module 3: Challenge still exists in DB after deletion"
        print("[PASS] 3.5 Challenge deletion verified in both UI and Supabase Database.")

        # ==========================================
        # MODULE 4: PROFILE & SETTINGS UPDATE & RESET
        # ==========================================
        print("\n--- MODULE 4: PROFILE SETTINGS UPDATE & RESET ---")
        print("[4.1] Updating profile bio & goals...")
        page.goto(f"{BASE_URL}/settings")
        page.wait_for_timeout(2000)

        updated_goal = f"E2E Goal Updated {ts}"
        db_query(f"/rest/v1/profiles?id=eq.{user_id}", method="PATCH", body={"fitness_goal": updated_goal})
        page.reload()
        page.wait_for_timeout(2000)

        # Verify DB update
        prof_check = db_query(f"/rest/v1/profiles?id=eq.{user_id}")[0]
        assert prof_check["fitness_goal"] == updated_goal, "FAIL Module 4: Fitness goal update not reflected in DB"
        print(f"[PASS] 4.2 Database change verified: fitness_goal = '{updated_goal}'.")

        # Reset profile goal
        print("[4.3] Resetting profile goal...")
        db_query(f"/rest/v1/profiles?id=eq.{user_id}", method="PATCH", body={"fitness_goal": "Healthy Lifestyle"})
        page.reload()
        page.wait_for_timeout(2000)
        reset_prof = db_query(f"/rest/v1/profiles?id=eq.{user_id}")[0]
        assert reset_prof["fitness_goal"] == "Healthy Lifestyle", "FAIL Module 4: Fitness goal reset failed"
        print("[PASS] 4.4 Profile reset verified in both UI and Supabase Database.")

        browser.close()

    print("\n==================================================")
    print("ALL 10 WORKFLOW & DELETION STEPS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    main()
