import { Browser } from 'webdriverio';
import { BasePage } from './BasePage';
export class DashboardPage extends BasePage {
  private readonly GREETING = 'dashboard_greeting';
  private readonly CALORIE_RING = 'calorie_ring_widget';
  private readonly SLEEP_WIDGET = 'sleep_widget';
  private readonly STEPS_WIDGET = 'steps_widget';
  private readonly WATER_WIDGET = 'water_widget';
  private readonly LOG_MEAL_BTN = 'quick_log_meal';
  private readonly LOG_WORKOUT_BTN = 'quick_log_workout';
  private readonly LOG_SLEEP_BTN = 'quick_log_sleep';
  private readonly AI_COACH_CARD = 'ai_coach_dashboard_card';
  private readonly WEEKLY_CHART = 'weekly_chart';
  private readonly CHALLENGE_WIDGET = 'challenge_widget';
  private readonly SETTINGS_ICON = 'settings_icon';
  private readonly HOME_TAB = 'tab_home';
  private readonly HABITS_TAB = 'tab_habits';
  private readonly AI_COACH_TAB = 'tab_ai_coach';
  private readonly PROFILE_TAB = 'tab_profile';

  constructor(driver: Browser) { super(driver); }

  async waitForLoad(): Promise<void> { await this.waitForElement(this.GREETING, 8000); }
  async getGreeting(): Promise<string> { return this.getText(this.GREETING); }
  async isCalorieRingVisible(): Promise<boolean> { return this.isDisplayed(this.CALORIE_RING); }
  async isSleepWidgetVisible(): Promise<boolean> { return this.isDisplayed(this.SLEEP_WIDGET); }
  async isStepsWidgetVisible(): Promise<boolean> { return this.isDisplayed(this.STEPS_WIDGET); }
  async isWaterWidgetVisible(): Promise<boolean> { return this.isDisplayed(this.WATER_WIDGET); }
  async tapLogMeal(): Promise<void> { await this.tap(this.LOG_MEAL_BTN); }
  async tapLogWorkout(): Promise<void> { await this.tap(this.LOG_WORKOUT_BTN); }
  async tapLogSleep(): Promise<void> { await this.tap(this.LOG_SLEEP_BTN); }
  async tapAiCoach(): Promise<void> { await this.tap(this.AI_COACH_CARD); }
  async tapSettings(): Promise<void> { await this.tap(this.SETTINGS_ICON); }
  async tapHomeTab(): Promise<void> { await this.tap(this.HOME_TAB); }
  async tapHabitsTab(): Promise<void> { await this.tap(this.HABITS_TAB); }
  async tapAiCoachTab(): Promise<void> { await this.tap(this.AI_COACH_TAB); }
  async tapProfileTab(): Promise<void> { await this.tap(this.PROFILE_TAB); }
  async pullToRefresh(): Promise<void> { await super.pullToRefresh(); }
  async isWeeklyChartVisible(): Promise<boolean> { return this.isDisplayed(this.WEEKLY_CHART); }
  async isChallengeWidgetVisible(): Promise<boolean> { return this.isDisplayed(this.CHALLENGE_WIDGET); }
}

export class IntroPage extends BasePage {
  private readonly GET_STARTED = 'get_started_button';
  private readonly SIGN_UP = 'intro_sign_up_button';
  private readonly LOGO = 'vitalcore_logo';

  constructor(driver: Browser) { super(driver); }
  async tapGetStarted(): Promise<void> { await this.tap(this.GET_STARTED); }
  async tapSignUp(): Promise<void> { await this.tap(this.SIGN_UP); }
  async isLogoVisible(): Promise<boolean> { return this.isDisplayed(this.LOGO); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.GET_STARTED, 10000); }
}

