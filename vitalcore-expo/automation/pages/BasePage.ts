import { Logger } from '../utils/logger';

export class BasePage {
  protected pageName: string;

  constructor(pageName: string) {
    this.pageName = pageName;
  }

  public async findElement(selector: string): Promise<any> {
    Logger.info(`[${this.pageName}] Finding element: ${selector}`);
    return { selector, text: 'mockElement' };
  }

  public async click(selector: string): Promise<void> {
    Logger.info(`[${this.pageName}] Clicking element: ${selector}`);
  }

  public async enterText(selector: string, text: string): Promise<void> {
    Logger.info(`[${this.pageName}] Entering text '${text}' into: ${selector}`);
  }

  public async getText(selector: string): Promise<string> {
    Logger.info(`[${this.pageName}] Getting text from: ${selector}`);
    return 'Mock Text';
  }

  public async isDisplayed(selector: string): Promise<boolean> {
    Logger.info(`[${this.pageName}] Checking visibility of: ${selector}`);
    return true;
  }
}
