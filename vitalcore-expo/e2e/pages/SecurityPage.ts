import BasePage from './BasePage';

export default class SecurityPage extends BasePage {
  public get passwordInput() { return this.getByTestId('security-password-input'); }
  public get payloadInput() { return this.getByTestId('security-payload-input'); }
  public get submitPayloadBtn() { return this.getByTestId('security-submit-payload-btn'); }
  public get errorAlert() { return this.getByTestId('security-error-alert'); }

  public async testSqlInjectionPayload(payload: string): Promise<boolean> {
    await this.waitAndSetValue('security-payload-input', payload);
    await this.waitAndClick('security-submit-payload-btn');
    return this.isElementDisplayed('security-error-alert');
  }
}
