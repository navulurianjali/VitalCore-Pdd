import { WebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';

// ─── Landing Page ─────────────────────────────────────────────
export class LandingPage extends BasePage {
  constructor(driver: WebDriver) { super(driver); }
  async open(): Promise<void> { await this.navigate('/'); }
  async clickGetStarted(): Promise<void> { await this.click('a[href*="signup"], [data-testid="cta-button"], .hero-cta'); }
  async clickLogin(): Promise<void> { await this.click('a[href*="login"], nav a[href="/login"]'); }
  async isLogoVisible(): Promise<boolean> { return this.isDisplayed('img[alt*="VitalCore"], .logo, [data-testid="logo"]'); }
  async isHeroVisible(): Promise<boolean> { return this.isDisplayed('.hero, [data-testid="hero"], #hero'); }
  async isFeaturesVisible(): Promise<boolean> { return this.isDisplayed('.features, [data-testid="features"], #features'); }
  async getPageTitle(): Promise<string> { return this.getTitle(); }
  async waitForLoad(): Promise<void> { await this.waitForElement('body'); }
}

// ─── Signup Page ──────────────────────────────────────────────
export class SignupPage extends BasePage {
  constructor(driver: WebDriver) { super(driver); }
  async open(): Promise<void> { await this.navigate('/signup'); }
  async enterName(name: string): Promise<void> { await this.type('#name, input[name="name"], [data-testid="name-input"]', name); }
  async enterEmail(email: string): Promise<void> { await this.type('#email, input[name="email"]', email); }
  async enterPassword(password: string): Promise<void> { await this.type('#password, input[name="password"]', password); }
  async enterConfirmPassword(p: string): Promise<void> { await this.type('#confirm-password, input[name="confirmPassword"], [data-testid="confirm-password"]', p); }
  async acceptTerms(): Promise<void> { await this.click('#terms, input[name="terms"], [data-testid="terms-checkbox"]'); }
  async clickSubmit(): Promise<void> { await this.click('button[type="submit"]'); await this.pause(1000); }
  async register(name: string, email: string, password: string): Promise<void> {
    await this.enterName(name); await this.enterEmail(email); await this.enterPassword(password);
    await this.enterConfirmPassword(password); await this.acceptTerms(); await this.clickSubmit();
  }
  async getErrorText(): Promise<string> { try { return this.getText('[role="alert"], .error'); } catch { return ''; } }
  async clickLoginLink(): Promise<void> { await this.click('a[href*="login"]'); }
}

// ─── Dashboard Page ───────────────────────────────────────────
export class DashboardPage extends BasePage {
  constructor(driver: WebDriver) { super(driver); }
  async open(): Promise<void> { await this.navigate('/dashboard'); }
  async waitForLoad(): Promise<void> { await this.waitForElement('.dashboard, [data-testid="dashboard"], main'); }
  async isGreetingVisible(): Promise<boolean> { return this.isDisplayed('[data-testid="greeting"], .greeting, h1'); }
  async isCalorieRingVisible(): Promise<boolean> { return this.isDisplayed('[data-testid="calorie-ring"], .calorie-progress, .calorie-ring'); }
  async clickLogMeal(): Promise<void> { await this.click('[data-testid="log-meal"], [href*="calorie-tracker"], button.log-meal'); }
  async clickLogWorkout(): Promise<void> { await this.click('[data-testid="log-workout"], [href*="fitness"], button.log-workout'); }
  async clickAiCoach(): Promise<void> { await this.click('[data-testid="ai-coach-card"], [href*="ai-coach"]'); }
  async isWeeklyChartVisible(): Promise<boolean> { return this.isDisplayed('canvas, .recharts-wrapper, [data-testid="weekly-chart"]'); }
  async refresh(): Promise<void> { await super.refresh(); await this.waitForLoad(); }
}

// ─── AI Coach Page ────────────────────────────────────────────
export class AiCoachPage extends BasePage {
  constructor(driver: WebDriver) { super(driver); }
  async open(): Promise<void> { await this.navigate('/ai-coach'); }
  async waitForLoad(): Promise<void> { await this.waitForElement('textarea, input[type="text"], [data-testid="chat-input"]'); }
  async typeMessage(msg: string): Promise<void> { await this.type('textarea, [data-testid="chat-input"]', msg); }
  async clickSend(): Promise<void> { await this.click('[data-testid="send-button"], button[type="submit"], .send-btn'); }
  async sendMessage(msg: string): Promise<void> { await this.typeMessage(msg); await this.clickSend(); }
  async isChatVisible(): Promise<boolean> { return this.isDisplayed('[data-testid="chat-container"], .chat-messages, .chat'); }
  async isTypingIndicatorVisible(): Promise<boolean> { return this.isDisplayed('[data-testid="typing-indicator"], .typing, .loading-dots'); }
  async clickClearHistory(): Promise<void> { await this.click('[data-testid="clear-history"], button.clear-chat'); }
}

// ─── Calorie Tracker Page ─────────────────────────────────────
export class CalorieTrackerPage extends BasePage {
  constructor(driver: WebDriver) { super(driver); }
  async open(): Promise<void> { await this.navigate('/calorie-tracker'); }
  async waitForLoad(): Promise<void> { await this.waitForElement('[data-testid="food-search"], input[placeholder*="food"], .food-search'); }
  async searchFood(query: string): Promise<void> { await this.type('[data-testid="food-search"], .food-search input', query); await this.pause(500); }
  async clickAddToBreakfast(): Promise<void> { await this.click('[data-testid="add-breakfast"], button.add-meal'); }
  async isCalorieRingVisible(): Promise<boolean> { return this.isDisplayed('[data-testid="calorie-ring"], .calorie-ring, canvas'); }
  async addWater(): Promise<void> { await this.click('[data-testid="add-water"], button.add-water'); }
}

// ─── Challenges Page ──────────────────────────────────────────
export class ChallengesPage extends BasePage {
  constructor(driver: WebDriver) { super(driver); }
  async open(): Promise<void> { await this.navigate('/challenges'); }
  async waitForLoad(): Promise<void> { await this.waitForElement('.challenge-card, [data-testid="challenge-list"]'); }
  async clickJoinChallenge(): Promise<void> { await this.click('[data-testid="join-challenge"], button.join-btn'); await this.pause(800); }
  async isActiveChallengeVisible(): Promise<boolean> { return this.isDisplayed('[data-testid="active-challenge"], .active-challenge'); }
  async filterByCategory(cat: string): Promise<void> { await this.click(`[data-filter="${cat}"], button[data-category="${cat}"]`); }
}

// ─── Fitness Page ─────────────────────────────────────────────
export class FitnessPage extends BasePage {
  constructor(driver: WebDriver) { super(driver); }
  async open(): Promise<void> { await this.navigate('/fitness'); }
  async waitForLoad(): Promise<void> { await this.waitForElement('.exercise-list, [data-testid="exercise-list"]'); }
  async searchExercise(query: string): Promise<void> { await this.type('[data-testid="exercise-search"], .search-input', query); await this.pause(500); }
  async clickLogWorkout(): Promise<void> { await this.click('[data-testid="log-workout"], button.log-workout'); }
  async isExerciseListVisible(): Promise<boolean> { return this.isDisplayed('.exercise-card, [data-testid="exercise-list"]'); }
}

// ─── Sleep Page ───────────────────────────────────────────────
export class SleepPage extends BasePage {
  constructor(driver: WebDriver) { super(driver); }
  async open(): Promise<void> { await this.navigate('/sleep'); }
  async waitForLoad(): Promise<void> { await this.waitForElement('[data-testid="sleep-form"], .sleep-form, .sleep-tracker'); }
  async setBedtime(time: string): Promise<void> { await this.type('[data-testid="bedtime"], input[name="bedtime"]', time); }
  async setWakeTime(time: string): Promise<void> { await this.type('[data-testid="wake-time"], input[name="wakeTime"]', time); }
  async clickSave(): Promise<void> { await this.click('[data-testid="save-sleep"], button[type="submit"]'); await this.pause(800); }
  async isWeeklyChartVisible(): Promise<boolean> { return this.isDisplayed('canvas, .recharts-wrapper, [data-testid="sleep-chart"]'); }
}

// ─── History Page ─────────────────────────────────────────────
export class HistoryPage extends BasePage {
  constructor(driver: WebDriver) { super(driver); }
  async open(): Promise<void> { await this.navigate('/history'); }
  async waitForLoad(): Promise<void> { await this.waitForElement('.history-list, [data-testid="history-list"]'); }
  async filterByType(type: string): Promise<void> { await this.click(`[data-filter="${type}"], button[data-type="${type}"]`); }
  async isHistoryListVisible(): Promise<boolean> { return this.isDisplayed('.history-item, [data-testid="history-list"]'); }
  async clickExport(): Promise<void> { await this.click('[data-testid="export"], button.export-btn'); }
}

// ─── Profile Page ─────────────────────────────────────────────
export class ProfilePage extends BasePage {
  constructor(driver: WebDriver) { super(driver); }
  async open(): Promise<void> { await this.navigate('/profile'); }
  async waitForLoad(): Promise<void> { await this.waitForElement('[data-testid="profile"], .profile-card, .profile'); }
  async clickEdit(): Promise<void> { await this.click('[data-testid="edit-profile"], button.edit-btn'); }
  async editName(name: string): Promise<void> { await this.type('[data-testid="name-input"], input#name', name); }
  async clickSave(): Promise<void> { await this.click('[data-testid="save-profile"], button[type="submit"]'); await this.pause(800); }
  async clickLogout(): Promise<void> { await this.click('[data-testid="logout"], button.logout-btn'); await this.pause(1500); }
  async clickDeleteAccount(): Promise<void> { await this.click('[data-testid="delete-account"], button.delete-account'); }
}

// ─── Settings Page ────────────────────────────────────────────
export class SettingsPage extends BasePage {
  constructor(driver: WebDriver) { super(driver); }
  async open(): Promise<void> { await this.navigate('/settings'); }
  async waitForLoad(): Promise<void> { await this.waitForElement('.settings, [data-testid="settings"]'); }
  async toggleDarkMode(): Promise<void> { await this.click('[data-testid="dark-mode-toggle"], .dark-toggle, input#dark-mode'); }
  async toggleNotifications(): Promise<void> { await this.click('[data-testid="notifications-toggle"], .notifications-toggle'); }
  async clickLogout(): Promise<void> { await this.click('[data-testid="logout"], button.logout'); await this.pause(1500); }
  async clickPrivacyPolicy(): Promise<void> { await this.click('[data-testid="privacy-link"], a[href*="privacy"]'); }
  async clickTerms(): Promise<void> { await this.click('[data-testid="terms-link"], a[href*="terms"]'); }
}

// ─── Community Page ───────────────────────────────────────────
export class CommunityPage extends BasePage {
  constructor(driver: WebDriver) { super(driver); }
  async open(): Promise<void> { await this.navigate('/community'); }
  async waitForLoad(): Promise<void> { await this.waitForElement('.feed, [data-testid="community-feed"]'); }
  async clickNewPost(): Promise<void> { await this.click('[data-testid="new-post"], button.new-post-btn'); }
  async typePostContent(content: string): Promise<void> { await this.type('textarea, [data-testid="post-input"]', content); }
  async submitPost(): Promise<void> { await this.click('[data-testid="submit-post"], button[type="submit"]'); await this.pause(800); }
  async likeFistPost(): Promise<void> { await this.click('[data-testid="like-btn"]:first-child, .like-button'); }
  async isFeedVisible(): Promise<boolean> { return this.isDisplayed('.post-card, [data-testid="community-feed"]'); }
}

// ─── Future Lab Page ──────────────────────────────────────────
export class FutureLabPage extends BasePage {
  constructor(driver: WebDriver) { super(driver); }
  async open(): Promise<void> { await this.navigate('/future-lab'); }
  async waitForLoad(): Promise<void> { await this.waitForElement('.future-lab, [data-testid="future-lab"]'); }
  async isFeatureCardsVisible(): Promise<boolean> { return this.isDisplayed('.feature-card, [data-testid="feature-card"]'); }
  async clickFirstCard(): Promise<void> { await this.click('.feature-card:first-child, [data-testid="feature-card"]'); }
}

// ─── Admin Page ───────────────────────────────────────────────
export class AdminPage extends BasePage {
  constructor(driver: WebDriver) { super(driver); }
  async open(): Promise<void> { await this.navigate('/admin'); }
  async waitForLoad(): Promise<void> { await this.waitForElement('.admin-panel, [data-testid="admin"], main'); }
  async isDashboardVisible(): Promise<boolean> { return this.isDisplayed('.admin-dashboard, [data-testid="admin"]'); }
}
