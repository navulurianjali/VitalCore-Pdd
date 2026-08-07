import BasePage from './BasePage';

export default class SplashPage extends BasePage {
  public get logo() { return this.getByTestId('splash-logo'); }
  public get appTitle() { return this.getByTestId('splash-title'); }
  public get getStartedBtn() { return this.getByTestId('splash-get-started-btn'); }
  public get loginBtn() { return this.getByTestId('splash-login-btn'); }

  public async isLoaded(): Promise<boolean> {
    return this.isElementDisplayed('splash-logo');
  }

  public async clickGetStarted(): Promise<void> {
    await this.waitAndClick('splash-get-started-btn');
  }

  public async clickLogin(): Promise<void> {
    await this.waitAndClick('splash-login-btn');
  }
}
