import BasePage from './BasePage';

export default class RegisterPage extends BasePage {
  public get fullNameInput() { return this.getByTestId('register-name-input'); }
  public get usernameInput() { return this.getByTestId('register-username-input'); }
  public get emailInput() { return this.getByTestId('register-email-input'); }
  public get passwordInput() { return this.getByTestId('register-password-input'); }
  public get confirmPasswordInput() { return this.getByTestId('register-confirm-password-input'); }
  public get submitBtn() { return this.getByTestId('register-submit-btn'); }
  public get loginLink() { return this.getByTestId('register-login-link'); }

  public async register(fullName: string, username: string, email: string, pass: string): Promise<void> {
    await this.waitAndSetValue('register-name-input', fullName);
    await this.waitAndSetValue('register-username-input', username);
    await this.waitAndSetValue('register-email-input', email);
    await this.waitAndSetValue('register-password-input', pass);
    await this.waitAndSetValue('register-confirm-password-input', pass);
    await this.waitAndClick('register-submit-btn');
  }
}