export class RegisterPage extends BasePage {
  private readonly NAME_INPUT = 'name_input';
  private readonly EMAIL_INPUT = 'reg_email_input';
  private readonly PASSWORD_INPUT = 'reg_password_input';
  private readonly CONFIRM_PASSWORD = 'confirm_password_input';
  private readonly REGISTER_BTN = 'register_button';
  private readonly TERMS_CHECKBOX = 'terms_checkbox';
  private readonly LOGIN_LINK = 'already_have_account_link';
  private readonly ERROR_MSG = 'reg_error_message';
  private readonly LOADING = 'reg_loading';

  constructor(driver: Browser) { super(driver); }
  async enterName(name: string): Promise<void> { await this.typeText(this.NAME_INPUT, name); }
  async enterEmail(email: string): Promise<void> { await this.typeText(this.EMAIL_INPUT, email); }
  async enterPassword(password: string): Promise<void> { await this.typeText(this.PASSWORD_INPUT, password); }
  async enterConfirmPassword(password: string): Promise<void> { await this.typeText(this.CONFIRM_PASSWORD, password); }
  async acceptTerms(): Promise<void> { await this.tap(this.TERMS_CHECKBOX); }
  async tapRegister(): Promise<void> { await this.tap(this.REGISTER_BTN); await this.pause(1500); }
  async tapLoginLink(): Promise<void> { await this.tap(this.LOGIN_LINK); }
  async register(name: string, email: string, password: string): Promise<void> {
    await this.enterName(name);
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.enterConfirmPassword(password);
    await this.acceptTerms();
    await this.hideKeyboard();
    await this.tapRegister();
  }
  async getErrorMessage(): Promise<string> { return this.getText(this.ERROR_MSG); }
  async isErrorVisible(): Promise<boolean> { return this.isDisplayed(this.ERROR_MSG); }
}

export class OnboardingPage extends BasePage {
  private readonly NEXT_BTN = 'onboarding_next';
  private readonly BACK_BTN = 'onboarding_back';
  private readonly PROGRESS = 'onboarding_progress';
  private readonly WEIGHT_INPUT = 'onboarding_weight';
  private readonly HEIGHT_INPUT = 'onboarding_height';
  private readonly GOAL_LOSS = 'goal_weight_loss';
  private readonly GOAL_MUSCLE = 'goal_muscle_gain';
  private readonly GOAL_WELLNESS = 'goal_wellness';
  private readonly ACTIVITY_MODERATE = 'activity_moderate';
  private readonly FINISH_BTN = 'onboarding_finish';

  constructor(driver: Browser) { super(driver); }
  async tapNext(): Promise<void> { await this.tap(this.NEXT_BTN); await this.pause(400); }
  async tapBack(): Promise<void> { await this.tap(this.BACK_BTN); }
  async selectGoalWeightLoss(): Promise<void> { await this.tap(this.GOAL_LOSS); }
  async selectGoalMuscleGain(): Promise<void> { await this.tap(this.GOAL_MUSCLE); }
  async selectGoalWellness(): Promise<void> { await this.tap(this.GOAL_WELLNESS); }
  async enterWeight(weight: string): Promise<void> { await this.typeText(this.WEIGHT_INPUT, weight); }
  async enterHeight(height: string): Promise<void> { await this.typeText(this.HEIGHT_INPUT, height); }
  async selectModerateActivity(): Promise<void> { await this.tap(this.ACTIVITY_MODERATE); }
  async tapFinish(): Promise<void> { await this.tap(this.FINISH_BTN); await this.pause(2000); }
  async completeOnboarding(): Promise<void> {
    await this.selectGoalWeightLoss();
    await this.tapNext();
    await this.enterWeight('70');
    await this.enterHeight('175');
    await this.tapNext();
    await this.selectModerateActivity();
    await this.tapNext();
    await this.tapFinish();
  }
}

