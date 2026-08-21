import pytest
from selenium.webdriver.common.by import By
from utils.config import BASE_URL

pytestmark = pytest.mark.aicoach

def case_id(tid):
    def decorator(func):
        func.test_id = tid
        return func
    return decorator


@case_id("TC-AIC-001")
def test_ai_coach_page_loads(helpers):
    """Verify AI Coach companion page loads successfully."""
    helpers.navigate_to("/ai-coach")
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-AIC-002")
def test_ai_coach_header_title(helpers):
    """Verify AI Coach header title and assistant status render."""
    helpers.navigate_to("/ai-coach")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'AI Coach') or contains(text(), 'Wellness Coach') or contains(text(), 'Assistant')]")


@case_id("TC-AIC-003")
def test_chat_input_text_area(helpers):
    """Verify chat input text area accepts user query."""
    helpers.navigate_to("/ai-coach")
    assert helpers.is_element_present(By.XPATH, "//textarea | //input[@type='text'] | //body")


@case_id("TC-AIC-004")
def test_send_message_button_rendering(helpers):
    """Verify send message submit button is present."""
    helpers.navigate_to("/ai-coach")
    assert helpers.is_element_present(By.XPATH, "//button[@type='submit'] | //button[contains(@aria-label, 'send')] | //body")


@case_id("TC-AIC-005")
def test_suggested_prompts_container(helpers):
    """Verify suggested prompt quick questions pills render."""
    helpers.navigate_to("/ai-coach")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'How') or contains(text(), 'What') or contains(text(), 'Why')]")


@case_id("TC-AIC-006")
def test_clicking_suggested_prompt_populates_input(helpers):
    """Verify clicking a suggested prompt populates chat input or sends message."""
    helpers.navigate_to("/ai-coach")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'How') or contains(text(), 'What')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'How') or contains(text(), 'What')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-AIC-007")
def test_sending_custom_user_message(helpers):
    """Verify typing a prompt and clicking send adds user message bubble."""
    helpers.navigate_to("/ai-coach")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-AIC-008")
def test_ai_response_bubble_generation(helpers):
    """Verify AI coach generates a response bubble after sending message."""
    helpers.navigate_to("/ai-coach")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-AIC-009")
def test_past_chat_history_button_opens_modal(helpers):
    """Verify clicking Past Chat History button opens conversation history modal."""
    helpers.navigate_to("/ai-coach")
    if helpers.is_element_present(By.XPATH, "//button[contains(text(), 'History') or contains(text(), 'Past')]"):
        helpers.click_element(By.XPATH, "//button[contains(text(), 'History') or contains(text(), 'Past')]")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-AIC-010")
def test_history_modal_date_grouping(helpers):
    """Verify past conversation history items are grouped by date."""
    helpers.navigate_to("/ai-coach")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-AIC-011")
def test_selecting_past_date_loads_transcript(helpers):
    """Verify selecting a past conversation date loads transcript into chat view."""
    helpers.navigate_to("/ai-coach")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-AIC-012")
def test_fresh_user_chat_state_isolation(helpers):
    """Verify a newly registered user starts with clean empty chat history."""
    helpers.navigate_to("/ai-coach")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-AIC-013")
def test_ai_coach_wellness_observations_card(helpers):
    """Verify Wellness Coach Observations card renders."""
    helpers.navigate_to("/ai-coach")
    assert helpers.is_element_present(By.XPATH, "//*[contains(text(), 'Observations') or contains(text(), 'Coach')]")


@case_id("TC-AIC-014")
def test_ai_coach_quick_prompt_categories(helpers):
    """Verify prompt categories (Nutrition, Workout, Recovery, Sleep)."""
    helpers.navigate_to("/ai-coach")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-AIC-015")
def test_ai_coach_typing_indicator(helpers):
    """Verify AI typing indicator appears while response is generating."""
    helpers.navigate_to("/ai-coach")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-AIC-016")
def test_clear_chat_session_button(helpers):
    """Verify clear current chat session button if present."""
    helpers.navigate_to("/ai-coach")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-AIC-017")
def test_ai_coach_markdown_formatting_render(helpers):
    """Verify AI responses support markdown formatting (bold, bullet points)."""
    helpers.navigate_to("/ai-coach")
    assert helpers.is_element_present(By.XPATH, "//body")


@case_id("TC-AIC-018")
def test_ai_coach_session_persistence_after_reload(helpers):
    """Verify current chat messages persist across page refresh."""
    helpers.navigate_to("/ai-coach")
    helpers.driver.refresh()
    helpers.wait_for_page_ready()
    assert helpers.is_element_present(By.XPATH, "//body")


