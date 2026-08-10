"""Database verification helpers using Supabase client where credentials exist."""

import os

def check_supabase_configured():
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    return bool(url and key)

def get_test_user_credentials(user_type="A"):
    if user_type == "B":
        email = os.environ.get("TEST_USER_B_EMAIL", "test_user_b@vitalcore.ai")
        pwd = os.environ.get("TEST_USER_B_PASSWORD", "TestUserB123!")
    else:
        email = os.environ.get("TEST_USER_A_EMAIL", "test_user_a@vitalcore.ai")
        pwd = os.environ.get("TEST_USER_A_PASSWORD", "TestUserA123!")
    return email, pwd
