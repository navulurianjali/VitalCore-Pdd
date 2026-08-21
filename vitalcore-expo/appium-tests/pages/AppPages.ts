import { Browser } from 'webdriverio';
import { BasePage } from './BasePage';
export class DashboardPage extends BasePage {
  private readonly GREETING = 'dashboard_greeting';
  private readonly CALORIES_VAL = 'dash_calories_value';
  private readonly WATER_VAL = 'dash_water_value';
  private readonly SLEEP_VAL = 'dash_sleep_value';
  private readonly LOG_WATER_250 = 'dash_log_water_250_btn';
  private readonly LOG_WATER_500 = 'dash_log_water_500_btn';
  private readonly HISTORY_BTN = 'dash_history_btn';
  private readonly CALORIE_CARD = 'dash_calorie_tracker_btn';
  private readonly SLEEP_CARD = 'dash_sleep_btn';
  private readonly HOME_TAB = 'tab_home';
  private readonly HABITS_TAB = 'tab_habits';
  private readonly AI_COACH_TAB = 'tab_ai_coach';
  private readonly PROFILE_TAB = 'tab_profile';

  constructor(driver: Browser) { super(driver); }

  async waitForLoad(): Promise<void> { await this.waitForElement(this.GREETING, 10000); }
  async getGreeting(): Promise<string> { return this.getText(this.GREETING); }
  async isCaloriesVisible(): Promise<boolean> { return this.isDisplayed(this.CALORIES_VAL); }
  async isWaterVisible(): Promise<boolean> { return this.isDisplayed(this.WATER_VAL); }
  async isSleepVisible(): Promise<boolean> { return this.isDisplayed(this.SLEEP_VAL); }
  async tapLogWater250(): Promise<void> { await this.tap(this.LOG_WATER_250); await this.pause(500); }
  async tapLogWater500(): Promise<void> { await this.tap(this.LOG_WATER_500); await this.pause(500); }
  async tapHistory(): Promise<void> { await this.tap(this.HISTORY_BTN); }
  async tapCalorieTracker(): Promise<void> { await this.tap(this.CALORIE_CARD); }
  async tapSleep(): Promise<void> { await this.tap(this.SLEEP_CARD); }
  async tapHomeTab(): Promise<void> { await this.tap(this.HOME_TAB); }
  async tapHabitsTab(): Promise<void> { await this.tap(this.HABITS_TAB); }
  async tapAiCoachTab(): Promise<void> { await this.tap(this.AI_COACH_TAB); }
  async tapProfileTab(): Promise<void> { await this.tap(this.PROFILE_TAB); }
}

export class IntroPage extends BasePage {
  private readonly GET_STARTED = 'intro_get_started_btn';
  private readonly LOGIN_BTN = 'intro_login_btn';
  private readonly NEXT_BTN = 'intro_next_btn';
  private readonly SKIP_BTN = 'intro_skip_btn';

  constructor(driver: Browser) { super(driver); }
  async tapGetStarted(): Promise<void> { await this.tap(this.GET_STARTED); }
  async tapLogin(): Promise<void> { await this.tap(this.LOGIN_BTN); }
  async tapNext(): Promise<void> { await this.tap(this.NEXT_BTN); }
  async tapSkip(): Promise<void> { await this.tap(this.SKIP_BTN); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.LOGIN_BTN, 10000); }
}

export class RegisterPage extends BasePage {
  private readonly NAME_INPUT = 'reg_name_input';
  private readonly USERNAME_INPUT = 'reg_username_input';
  private readonly EMAIL_INPUT = 'reg_email_input';
  private readonly DOB_INPUT = 'reg_dob_input';
  private readonly PASSWORD_INPUT = 'reg_password_input';
  private readonly CONFIRM_PASSWORD = 'reg_confirm_password_input';
  private readonly REGISTER_BTN = 'reg_submit_btn';
  private readonly LOGIN_LINK = 'reg_login_link';
  private readonly ERROR_MSG = 'reg_error_msg';

