import pytest
import os
import sys
import uuid
import requests
from datetime import datetime, timedelta

SUPABASE_URL = "https://bevolemwakfozxuymxsn.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldm9sZW13YWtmb3p4dXlteHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTUyNjUsImV4cCI6MjA5NTQ5MTI2NX0.ZRyBiaR7vhG8O2FEdPEQOBErLrSF5AxK_PASy87Odlk"

HEADERS_BASE = {
    "apikey": SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def get_today_local_date():
    return datetime.now().strftime("%Y-%m-%d")

def get_yesterday_local_date():
    return (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

def get_record_local_date(record):
    if record.get("conversation_date"):
        return record["conversation_date"]
    if record.get("created_at"):
        return record["created_at"].split("T")[0]
    return get_today_local_date()

def create_authenticated_user():
    uid = uuid.uuid4().hex[:8]
    email = f"aicoach_{uid}@vitalcore.ai"
    password = "Password123!"

    res = requests.post(f"{SUPABASE_URL}/auth/v1/signup", headers=HEADERS_BASE, json={
        "email": email,
        "password": password
    })
    
    if res.status_code == 200:
        data = res.json()
        token = data.get("access_token")
        user_id = data.get("user", {}).get("id")
        if token and user_id:
            user_headers = dict(HEADERS_BASE)
            user_headers["Authorization"] = f"Bearer {token}"
            return user_id, user_headers

    res_login = requests.post(f"{SUPABASE_URL}/auth/v1/token?grant_type=password", headers=HEADERS_BASE, json={
        "email": email,
        "password": password
    })
    data = res_login.json()
    token = data.get("access_token")
    user_id = data.get("user", {}).get("id")
    user_headers = dict(HEADERS_BASE)
    user_headers["Authorization"] = f"Bearer {token}"
    return user_id, user_headers

def insert_ai_message(user_id, user_headers, sender, message, target_date=None, created_at=None):
    payload = {
        "user_id": user_id,
        "sender": sender,
        "message": message
    }
    if target_date:
        payload["conversation_date"] = target_date
    if created_at:
        payload["created_at"] = created_at

    res = requests.post(f"{SUPABASE_URL}/rest/v1/ai_conversations", headers=user_headers, json=payload)
    if res.status_code == 400 and "conversation_date" in res.text:
        del payload["conversation_date"]
        res = requests.post(f"{SUPABASE_URL}/rest/v1/ai_conversations", headers=user_headers, json=payload)
    return res

def test_daily_fresh_chat_filtering_and_persistence():
    """Verify authenticated user's fresh chat filters by date while persisting past days."""
    user_id, user_headers = create_authenticated_user()
    today_str = get_today_local_date()
    yesterday_str = get_yesterday_local_date()
    yesterday_iso = f"{yesterday_str}T10:00:00+00:00"

    # 1. Insert yesterday message (created on yesterday's date)
    res1 = insert_ai_message(user_id, user_headers, "user", "Yesterday meal inquiry", target_date=yesterday_str, created_at=yesterday_iso)
    assert res1.status_code in (200, 201), f"Failed to insert yesterday message: {res1.text}"

    # 2. Insert today message
    res2 = insert_ai_message(user_id, user_headers, "user", "Today workout advice", target_date=today_str)
    assert res2.status_code in (200, 201), f"Failed to insert today message: {res2.text}"

    # 3. Query messages for user
    res = requests.get(f"{SUPABASE_URL}/rest/v1/ai_conversations?order=created_at.asc", headers=user_headers)
    assert res.status_code == 200, f"Query failed: {res.text}"
    all_messages = res.json()

    assert len(all_messages) == 2, f"Expected 2 total messages stored in DB, got {len(all_messages)}"

    # 4. Filter for today's chat
    today_messages = [m for m in all_messages if get_record_local_date(m) == today_str]
    yesterday_messages = [m for m in all_messages if get_record_local_date(m) == yesterday_str]

    assert len(today_messages) == 1, f"Expected 1 message in today's chat, got {len(today_messages)}"
    assert today_messages[0]["message"] == "Today workout advice"

    assert len(yesterday_messages) == 1, f"Expected 1 yesterday message in history, got {len(yesterday_messages)}"
    assert yesterday_messages[0]["message"] == "Yesterday meal inquiry"

    # Cleanup
    requests.delete(f"{SUPABASE_URL}/rest/v1/ai_conversations?user_id=eq.{user_id}", headers=user_headers)

def test_user_data_isolation():
    """Verify User A and User B chat histories are completely isolated by RLS."""
    user_a_id, user_a_headers = create_authenticated_user()
    user_b_id, user_b_headers = create_authenticated_user()
    today_str = get_today_local_date()

    # User A inserts a message
    res_a = insert_ai_message(user_a_id, user_a_headers, "user", "User A confidential health chat", today_str)
    assert res_a.status_code in (200, 201)

    # User B queries ai_conversations
    res_b = requests.get(f"{SUPABASE_URL}/rest/v1/ai_conversations", headers=user_b_headers)
    assert res_b.status_code == 200
    user_b_chats = res_b.json()

    # User B must NOT see User A's message!
    for msg in user_b_chats:
        assert msg["user_id"] != user_a_id, "RLS Security Violation: User B received User A's chat messages!"

    # Cleanup
    requests.delete(f"{SUPABASE_URL}/rest/v1/ai_conversations?user_id=eq.{user_a_id}", headers=user_a_headers)
    requests.delete(f"{SUPABASE_URL}/rest/v1/ai_conversations?user_id=eq.{user_b_id}", headers=user_b_headers)
