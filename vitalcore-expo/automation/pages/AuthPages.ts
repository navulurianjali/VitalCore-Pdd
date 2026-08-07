import { BasePage } from './BasePage';

export class IntroPage extends BasePage {
  constructor() {
    super('IntroScreen');
  }
  readonly getStartedBtn = 'text=Get Started';
  readonly loginBtn = 'text=Sign In';

  public async navigateToLogin() {
    await this.click(this.loginBtn);
  }
}

export class LoginPage extends BasePage {
  constructor() {
    super('LoginScreen');
  }
  readonly emailInput = 'placeholder=name@example.com';
  readonly passwordInput = 'placeholder=••••••••';
  readonly signInBtn = 'text=Sign In';
  readonly signUpLink = 'text=Sign Up';
  readonly forgotPasswordLink = 'text=Forgot?';
  readonly errorBanner = 'text=Authentication Error';

  public async login(email: string, pass: string) {
    await this.enterText(this.emailInput, email);
    await this.enterText(this.passwordInput, pass);
    await this.click(this.signInBtn);
  }
}

export class RegisterPage extends BasePage {
  constructor() {
    super('RegisterScreen');
  }
  readonly fullNameInput = 'placeholder=John Doe';
  readonly emailInput = 'placeholder=name@example.com';
  readonly passwordInput = 'placeholder=••••••••';
  readonly createAccountBtn = 'text=Create Account';
}

export class OnboardingPage extends BasePage {
  constructor() {
    super('OnboardingScreen');
  }
  readonly step1NextBtn = 'text=Continue';
  readonly completeBtn = 'text=Finish Setup';
}
