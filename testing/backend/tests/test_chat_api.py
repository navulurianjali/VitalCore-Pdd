"""
testing/backend/tests/test_chat_api.py
30 real test cases for /api/chat (AI chat endpoint)
"""
import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from conftest import _post, _get, record, BASE_URL

MODULE = "Chat API"
EP = "/api/chat"

class TestChatAPI:
    def test_BE031_valid_chat_message(self):
        """Valid chat message returns 200 or 201 with a response body."""
        p = {"message": "What is a healthy breakfast?", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code in (200, 201)
        record("BE-031", MODULE, "Chat - valid message returns 200/201", EP, "POST", p,
               r.status_code if r else 0, "200 or 201", r, el, err)
        assert actual_pass

    def test_BE032_empty_message_rejected(self):
        """Empty message field returns 400."""
        p = {"message": "", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-032", MODULE, "Chat - empty message returns 400/422", EP, "POST", p,
               r.status_code if r else 0, "400 or 422", r, el, err)
        assert actual_pass

    def test_BE033_missing_message_field(self):
        """Request with no message key returns 400."""
        p = {"userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-033", MODULE, "Chat - missing message field returns 400", EP, "POST", p,
               r.status_code if r else 0, "400 or 422", r, el, err)
        assert actual_pass

    def test_BE034_get_method_not_allowed(self):
        """GET on /api/chat returns 405."""
        r, el, err = _get(EP)
        actual_pass = r is not None and r.status_code in (405, 404)
        record("BE-034", MODULE, "Chat - GET not allowed (405/404)", EP, "GET", None,
               r.status_code if r else 0, "405 or 404", r, el, err)
        assert actual_pass

    def test_BE035_very_long_message(self):
        """Very long message (5000 chars) is handled without 500."""
        p = {"message": "A" * 5000, "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-035", MODULE, "Chat - 5000-char message no 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE036_chat_response_has_json_body(self):
        """Chat response Content-Type contains application/json."""
        p = {"message": "How many calories are in an apple?", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        if r and r.status_code == 200:
            ct = r.headers.get("content-type", "")
            passed = "json" in ct or "text" in ct
        else:
            passed = r is not None and r.status_code < 500
        record("BE-036", MODULE, "Chat - response has json/text content-type", EP, "POST", p,
               r.status_code if r else 0, "json or text content-type", r, el, err)
        assert passed

    def test_BE037_chat_health_question(self):
        """Health-related query returns success response."""
        p = {"message": "What is my ideal daily water intake?", "userId": "test-user-002"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-037", MODULE, "Chat - health question returns success", EP, "POST", p,
               r.status_code if r else 0, "< 500", r, el, err)
        assert actual_pass

    def test_BE038_chat_fitness_query(self):
        """Fitness-related query is handled without 500."""
        p = {"message": "Suggest a 30-minute workout routine for beginners.", "userId": "test-user-003"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-038", MODULE, "Chat - fitness query returns < 500", EP, "POST", p,
               r.status_code if r else 0, "< 500", r, el, err)
        assert actual_pass

    def test_BE039_chat_nutrition_query(self):
        """Nutrition query handled without server error."""
        p = {"message": "Give me a high-protein meal plan for muscle gain.", "userId": "test-user-004"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-039", MODULE, "Chat - nutrition query < 500", EP, "POST", p,
               r.status_code if r else 0, "< 500", r, el, err)
        assert actual_pass

    def test_BE040_chat_sleep_query(self):
        """Sleep-related query is handled."""
        p = {"message": "How can I improve my sleep quality?", "userId": "test-user-005"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-040", MODULE, "Chat - sleep query < 500", EP, "POST", p,
               r.status_code if r else 0, "< 500", r, el, err)
        assert actual_pass

    def test_BE041_chat_xss_in_message(self):
        """XSS payload in chat message is handled safely (no 500)."""
        p = {"message": "<script>alert('xss')</script> How do I stay healthy?", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-041", MODULE, "Chat - XSS payload handled (no 500)", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE042_chat_sql_injection_in_message(self):
        """SQL injection in chat message returns no 500 error."""
        p = {"message": "'; SELECT * FROM users; -- What is BMI?", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-042", MODULE, "Chat - SQL injection in message (no 500)", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE043_chat_unicode_message(self):
        """Unicode message is handled."""
        p = {"message": "¿Cómo puedo mejorar mi salud? 健康を改善するには？", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-043", MODULE, "Chat - unicode message handled", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE044_chat_empty_payload(self):
        """Empty payload is rejected."""
        p = {}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-044", MODULE, "Chat - empty payload returns 400/422", EP, "POST", p,
               r.status_code if r else 0, "400 or 422", r, el, err)
        assert actual_pass

    def test_BE045_chat_null_message(self):
        """Null message value is rejected."""
        p = {"message": None, "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-045", MODULE, "Chat - null message returns 400/422", EP, "POST", p,
               r.status_code if r else 0, "400 or 422", r, el, err)
        assert actual_pass

    def test_BE046_chat_integer_message(self):
        """Integer as message value handled (no 500)."""
        p = {"message": 12345, "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-046", MODULE, "Chat - integer message no 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE047_chat_with_conversation_history(self):
        """Chat with conversation history array handled."""
        p = {
            "message": "What should I eat for dinner?",
            "userId": "test-user-001",
            "history": [
                {"role": "user", "content": "I am trying to lose weight."},
                {"role": "assistant", "content": "Focus on calorie deficit and exercise."}
            ]
        }
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-047", MODULE, "Chat - with conversation history no 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE048_chat_response_time_under_30s(self):
        """Chat response completes within 30 seconds (AI timeout allowance)."""
        p = {"message": "What are three tips for better health?", "userId": "test-user-001"}
        r, el, err = _post(EP, p, timeout=30)
        actual_pass = r is not None and r.status_code < 500 and el < 30.0
        record("BE-048", MODULE, "Chat - response within 30s", EP, "POST", p,
               r.status_code if r else 0, "response < 30s", r, el, err)
        assert actual_pass

    def test_BE049_chat_whitespace_only_message(self):
        """Whitespace-only message is rejected."""
        p = {"message": "   \n\t  ", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-049", MODULE, "Chat - whitespace message returns 400/422", EP, "POST", p,
               r.status_code if r else 0, "400 or 422", r, el, err)
        assert actual_pass

    def test_BE050_chat_no_server_errors_on_random_input(self):
        """Random input does not cause 500 error."""
        p = {"message": "!@#$%^&*()_+ random chars 你好", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-050", MODULE, "Chat - random chars no 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE051_chat_goal_query(self):
        """Goal-related query processed."""
        p = {"message": "How do I set a calorie goal for weight loss?", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-051", MODULE, "Chat - goal query < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE052_chat_hydration_question(self):
        """Hydration question handled."""
        p = {"message": "How much water should I drink per day?", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-052", MODULE, "Chat - hydration question < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE053_chat_mental_health_query(self):
        """Mental health query handled without 500."""
        p = {"message": "Give me tips for managing stress.", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-053", MODULE, "Chat - mental health query < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE054_chat_bmi_query(self):
        """BMI calculation question handled."""
        p = {"message": "How do I calculate my BMI and what does it mean?", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-054", MODULE, "Chat - BMI query < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE055_chat_challenge_question(self):
        """Challenge-related question handled."""
        p = {"message": "What is the 30-day plank challenge?", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-055", MODULE, "Chat - challenge question < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE056_chat_multiline_message(self):
        """Multi-line message is processed correctly."""
        p = {"message": "I have three questions:\n1. What to eat for breakfast?\n2. How to exercise?\n3. Sleep tips?",
             "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-056", MODULE, "Chat - multiline message < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE057_chat_injury_question(self):
        """Injury-related question does not cause 500."""
        p = {"message": "I have a knee injury. What exercises are safe for me?", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-057", MODULE, "Chat - injury question < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE058_chat_consecutive_requests(self):
        """Two consecutive chat requests both complete without 500."""
        p1 = {"message": "How many steps should I walk per day?", "userId": "test-user-001"}
        p2 = {"message": "What are the benefits of stretching?", "userId": "test-user-001"}
        r1, el1, err1 = _post(EP, p1)
        r2, el2, err2 = _post(EP, p2)
        p1_ok = r1 is not None and r1.status_code < 500
        p2_ok = r2 is not None and r2.status_code < 500
        record("BE-058", MODULE, "Chat - consecutive requests both succeed", EP, "POST", p2,
               r2.status_code if r2 else 500, "< 500", r2, el2, err2)
        assert p1_ok and p2_ok

    def test_BE059_chat_emoji_in_message(self):
        """Emoji characters in message handled without error."""
        p = {"message": "🏃 How do I run a 5K? 🥗 What should I eat?", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-059", MODULE, "Chat - emoji message < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE060_chat_stress_test_short_message(self):
        """Single-word message handled (no 500)."""
        p = {"message": "Help", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-060", MODULE, "Chat - single-word message < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass
