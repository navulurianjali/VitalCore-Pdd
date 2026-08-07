import BasePage from './BasePage';

export default class LoginPage extends BasePage {
  public get emailInput() { return this.getByTestId('login-email-input'); }
  public get passwordInput() { return this.getByTestId('login-password-input'); }
  public get loginBtn() { return this.getByTestId('login-submit-btn'); }
  public get errorMessage() { return this.getByTestId('login-error-msg'); }
  public get registerLink() { return this.getByTestId('login-register-link'); }
  public get showPasswordBtn() { return this.getByTestId('login-show-password-btn'); }

  public async login(email: string, pass: string): Promise<void> {
    await this.waitAndSetValue('login-email-input', email);
    await this.waitAndSetValue('login-password-input', pass);
    await this.waitAndClick('login-submit-btn');
  }

  public async getErrorText(): Promise<string> {
    return this.getElementText('login-error-msg');
  }
}