  constructor(driver: Browser) { super(driver); }
  async enterName(name: string): Promise<void> { await this.typeText(this.NAME_INPUT, name); }
  async enterUsername(username: string): Promise<void> { await this.typeText(this.USERNAME_INPUT, username); }
  async enterEmail(email: string): Promise<void> { await this.typeText(this.EMAIL_INPUT, email); }
  async enterDob(dob: string): Promise<void> { await this.typeText(this.DOB_INPUT, dob); }
  async enterPassword(password: string): Promise<void> { await this.typeText(this.PASSWORD_INPUT, password); }
  async enterConfirmPassword(password: string): Promise<void> { await this.typeText(this.CONFIRM_PASSWORD, password); }
  async tapRegister(): Promise<void> { await this.tap(this.REGISTER_BTN); await this.pause(1500); }
  async tapLoginLink(): Promise<void> { await this.tap(this.LOGIN_LINK); }
  async getErrorMessage(): Promise<string> { return this.getText(this.ERROR_MSG); }
  async isErrorVisible(): Promise<boolean> { return this.isDisplayed(this.ERROR_MSG); }
}

export class OnboardingPage extends BasePage {
  private readonly NAME_INPUT = 'onboarding_name_input';
  private readonly AGE_INPUT = 'onboarding_age_input';
  private readonly GENDER_MALE = 'onboarding_gender_male';
  private readonly STEP1_NEXT = 'onboarding_step1_next';
  private readonly HEIGHT_INPUT = 'onboarding_height_input';
  private readonly WEIGHT_INPUT = 'onboarding_weight_input';
  private readonly STEP2_NEXT = 'onboarding_step2_next';
  private readonly GOAL_0 = 'onboarding_goal_0';
  private readonly STEP3_NEXT = 'onboarding_step3_next';
  private readonly FOOD_0 = 'onboarding_food_0';
  private readonly STEP4_NEXT = 'onboarding_step4_next';
  private readonly MED_0 = 'onboarding_med_0';
  private readonly STEP5_NEXT = 'onboarding_step5_next';
  private readonly ACTIVITY_0 = 'onboarding_activity_0';
  private readonly SLEEP_INPUT = 'onboarding_sleep_input';
  private readonly STEP6_NEXT = 'onboarding_step6_next';
  private readonly FINISH_BTN = 'onboarding_finish_btn';

  constructor(driver: Browser) { super(driver); }
  async completeOnboardingSteps(): Promise<void> {
    await this.typeText(this.NAME_INPUT, 'Test User');
    await this.typeText(this.AGE_INPUT, '28');
    await this.tap(this.GENDER_MALE);
    await this.tap(this.STEP1_NEXT);
    await this.pause(500);
    await this.typeText(this.HEIGHT_INPUT, '175');
    await this.typeText(this.WEIGHT_INPUT, '70');
    await this.tap(this.STEP2_NEXT);
    await this.pause(500);
    await this.tap(this.GOAL_0);
    await this.tap(this.STEP3_NEXT);
    await this.pause(500);
    await this.tap(this.FOOD_0);
    await this.tap(this.STEP4_NEXT);
    await this.pause(500);
    await this.tap(this.MED_0);
    await this.tap(this.STEP5_NEXT);
    await this.pause(500);
    await this.tap(this.ACTIVITY_0);
    await this.typeText(this.SLEEP_INPUT, '8');
    await this.tap(this.STEP6_NEXT);
    await this.pause(500);
    await this.tap(this.FINISH_BTN);
    await this.pause(2000);
  }
}

export class AICoachPage extends BasePage {
  private readonly INPUT = 'ai_coach_input';
  private readonly SEND_BTN = 'ai_coach_send_btn';
  private readonly SUGGEST_0 = 'ai_coach_suggest_0';
  private readonly HISTORY_BTN = 'ai_coach_history_btn';
  private readonly MESSAGES_LIST = 'ai_coach_messages_list';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.INPUT); }
  async sendMessage(msg: string): Promise<void> {
    await this.typeText(this.INPUT, msg);
    await this.tap(this.SEND_BTN);
    await this.pause(1000);
  }
  async tapFirstSuggestion(): Promise<void> { await this.tap(this.SUGGEST_0); await this.pause(1000); }
  async isChatVisible(): Promise<boolean> { return this.isDisplayed(this.MESSAGES_LIST); }
  async tapHistory(): Promise<void> { await this.tap(this.HISTORY_BTN); }
}

export class ProfilePage extends BasePage {
  private readonly NAME_INPUT = 'profile_name_input';
  private readonly DOB_INPUT = 'profile_dob_input';
  private readonly GENDER_INPUT = 'profile_gender_input';
  private readonly BLOOD_DROPDOWN = 'profile_blood_group_dropdown';
  private readonly BLOOD_OPOS = 'profile_blood_item_Opos';
  private readonly SAVE_BTN = 'profile_save_btn';
  private readonly SETTINGS_BTN = 'profile_settings_btn';
  private readonly LOGOUT_BTN = 'profile_logout_btn';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.SAVE_BTN); }
  async tapBloodGroupDropdown(): Promise<void> { await this.tap(this.BLOOD_DROPDOWN); await this.pause(400); }
  async selectBloodGroupOpos(): Promise<void> { await this.tap(this.BLOOD_OPOS); await this.pause(400); }
  async editName(name: string): Promise<void> { await this.typeText(this.NAME_INPUT, name); }
  async tapSave(): Promise<void> { await this.tap(this.SAVE_BTN); await this.pause(1000); }
  async tapSettings(): Promise<void> { await this.tap(this.SETTINGS_BTN); }
  async tapLogout(): Promise<void> { await this.tap(this.LOGOUT_BTN); await this.pause(1000); }
}

export class SleepPage extends BasePage {
  private readonly LOG_TRIGGER = 'sleep_log_trigger_btn';
  private readonly BACK_BTN = 'sleep_back_btn';
  private readonly HOURS_INPUT = 'sleep_hours_input';
  private readonly QUALITY_8 = 'sleep_quality_rating_8';
  private readonly SAVE_BTN = 'sleep_save_btn';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.LOG_TRIGGER); }
  async tapLogSleep(): Promise<void> { await this.tap(this.LOG_TRIGGER); await this.pause(400); }
  async enterSleepHours(h: string): Promise<void> { await this.typeText(this.HOURS_INPUT, h); }
  async selectQuality8(): Promise<void> { await this.tap(this.QUALITY_8); }
  async tapSave(): Promise<void> { await this.tap(this.SAVE_BTN); await this.pause(1000); }
  async tapBack(): Promise<void> { await this.tap(this.BACK_BTN); }
}

export class FitnessPage extends BasePage {
  private readonly TAB_COACH = 'fitness_tab_coach';
  private readonly TAB_HISTORY = 'fitness_tab_history';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.TAB_COACH); }
  async tapCoachTab(): Promise<void> { await this.tap(this.TAB_COACH); }
  async tapHistoryTab(): Promise<void> { await this.tap(this.TAB_HISTORY); }
}

export class CalorieTrackerPage extends BasePage {
  private readonly BACK_BTN = 'calorie_back_btn';
  private readonly ADD_BREAKFAST = 'calorie_add_breakfast_btn';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.ADD_BREAKFAST); }
  async tapAddBreakfast(): Promise<void> { await this.tap(this.ADD_BREAKFAST); }
  async tapBack(): Promise<void> { await this.tap(this.BACK_BTN); }
}

export class ChallengesPage extends BasePage {
  private readonly TAB_ALL = 'challenges_tab_All';
  private readonly TAB_FITNESS = 'challenges_tab_Fitness';
  private readonly TAB_NUTRITION = 'challenges_tab_Nutrition';
  private readonly JOIN_BTN_0 = 'challenge_join_btn_0';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.TAB_ALL); }
  async selectCategoryFitness(): Promise<void> { await this.tap(this.TAB_FITNESS); await this.pause(400); }
  async selectCategoryNutrition(): Promise<void> { await this.tap(this.TAB_NUTRITION); await this.pause(400); }
  async tapJoinFirstChallenge(): Promise<void> { await this.tap(this.JOIN_BTN_0); await this.pause(1000); }
}

export class SettingsPage extends BasePage {
  private readonly THEME_TOGGLE = 'settings_theme_toggle';
  private readonly MODE_WELLNESS = 'settings_mode_wellness';
  private readonly MODE_PERF = 'settings_mode_performance';
  private readonly MODE_ELDERLY = 'settings_mode_elderly';
  private readonly UNIT_METRIC = 'settings_unit_metric';
  private readonly UNIT_IMPERIAL = 'settings_unit_imperial';
  private readonly LOGOUT_BTN = 'settings_logout_btn';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.THEME_TOGGLE); }
  async toggleTheme(): Promise<void> { await this.tap(this.THEME_TOGGLE); await this.pause(300); }
  async selectModeWellness(): Promise<void> { await this.tap(this.MODE_WELLNESS); }
  async selectModePerformance(): Promise<void> { await this.tap(this.MODE_PERF); }
  async selectUnitMetric(): Promise<void> { await this.tap(this.UNIT_METRIC); }
  async selectUnitImperial(): Promise<void> { await this.tap(this.UNIT_IMPERIAL); }
  async tapLogout(): Promise<void> { await this.tap(this.LOGOUT_BTN); await this.pause(1000); }
}

export class HistoryPage extends BasePage {
  private readonly BACK_BTN = 'history_back_btn';
  private readonly TAB_DAY = 'history_tab_day';
  private readonly TAB_7DAYS = 'history_tab_7days';
  private readonly TAB_30DAYS = 'history_tab_30days';
  private readonly PREV_DATE_BTN = 'history_prev_date_btn';
  private readonly NEXT_DATE_BTN = 'history_next_date_btn';
  private readonly DATE_TEXT = 'history_current_date_text';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.TAB_DAY); }
  async tapTab7Days(): Promise<void> { await this.tap(this.TAB_7DAYS); }
  async tapTab30Days(): Promise<void> { await this.tap(this.TAB_30DAYS); }
  async tapPrevDate(): Promise<void> { await this.tap(this.PREV_DATE_BTN); await this.pause(400); }
  async tapNextDate(): Promise<void> { await this.tap(this.NEXT_DATE_BTN); await this.pause(400); }
  async getDateText(): Promise<string> { return this.getText(this.DATE_TEXT); }
  async tapBack(): Promise<void> { await this.tap(this.BACK_BTN); }
}

export class FutureLabPage extends BasePage {
  private readonly FEATURE_CARDS = 'future_lab_cards';
  private readonly PREDICTION_CARD = 'health_prediction_card';
  private readonly LONGEVITY_CARD = 'longevity_score_card';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.FEATURE_CARDS); }
  async isFeatureCardsVisible(): Promise<boolean> { return this.isDisplayed(this.FEATURE_CARDS); }
  async tapPredictionCard(): Promise<void> { await this.tap(this.PREDICTION_CARD); }
  async tapLongevityCard(): Promise<void> { await this.tap(this.LONGEVITY_CARD); }
}

export class CommunityPage extends BasePage {
  private readonly FEED = 'community_feed';
  private readonly NEW_POST_BTN = 'new_post_button';
  private readonly POST_INPUT = 'post_content_input';
  private readonly SUBMIT_POST = 'submit_post_button';
  private readonly LIKE_BTN = 'like_post_button';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.FEED); }
  async tapNewPost(): Promise<void> { await this.tap(this.NEW_POST_BTN); }
  async typePostContent(content: string): Promise<void> { await this.typeText(this.POST_INPUT, content); }
  async tapSubmitPost(): Promise<void> { await this.tap(this.SUBMIT_POST); await this.pause(1000); }
  async tapLikeOnFirstPost(): Promise<void> { await this.tap(this.LIKE_BTN); }
  async isFeedVisible(): Promise<boolean> { return this.isDisplayed(this.FEED); }
}

export class CameraPage extends BasePage {
  private readonly CAMERA_VIEW = 'camera_preview';
  private readonly CAPTURE_BTN = 'capture_button';
  private readonly CLOSE_BTN = 'camera_close_button';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.CAMERA_VIEW, 12000); }
  async tapCapture(): Promise<void> { await this.tap(this.CAPTURE_BTN); }
  async tapClose(): Promise<void> { await this.tap(this.CLOSE_BTN); }
  async isCameraVisible(): Promise<boolean> { return this.isDisplayed(this.CAMERA_VIEW); }
}