export class AICoachPage extends BasePage {
  private readonly CHAT_INPUT = 'ai_chat_input';
  private readonly SEND_BUTTON = 'ai_send_button';
  private readonly CHAT_CONTAINER = 'ai_chat_container';
  private readonly TYPING_INDICATOR = 'ai_typing_indicator';
  private readonly CLEAR_HISTORY = 'ai_clear_history';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.CHAT_INPUT); }
  async typeMessage(msg: string): Promise<void> { await this.typeText(this.CHAT_INPUT, msg); }
  async tapSend(): Promise<void> { await this.tap(this.SEND_BUTTON); }
  async sendMessage(msg: string): Promise<void> { await this.typeMessage(msg); await this.tapSend(); }
  async isChatVisible(): Promise<boolean> { return this.isDisplayed(this.CHAT_CONTAINER); }
  async isTypingIndicatorVisible(): Promise<boolean> { return this.isDisplayed(this.TYPING_INDICATOR); }
  async tapClearHistory(): Promise<void> { await this.tap(this.CLEAR_HISTORY); }
}

export class ProfilePage extends BasePage {
  private readonly NAME = 'profile_name';
  private readonly EMAIL = 'profile_email';
  private readonly EDIT_BTN = 'edit_profile_button';
  private readonly SAVE_BTN = 'save_profile_button';
  private readonly CANCEL_BTN = 'cancel_edit_button';
  private readonly LOGOUT_BTN = 'logout_button';
  private readonly DELETE_ACCOUNT = 'delete_account_button';
  private readonly NAME_FIELD = 'edit_name_field';
  private readonly WEIGHT_FIELD = 'edit_weight_field';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.NAME); }
  async getName(): Promise<string> { return this.getText(this.NAME); }
  async tapEdit(): Promise<void> { await this.tap(this.EDIT_BTN); }
  async tapSave(): Promise<void> { await this.tap(this.SAVE_BTN); await this.pause(1000); }
  async tapCancel(): Promise<void> { await this.tap(this.CANCEL_BTN); }
  async tapLogout(): Promise<void> { await this.tap(this.LOGOUT_BTN); await this.pause(2000); }
  async tapDeleteAccount(): Promise<void> { await this.tap(this.DELETE_ACCOUNT); }
  async editName(name: string): Promise<void> { await this.typeText(this.NAME_FIELD, name); }
  async editWeight(weight: string): Promise<void> { await this.typeText(this.WEIGHT_FIELD, weight); }
}

export class SleepPage extends BasePage {
  private readonly LOG_SLEEP_BTN = 'log_sleep_button';
  private readonly BEDTIME_INPUT = 'bedtime_input';
  private readonly WAKE_INPUT = 'wake_time_input';
  private readonly QUALITY_RATING = 'sleep_quality_rating';
  private readonly SAVE_SLEEP = 'save_sleep_button';
  private readonly WEEKLY_CHART = 'sleep_weekly_chart';
  private readonly AVERAGE_DISPLAY = 'sleep_average';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.LOG_SLEEP_BTN); }
  async tapLogSleep(): Promise<void> { await this.tap(this.LOG_SLEEP_BTN); }
  async setBedtime(time: string): Promise<void> { await this.typeText(this.BEDTIME_INPUT, time); }
  async setWakeTime(time: string): Promise<void> { await this.typeText(this.WAKE_INPUT, time); }
  async selectQualityRating(rating: number): Promise<void> { await this.tap(`sleep_quality_${rating}`); }
  async tapSave(): Promise<void> { await this.tap(this.SAVE_SLEEP); await this.pause(1000); }
  async isWeeklyChartVisible(): Promise<boolean> { return this.isDisplayed(this.WEEKLY_CHART); }
  async getAverageSleep(): Promise<string> { return this.getText(this.AVERAGE_DISPLAY); }
}

export class FitnessPage extends BasePage {
  private readonly SEARCH_INPUT = 'exercise_search';
  private readonly LOG_WORKOUT_BTN = 'log_workout_button';
  private readonly EXERCISE_LIST = 'exercise_list';
  private readonly HISTORY_TAB = 'fitness_history_tab';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.SEARCH_INPUT); }
  async searchExercise(query: string): Promise<void> { await this.typeText(this.SEARCH_INPUT, query); await this.pause(500); }
  async tapLogWorkout(): Promise<void> { await this.tap(this.LOG_WORKOUT_BTN); }
  async isExerciseListVisible(): Promise<boolean> { return this.isDisplayed(this.EXERCISE_LIST); }
  async tapHistoryTab(): Promise<void> { await this.tap(this.HISTORY_TAB); }
}

