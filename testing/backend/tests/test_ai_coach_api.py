"""
testing/backend/tests/test_ai_coach_api.py
30 real test cases for /api/ai-coach (AI Coach endpoint)
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from conftest import _post, _get, record, BASE_URL

MODULE = "AI Coach API"
EP = "/api/ai-coach"

class TestAICoachAPI:
    def test_BE061_valid_ai_coach_request(self):
        """Valid AI coach request returns non-500 response."""
        p = {"prompt": "Give me a weekly workout plan.", "userId": "test-user-001", "mode": "fitness"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-061", MODULE, "AI Coach - valid request < 500", EP, "POST", p,
               r.status_code if r else 0, "< 500", r, el, err)
        assert actual_pass

    def test_BE062_missing_prompt(self):
        """AI coach request with no prompt is rejected."""
        p = {"userId": "test-user-001", "mode": "wellness"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-062", MODULE, "AI Coach - missing prompt returns 400/422", EP, "POST", p,
               r.status_code if r else 0, "400 or 422", r, el, err)
        assert actual_pass

    def test_BE063_empty_prompt(self):
        """Empty prompt is rejected."""
        p = {"prompt": "", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-063", MODULE, "AI Coach - empty prompt returns 400/422", EP, "POST", p,
               r.status_code if r else 0, "400 or 422", r, el, err)
        assert actual_pass

    def test_BE064_wellness_mode_prompt(self):
        """Wellness mode prompt processed without error."""
        p = {"prompt": "How can I improve my overall wellbeing?", "userId": "test-user-001", "mode": "wellness"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-064", MODULE, "AI Coach - wellness mode < 500", EP, "POST", p,
               r.status_code if r else 0, "< 500", r, el, err)
        assert actual_pass

    def test_BE065_weight_loss_mode_prompt(self):
        """Weight loss mode prompt processed."""
        p = {"prompt": "Create a 4-week weight loss plan for me.", "userId": "test-user-001", "mode": "weight_loss"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-065", MODULE, "AI Coach - weight loss mode < 500", EP, "POST", p,
               r.status_code if r else 0, "< 500", r, el, err)
        assert actual_pass

    def test_BE066_muscle_gain_mode_prompt(self):
        """Muscle gain mode prompt processed."""
        p = {"prompt": "Design a muscle building workout split.", "userId": "test-user-001", "mode": "muscle_gain"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-066", MODULE, "AI Coach - muscle gain mode < 500", EP, "POST", p,
               r.status_code if r else 0, "< 500", r, el, err)
        assert actual_pass

    def test_BE067_get_method_returns_404_or_405(self):
        """GET on ai-coach returns 404 or 405."""
        r, el, err = _get(EP)
        actual_pass = r is not None and r.status_code in (404, 405)
        record("BE-067", MODULE, "AI Coach - GET returns 404/405", EP, "GET", None,
               r.status_code if r else 0, "404 or 405", r, el, err)
        assert actual_pass

    def test_BE068_xss_in_prompt(self):
        """XSS in prompt handled safely."""
        p = {"prompt": "<img src=x onerror=alert(1)> Make me healthier.", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-068", MODULE, "AI Coach - XSS in prompt no 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE069_very_long_prompt(self):
        """Prompt with 4000 characters handled without 500."""
        p = {"prompt": "Explain health tips. " * 200, "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-069", MODULE, "AI Coach - 4000-char prompt no 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE070_nutrition_prompt(self):
        """Nutrition-focused prompt handled."""
        p = {"prompt": "Build a 2000 calorie meal plan with macros.", "userId": "test-user-001", "mode": "nutrition"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-070", MODULE, "AI Coach - nutrition prompt < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE071_sleep_improvement_prompt(self):
        """Sleep improvement prompt handled."""
        p = {"prompt": "Create a sleep improvement plan for 4 weeks.", "userId": "test-user-001", "mode": "wellness"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-071", MODULE, "AI Coach - sleep prompt < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE072_challenge_prompt(self):
        """Challenge generation prompt handled."""
        p = {"prompt": "Create a 30-day fitness challenge for me.", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-072", MODULE, "AI Coach - challenge prompt < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE073_response_contains_body(self):
        """Successful AI coach response contains non-empty body."""
        p = {"prompt": "Give me one health tip.", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        if r and r.status_code < 500:
            has_body = len(r.content) > 0
            passed = has_body
        else:
            passed = False
        record("BE-073", MODULE, "AI Coach - response has non-empty body", EP, "POST", p,
               r.status_code if r else 500, "non-empty response body", r, el, err)
        assert passed

    def test_BE074_null_prompt(self):
        """Null prompt handled (no 500)."""
        p = {"prompt": None, "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-074", MODULE, "AI Coach - null prompt returns 400/422", EP, "POST", p,
               r.status_code if r else 0, "400 or 422", r, el, err)
        assert actual_pass

    def test_BE075_integer_prompt_field(self):
        """Integer in prompt field handled without 500."""
        p = {"prompt": 12345, "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-075", MODULE, "AI Coach - integer prompt no 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE076_empty_payload(self):
        """Empty JSON payload returns 400/422."""
        p = {}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code in (400, 422)
        record("BE-076", MODULE, "AI Coach - empty payload returns 400/422", EP, "POST", p,
               r.status_code if r else 0, "400 or 422", r, el, err)
        assert actual_pass

    def test_BE077_unicode_prompt(self):
        """Unicode prompt handled."""
        p = {"prompt": "请给我一个健康计划. Gesundheitsplan für mich.", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-077", MODULE, "AI Coach - unicode prompt < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE078_emoji_prompt(self):
        """Emoji in prompt handled without 500."""
        p = {"prompt": "🏋️ Give me a gym plan 🥗 and meal ideas.", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-078", MODULE, "AI Coach - emoji in prompt < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE079_response_time_acceptable(self):
        """AI Coach response completes within 60 seconds."""
        p = {"prompt": "What is a balanced diet?", "userId": "test-user-001"}
        r, el, err = _post(EP, p, timeout=60)
        actual_pass = r is not None and r.status_code < 500 and el < 60.0
        record("BE-079", MODULE, "AI Coach - response within 60s", EP, "POST", p,
               r.status_code if r else 0, "< 60s, < 500", r, el, err)
        assert actual_pass

    def test_BE080_hydration_prompt(self):
        """Hydration advice prompt handled."""
        p = {"prompt": "Create a daily hydration tracking plan for 2 liters.", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-080", MODULE, "AI Coach - hydration prompt < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE081_streamed_response_handled(self):
        """Streamed response if any returns non-500."""
        p = {"prompt": "List 5 healthy habits.", "userId": "test-user-001", "stream": True}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-081", MODULE, "AI Coach - stream flag no 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE082_prompt_with_numbers(self):
        """Prompt containing numbers and stats handled."""
        p = {"prompt": "I weigh 80kg, am 175cm tall, 28 years old. Give me a plan.", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-082", MODULE, "AI Coach - prompt with numbers < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE083_prompt_with_url(self):
        """Prompt containing a URL handled safely."""
        p = {"prompt": "Check this: http://example.com/diet-plan and advise me.", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-083", MODULE, "AI Coach - URL in prompt < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE084_mode_unknown_value(self):
        """Unknown mode value handled gracefully (no 500)."""
        p = {"prompt": "Give me a health plan.", "userId": "test-user-001", "mode": "unknown_mode_xyz"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-084", MODULE, "AI Coach - unknown mode no 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE085_markdown_in_prompt(self):
        """Markdown formatting in prompt handled."""
        p = {"prompt": "**Fitness Plan**: Create a plan with:\n- Cardio\n- Strength\n- Flexibility", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-085", MODULE, "AI Coach - markdown prompt < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE086_json_in_prompt(self):
        """JSON string embedded in prompt handled safely."""
        p = {"prompt": 'My data: {"weight":80,"height":175}. Analyze my BMI.', "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-086", MODULE, "AI Coach - JSON in prompt < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE087_calories_prompt(self):
        """Calorie counting prompt handled."""
        p = {"prompt": "How many calories do I need to lose 1kg per week?", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-087", MODULE, "AI Coach - calories prompt < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE088_consecutive_different_prompts(self):
        """Three consecutive different prompts all return non-500."""
        prompts = [
            "How do I stay hydrated?",
            "What are good stretching exercises?",
            "How do I build a morning routine?"
        ]
        results = []
        for i, prompt in enumerate(prompts):
            p = {"prompt": prompt, "userId": "test-user-001"}
            r, el, err = _post(EP, p)
            results.append(r is not None and r.status_code < 500)
        record("BE-088", MODULE, "AI Coach - 3 consecutive prompts all < 500", EP, "POST",
               {"prompt": "three prompts"}, prompts[-1],
               "all < 500",
               type("R", (), {"status_code": 200 if all(results) else 500})(),
               el, err)
        assert all(results)

    def test_BE089_diet_type_specific_prompt(self):
        """Vegetarian diet prompt handled."""
        p = {"prompt": "I am vegetarian. Create a protein-rich meal plan.", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-089", MODULE, "AI Coach - vegetarian diet prompt < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass

    def test_BE090_chronic_condition_prompt(self):
        """Health condition context prompt handled safely."""
        p = {"prompt": "I have type 2 diabetes. What diet changes should I make?", "userId": "test-user-001"}
        r, el, err = _post(EP, p)
        actual_pass = r is not None and r.status_code < 500
        record("BE-090", MODULE, "AI Coach - chronic condition prompt < 500", EP, "POST", p,
               r.status_code if r else 500, "< 500", r, el, err)
        assert actual_pass
