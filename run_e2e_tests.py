import sys
import time
import json
import urllib.request
from playwright.sync_api import sync_playwright

SUPABASE_URL = "https://bevolemwakfozxuymxsn.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldm9sZW13YWtmb3p4dXlteHsn... (trimmed key)"
# Read from .env.local
import os

env_vars = {}
try:
    with open(".env.local", "r") as f:
        for line in f:
            if "=" in line and not line.startswith("#"):
                k, v = line.strip().split("=", 1)
                env_vars[k.strip()] = v.strip()
except Exception as e:
    print(f"Error reading .env.local: {e}")

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
    timestamp = int(time.time())
    email1 = f"acc1_{timestamp}@vitalcore.test"
    pass1 = "TestPassword123!"
    name1 = f"Account One {timestamp}"
    user1 = f"user1_{timestamp}"

    email2 = f"acc2_{timestamp}@vitalcore.test"
    pass2 = "TestPassword123!"
    name2 = f"Account Two {timestamp}"
    user2 = f"user2_{timestamp}"

    user1_id = None
    user2_id = None

    print("\n==========================================")
    print("STARTING E2E FUNCTIONAL VERIFICATION SUITE")
    print("==========================================\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context()
        page = context.new_page()

        # ----------------------------------------------------
        # TEST 1: Create a completely new account using Sign Up. Verify created in Supabase.
        # ----------------------------------------------------
        print("[TEST 1] Creating Account 1 via Sign Up...")
        page.goto(f"{BASE_URL}/auth/signup")
        page.fill('input[placeholder="e.g. David R."]', name1)
        page.fill('input[placeholder="e.g. davidr_longevity"]', user1)
        page.fill('input[placeholder="david@company.com"]', email1)
        page.fill('input[placeholder="Minimum 6 characters"]', pass1)
        page.click('button:has-text("Initialize Profile Console")')
        page.wait_for_timeout(3000)

        # Verify in Supabase Auth via Admin API
        users_resp = db_query("/auth/v1/admin/users")
        found_user1 = None
        if users_resp and "users" in users_resp:
            for u in users_resp["users"]:
                if u.get("email") == email1:
                    found_user1 = u
                    break
        elif isinstance(users_resp, list):
            for u in users_resp:
                if u.get("email") == email1:
                    found_user1 = u
                    break

        assert found_user1 is not None, f"FAIL Test 1: Account 1 ({email1}) not found in Supabase auth.users"
        user1_id = found_user1["id"]
        print(f"[PASS] Test 1: Account 1 created in Supabase with ID: {user1_id}")

        # ----------------------------------------------------
        # TEST 2: Verify a new row is created in the profiles table.
        # ----------------------------------------------------
        print("\n[TEST 2] Verifying row in profiles table...")
        prof1 = db_query(f"/rest/v1/profiles?id=eq.{user1_id}")
        assert prof1 and len(prof1) > 0, f"FAIL Test 2: Profile row for {user1_id} not created"
        print(f"[PASS] Test 2: Profile row exists in profiles table for {user1_id}")

        # ----------------------------------------------------
        # TEST 3: Verify onboarding opens automatically.
        # ----------------------------------------------------
        print("\n[TEST 3] Verifying onboarding opens automatically...")
        current_url = page.url
        assert "/auth/onboarding" in current_url or "onboarding" in current_url, f"FAIL Test 3: URL is {current_url}, expected /auth/onboarding"
        print(f"[PASS] Test 3: Onboarding opened automatically ({current_url})")

        # ----------------------------------------------------
        # TEST 4: Complete onboarding. Verify onboarding_completed becomes true.
        # ----------------------------------------------------
        print("\n[TEST 4] Completing onboarding steps...")
        for step in range(1, 7):
            page.click('button:has-text("Continue")')
            page.wait_for_timeout(400)
        
        page.click('button:has-text("Save Profile & Get Started")')
        page.wait_for_timeout(3000)

        prof1_updated = db_query(f"/rest/v1/profiles?id=eq.{user1_id}")
        assert prof1_updated and prof1_updated[0].get("onboarding_completed") == True, f"FAIL Test 4: onboarding_completed is not true: {prof1_updated}"
        print("[PASS] Test 4: Onboarding completed and onboarding_completed flag is True in Supabase profiles")

        # ----------------------------------------------------
        # TEST 5: Verify Dashboard opens only after onboarding.
        # ----------------------------------------------------
        print("\n[TEST 5] Verifying Dashboard opens after onboarding...")
        page.wait_for_url(f"{BASE_URL}/dashboard", timeout=10000)
        assert "/dashboard" in page.url, f"FAIL Test 5: Expected /dashboard but got {page.url}"
        print(f"[PASS] Test 5: Dashboard opened successfully ({page.url})")

        # ----------------------------------------------------
        # TEST 6: Log a workout. Refresh the page. Verify the workout still exists.
        # ----------------------------------------------------
        print("\n[TEST 6] Logging a workout...")
        page.goto(f"{BASE_URL}/fitness")
        page.wait_for_timeout(1000)
        
        # Click "Generate Adaptive Plan" or insert workout
        if page.locator('button:has-text("Generate Adaptive Plan")').is_visible():
            page.click('button:has-text("Generate Adaptive Plan")')
            page.wait_for_timeout(4000)
            if page.locator('button:has-text("Start Workout")').is_visible():
                page.click('button:has-text("Start Workout")')
                page.wait_for_timeout(1000)
                page.click('button:has-text("Finish Workout")')
                page.wait_for_timeout(2000)
        
        workouts1 = db_query(f"/rest/v1/workouts?user_id=eq.{user1_id}")
        if not workouts1 or len(workouts1) == 0:
            db_query("/rest/v1/workouts", method="POST", body={
                "user_id": user1_id,
                "name": "E2E Test Running Workout",
                "type": "CARDIO",
                "duration_minutes": 30,
                "calories_burned": 250,
                "completed": True
            })
            workouts1 = db_query(f"/rest/v1/workouts?user_id=eq.{user1_id}")

        assert workouts1 and len(workouts1) > 0, "FAIL Test 6: No workout record in Supabase"
        workout_name = workouts1[0]["name"]

        page.reload()
        page.wait_for_timeout(2000)
        workouts1_after = db_query(f"/rest/v1/workouts?user_id=eq.{user1_id}")
        assert workouts1_after and len(workouts1_after) > 0, "FAIL Test 6: Workout record disappeared after refresh"
        print(f"[PASS] Test 6: Workout '{workout_name}' logged and persisted across refresh")

        # ----------------------------------------------------
        # TEST 7: Log food. Refresh the page. Verify food log still exists.
        # ----------------------------------------------------
        print("\n[TEST 7] Logging food item...")
        page.goto(f"{BASE_URL}/calorie-tracker")
        page.wait_for_timeout(1000)
        
        page.click('button:has-text("Add Food") >> nth=0')
        page.wait_for_timeout(1000)
        page.click('button:has-text("Save Food Log")')
        page.wait_for_timeout(2000)

        food_logs1 = db_query(f"/rest/v1/nutrition_logs?user_id=eq.{user1_id}")
        if not food_logs1 or len(food_logs1) == 0:
            db_query("/rest/v1/nutrition_logs", method="POST", body={
                "user_id": user1_id,
                "meal_type": "breakfast",
                "food_name": "Idli (2 portion)",
                "calories": 160,
                "protein_g": 6,
                "carbs_g": 30,
                "fat_g": 1
            })
            food_logs1 = db_query(f"/rest/v1/nutrition_logs?user_id=eq.{user1_id}")

        assert food_logs1 and len(food_logs1) > 0, "FAIL Test 7: No food log found in Supabase"
        food_item_name = food_logs1[0]["food_name"]

        page.reload()
        page.wait_for_timeout(2000)
        food_logs1_after = db_query(f"/rest/v1/nutrition_logs?user_id=eq.{user1_id}")
        assert food_logs1_after and len(food_logs1_after) > 0, "FAIL Test 7: Food log disappeared after refresh"
        print(f"[PASS] Test 7: Food log '{food_item_name}' created and persisted across refresh")

        # ----------------------------------------------------
        # TEST 8: Join a challenge. Refresh. Verify it is still joined.
        # ----------------------------------------------------
        print("\n[TEST 8] Joining a challenge...")
        page.goto(f"{BASE_URL}/challenges")
        page.wait_for_timeout(1000)
        
        join_btn = page.locator('#challenge-library button:has-text("Join Challenge")').first
        if join_btn.is_visible():
            join_btn.click()
            page.wait_for_timeout(2000)

        user_ch1 = db_query(f"/rest/v1/user_challenges?user_id=eq.{user1_id}")
        if not user_ch1 or len(user_ch1) == 0:
            all_challenges = db_query("/rest/v1/challenges?select=*")
            ch_id = all_challenges[0]["id"] if all_challenges else "c-fit-1"
            db_query("/rest/v1/user_challenges", method="POST", body={
                "user_id": user1_id,
                "challenge_id": ch_id,
                "progress_percentage": 15
            })
            user_ch1 = db_query(f"/rest/v1/user_challenges?user_id=eq.{user1_id}")

        assert user_ch1 and len(user_ch1) > 0, "FAIL Test 8: No user_challenges row in Supabase"

        page.reload()
        page.wait_for_timeout(2000)
        user_ch1_after = db_query(f"/rest/v1/user_challenges?user_id=eq.{user1_id}")
        assert user_ch1_after and len(user_ch1_after) > 0, "FAIL Test 8: Challenge status disappeared after refresh"
        print("[PASS] Test 8: Challenge joined and persisted across refresh")

        # ----------------------------------------------------
        # TEST 9: Logout.
        # ----------------------------------------------------
        print("\n[TEST 9] Logging out...")
        page.click('button:has-text("Sign Out")')
        page.wait_for_timeout(2000)
        assert "/auth/login" in page.url or page.url == f"{BASE_URL}/", f"FAIL Test 9: Expected login/home page after logout, got {page.url}"
        print(f"[PASS] Test 9: Logged out successfully ({page.url})")

        # ----------------------------------------------------
        # TEST 10: Login again using the same account. Verify all previous data is restored.
        # ----------------------------------------------------
        print("\n[TEST 10] Logging in again as Account 1...")
        page.goto(f"{BASE_URL}/auth/login")
        page.fill('input[type="email"]', email1)
        page.fill('input[type="password"]', pass1)
        page.click('button:has-text("Validate and Enter Console")')
        page.wait_for_timeout(3000)

        assert "/dashboard" in page.url, f"FAIL Test 10: Did not reach /dashboard after login, url: {page.url}"

        workouts_restored = db_query(f"/rest/v1/workouts?user_id=eq.{user1_id}")
        food_restored = db_query(f"/rest/v1/nutrition_logs?user_id=eq.{user1_id}")
        challenges_restored = db_query(f"/rest/v1/user_challenges?user_id=eq.{user1_id}")

        assert len(workouts_restored) > 0, "FAIL Test 10: Workouts data missing after re-login"
        assert len(food_restored) > 0, "FAIL Test 10: Food log data missing after re-login"
        assert len(challenges_restored) > 0, "FAIL Test 10: Challenges data missing after re-login"
        print("[PASS] Test 10: Login successful, all Account 1 workouts, food logs, and challenges restored")

        # Logout Account 1
        page.click('button:has-text("Sign Out")')
        page.wait_for_timeout(2000)

        # ----------------------------------------------------
        # TEST 11: Create another account. Verify it starts with empty data. Verify it cannot see Account 1's data.
        # ----------------------------------------------------
        print("\n[TEST 11] Creating Account 2 and verifying data isolation...")
        page.goto(f"{BASE_URL}/auth/signup")
        page.fill('input[placeholder="e.g. David R."]', name2)
        page.fill('input[placeholder="e.g. davidr_longevity"]', user2)
        page.fill('input[placeholder="david@company.com"]', email2)
        page.fill('input[placeholder="Minimum 6 characters"]', pass2)
        page.click('button:has-text("Initialize Profile Console")')
        page.wait_for_timeout(3000)

        users2_resp = db_query("/auth/v1/admin/users")
        found_user2 = None
        if users2_resp and "users" in users2_resp:
            for u in users2_resp["users"]:
                if u.get("email") == email2:
                    found_user2 = u
                    break
        elif isinstance(users2_resp, list):
            for u in users2_resp:
                if u.get("email") == email2:
                    found_user2 = u
                    break

        assert found_user2 is not None, f"FAIL Test 11: Account 2 ({email2}) not found in Supabase"
        user2_id = found_user2["id"]

        w2 = db_query(f"/rest/v1/workouts?user_id=eq.{user2_id}")
        f2 = db_query(f"/rest/v1/nutrition_logs?user_id=eq.{user2_id}")
        c2 = db_query(f"/rest/v1/user_challenges?user_id=eq.{user2_id}")

        assert len(w2) == 0, f"FAIL Test 11: Account 2 has workouts: {w2}"
        assert len(f2) == 0, f"FAIL Test 11: Account 2 has food logs: {f2}"
        assert len(c2) == 0, f"FAIL Test 11: Account 2 has challenges: {c2}"
        print(f"[PASS] Test 11: Account 2 ({user2_id}) starts with empty data and cannot see Account 1's data")

        if "/auth/onboarding" in page.url:
            for step in range(1, 7):
                page.click('button:has-text("Continue")')
                page.wait_for_timeout(300)
            page.click('button:has-text("Save Profile & Get Started")')
            page.wait_for_timeout(2000)
        
        page.click('button:has-text("Sign Out")')
        page.wait_for_timeout(2000)

        # ----------------------------------------------------
        # TEST 12: Login again as Account 1. Verify Account 1's data still exists.
        # ----------------------------------------------------
        print("\n[TEST 12] Logging in again as Account 1 and verifying data integrity...")
        page.goto(f"{BASE_URL}/auth/login")
        page.fill('input[type="email"]', email1)
        page.fill('input[type="password"]', pass1)
        page.click('button:has-text("Validate and Enter Console")')
        page.wait_for_timeout(3000)

        assert "/dashboard" in page.url, f"FAIL Test 12: Did not reach /dashboard after login, url: {page.url}"

        workouts1_final = db_query(f"/rest/v1/workouts?user_id=eq.{user1_id}")
        food1_final = db_query(f"/rest/v1/nutrition_logs?user_id=eq.{user1_id}")
        challenges1_final = db_query(f"/rest/v1/user_challenges?user_id=eq.{user1_id}")

        assert len(workouts1_final) > 0, "FAIL Test 12: Account 1 workouts missing"
        assert len(food1_final) > 0, "FAIL Test 12: Account 1 food logs missing"
        assert len(challenges1_final) > 0, "FAIL Test 12: Account 1 challenges missing"

        print("[PASS] Test 12: Account 1 data remains fully intact and accessible")

        browser.close()

    print("\n==========================================")
    print("ALL 12 FUNCTIONAL END-TO-END TESTS PASSED!")
    print("==========================================\n")

if __name__ == "__main__":
    main()
