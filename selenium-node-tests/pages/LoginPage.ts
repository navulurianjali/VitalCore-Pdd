import { WebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly EMAIL = '#email, input[name="email"], input[type="email"]';
  private readonly PASSWORD = '#password, input[name="password"], input[type="password"]';
  private readonly SUBMIT = 'button[type="submit"], button#login-btn, [data-testid="login-button"]';
  private readonly ERROR = '.error-message, [role="alert"], [data-testid="error"]';
  private readonly LOADING = '.loading, [data-testid="loading"], button[disabled]';
  private readonly FORGOT = 'a[href*="forgot"], [data-testid="forgot-password"]';
  private readonly SIGN_UP = 'a[href*="signup"], a[href*="register"]';
  private readonly GOOGLE = '[data-testid="google-auth"], button.google-btn';

  constructor(driver: WebDriver) { super(driver); }

  async open(): Promise<void> { await this.navigate('/login'); }
  async enterEmail(email: string): Promise<void> { await this.type(this.EMAIL, email); }
  async enterPassword(password: string): Promise<void> { await this.type(this.PASSWORD, password); }
  async clickSubmit(): Promise<void> { await this.click(this.SUBMIT); await this.pause(800); }
  async clickForgotPassword(): Promise<void> { await this.click(this.FORGOT); }
  async clickSignUp(): Promise<void> { await this.click(this.SIGN_UP); }

  async login(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickSubmit();
  }

  async getErrorText(): Promise<string> {
    try { return this.getText(this.ERROR); } catch { return ''; }
  }
  async isErrorVisible(): Promise<boolean> { return this.isDisplayed(this.ERROR); }
  async isSubmitEnabled(): Promise<boolean> { return this.isEnabled(this.SUBMIT); }
  async waitForDashboard(): Promise<void> { await this.waitForURL('/dashboard'); }
}