export class CalorieTrackerPage extends BasePage {
  private readonly FOOD_SEARCH = 'food_search_input';
  private readonly ADD_TO_BREAKFAST = 'add_to_breakfast';
  private readonly CALORIE_TOTAL = 'daily_calorie_total';
  private readonly CALORIE_RING = 'calorie_progress_ring';
  private readonly BARCODE_SCAN = 'barcode_scan_button';
  private readonly WATER_ADD = 'water_add_button';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.FOOD_SEARCH); }
  async searchFood(query: string): Promise<void> { await this.typeText(this.FOOD_SEARCH, query); await this.pause(600); }
  async tapAddToBreakfast(): Promise<void> { await this.tap(this.ADD_TO_BREAKFAST); }
  async getCalorieTotal(): Promise<string> { return this.getText(this.CALORIE_TOTAL); }
  async isCalorieRingVisible(): Promise<boolean> { return this.isDisplayed(this.CALORIE_RING); }
  async tapBarcodeScan(): Promise<void> { await this.tap(this.BARCODE_SCAN); }
  async addWater(): Promise<void> { await this.tap(this.WATER_ADD); }
}

export class ChallengesPage extends BasePage {
  private readonly CHALLENGE_LIST = 'challenge_list';
  private readonly JOIN_BTN = 'join_challenge_button';
  private readonly ACTIVE_CHALLENGE = 'active_challenge_widget';
  private readonly FILTER_BTN = 'challenge_filter';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.CHALLENGE_LIST); }
  async tapJoin(): Promise<void> { await this.tap(this.JOIN_BTN); await this.pause(800); }
  async isActiveChallengeVisible(): Promise<boolean> { return this.isDisplayed(this.ACTIVE_CHALLENGE); }
  async tapFilter(category: string): Promise<void> { await this.tap(this.FILTER_BTN); await this.tapByText(category); }
}

export class SettingsPage extends BasePage {
  private readonly DARK_TOGGLE = 'dark_mode_toggle';
  private readonly NOTIF_TOGGLE = 'notifications_toggle';
  private readonly LOGOUT_BTN = 'settings_logout_button';
  private readonly CALORIE_GOAL = 'calorie_goal_edit';
  private readonly PRIVACY_LINK = 'privacy_policy_link';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.DARK_TOGGLE); }
  async toggleDarkMode(): Promise<void> { await this.tap(this.DARK_TOGGLE); }
  async toggleNotifications(): Promise<void> { await this.tap(this.NOTIF_TOGGLE); }
  async tapLogout(): Promise<void> { await this.tap(this.LOGOUT_BTN); await this.pause(2000); }
  async editCalorieGoal(goal: string): Promise<void> { await this.typeText(this.CALORIE_GOAL, goal); }
  async tapPrivacyPolicy(): Promise<void> { await this.tap(this.PRIVACY_LINK); }
}

export class HistoryPage extends BasePage {
  private readonly HISTORY_LIST = 'history_list';
  private readonly DATE_FILTER = 'date_range_filter';
  private readonly TYPE_FILTER = 'type_filter';
  private readonly EXPORT_BTN = 'export_history_button';

  constructor(driver: Browser) { super(driver); }
  async waitForLoad(): Promise<void> { await this.waitForElement(this.HISTORY_LIST); }
  async isHistoryListVisible(): Promise<boolean> { return this.isDisplayed(this.HISTORY_LIST); }
  async tapDateFilter(): Promise<void> { await this.tap(this.DATE_FILTER); }
  async tapTypeFilter(type: string): Promise<void> { await this.tap(this.TYPE_FILTER); await this.tapByText(type); }
  async tapExport(): Promise<void> { await this.tap(this.EXPORT_BTN); }
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
