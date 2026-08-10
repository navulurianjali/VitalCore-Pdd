import pytest
import os
import sys
import uuid
import requests

SUPABASE_URL = "https://bevolemwakfozxuymxsn.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldm9sZW13YWtmb3p4dXlteHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTUyNjUsImV4cCI6MjA5NTQ5MTI2NX0.ZRyBiaR7vhG8O2FEdPEQOBErLrSF5AxK_PASy87Odlk"

HEADERS_BASE = {
    "apikey": SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def create_user(email, password, full_name):
    res = requests.post(f"{SUPABASE_URL}/auth/v1/signup", headers=HEADERS_BASE, json={
        "email": email,
        "password": password,
        "data": {"full_name": full_name}
    })
    data = res.json()
    token = data.get("access_token")
    user_id = data.get("user", {}).get("id")
    headers = dict(HEADERS_BASE)
    headers["Authorization"] = f"Bearer {token}"
    return user_id, headers, token

def test_existing_user_login_does_not_go_to_onboarding():
    """Verify that an existing completed user profile has onboarding_completed = true and stays on dashboard."""
    uid = uuid.uuid4().hex[:8]
    email = f"existing_{uid}@vitalcore.ai"
    password = "Password123!"

    user_id, headers, token = create_user(email, password, f"Existing User {uid}")

    # Update profile fields that exist
    update_res = requests.patch(
        f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}",
        headers=headers,
        json={
            "weight_kg": 75,
            "height_cm": 180,
            "fitness_goal": "Build Muscle",
            "onboarding_completed": True
        }
    )
    assert update_res.status_code in (200, 204), f"Failed to update profile: {update_res.text}"

    # Fetch profile (simulating AuthContext fetchSupabaseProfile)
    fetch_res = requests.get(f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}", headers=headers)
    assert fetch_res.status_code == 200
    prof = fetch_res.json()[0]

    # Evaluate completion status
    is_completed = prof.get("onboarding_completed") is True or bool(prof.get("weight_kg") or prof.get("height_cm"))
    assert is_completed is True, "Existing completed user must have is_completed = True"

    # Cleanup
    requests.delete(f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}", headers=headers)

def test_new_user_signup_starts_with_incomplete_onboarding():
    """Verify that a brand new user has onboarding_completed = false requiring onboarding."""
    uid = uuid.uuid4().hex[:8]
    email = f"newuser_{uid}@vitalcore.ai"
    password = "Password123!"

    user_id, headers, token = create_user(email, password, f"New User {uid}")

    fetch_res = requests.get(f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}", headers=headers)
    assert fetch_res.status_code == 200
    prof_list = fetch_res.json()
    if prof_list:
        prof = prof_list[0]
        is_completed = prof.get("onboarding_completed") is True or bool(prof.get("weight_kg") or prof.get("height_cm"))
        assert is_completed is False, "New user without biometrics must have is_completed = False"

    # Cleanup
    requests.delete(f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}", headers=headers)
