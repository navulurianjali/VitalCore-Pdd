import { Browser } from 'webdriverio';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Selectors (by testID)
  private readonly EMAIL_INPUT = 'email_input';
  private readonly PASSWORD_INPUT = 'password_input';
  private readonly SIGN_IN_BUTTON = 'sign_in_button';
  private readonly PASSWORD_TOGGLE = 'password_toggle';
  private readonly FORGOT_PASSWORD = 'forgot_password_link';
  private readonly SIGN_UP_LINK = 'sign_up_link';
  private readonly ERROR_MESSAGE = 'error_message';
  private readonly LOADING_INDICATOR = 'loading_indicator';
  private readonly GOOGLE_SIGN_IN = 'google_sign_in_button';

  constructor(driver: Browser) { super(driver); }

  async enterEmail(email: string): Promise<void> { await this.typeText(this.EMAIL_INPUT, email); }
  async enterPassword(password: string): Promise<void> { await this.typeText(this.PASSWORD_INPUT, password); }
  async tapSignIn(): Promise<void> { await this.tap(this.SIGN_IN_BUTTON); await this.pause(1500); }
  async tapPasswordToggle(): Promise<void> { await this.tap(this.PASSWORD_TOGGLE); }
  async tapForgotPassword(): Promise<void> { await this.tap(this.FORGOT_PASSWORD); }
  async tapSignUpLink(): Promise<void> { await this.tap(this.SIGN_UP_LINK); }
  async tapGoogleSignIn(): Promise<void> { await this.tap(this.GOOGLE_SIGN_IN); }

  async login(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.hideKeyboard();
    await this.tapSignIn();
  }

  async getErrorMessage(): Promise<string> { return this.getText(this.ERROR_MESSAGE); }
  async isErrorVisible(): Promise<boolean> { return this.isDisplayed(this.ERROR_MESSAGE); }
  async isLoadingVisible(): Promise<boolean> { return this.isDisplayed(this.LOADING_INDICATOR); }
  async isSignInButtonEnabled(): Promise<boolean> {
    const btn = await this.$(this.SIGN_IN_BUTTON);
    return btn.isEnabled();
  }
}
