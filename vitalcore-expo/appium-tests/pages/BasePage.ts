// ============================================================
// Base Page Object – VitalCore Appium Tests
// All page objects extend this class for shared WebdriverIO helpers
// ============================================================
import { Browser, Element } from 'webdriverio';
import { Logger } from '../utils/logger';
import { withRetry } from '../utils/retryUtil';

export abstract class BasePage {
  protected driver: Browser;
  private static DEFAULT_TIMEOUT = 8000;

  constructor(driver: Browser) {
    this.driver = driver;
  }

  // ── Element Locators ─────────────────────────────────────
  /** By testID accessibility label (React Native standard) */
  protected async $(testId: string): Promise<Element> {
    return this.driver.$(`~${testId}`);
  }

  /** By XPath */
  protected async $x(xpath: string): Promise<Element> {
    return this.driver.$(xpath);
  }

  /** By class name */
  protected async $class(className: string): Promise<Element> {
    return this.driver.$(`//*[@class="${className}"]`);
  }

  /** By text content (UiAutomator2) */
  protected async $text(text: string): Promise<Element> {
    return this.driver.$(`android=new UiSelector().text("${text}")`);
  }

  /** By text containing (partial match) */
  protected async $textContains(text: string): Promise<Element> {
    return this.driver.$(`android=new UiSelector().textContains("${text}")`);
  }

  // ── Element Interactions ──────────────────────────────────
  protected async tap(testId: string): Promise<void> {
    await withRetry(async () => {
      const el = await this.$(testId);
      await el.waitForDisplayed({ timeout: BasePage.DEFAULT_TIMEOUT });
      await el.click();
      Logger.debug(`Tapped: ~${testId}`);
    }, 2, 1000, testId);
  }

  protected async tapByText(text: string): Promise<void> {
    await withRetry(async () => {
      const el = await this.$text(text);
      await el.waitForDisplayed({ timeout: BasePage.DEFAULT_TIMEOUT });
      await el.click();
      Logger.debug(`Tapped text: "${text}"`);
    }, 2, 1000, text);
  }

  protected async typeText(testId: string, value: string): Promise<void> {
    const el = await this.$(testId);
    await el.waitForDisplayed({ timeout: BasePage.DEFAULT_TIMEOUT });
    await el.clearValue();
    await el.setValue(value);
    Logger.debug(`Typed "${value}" into ~${testId}`);
  }

  protected async getText(testId: string): Promise<string> {
    const el = await this.$(testId);
    await el.waitForDisplayed({ timeout: BasePage.DEFAULT_TIMEOUT });
    return el.getText();
  }

  protected async isDisplayed(testId: string): Promise<boolean> {
    try {
      const el = await this.$(testId);
      return el.isDisplayed();
    } catch {
      return false;
    }
  }

  protected async waitForElement(testId: string, timeout = BasePage.DEFAULT_TIMEOUT): Promise<Element> {
    const el = await this.$(testId);
    await el.waitForDisplayed({ timeout });
    return el;
  }

  protected async waitForElementGone(testId: string, timeout = 5000): Promise<void> {
    const el = await this.$(testId);
    await el.waitForDisplayed({ timeout, reverse: true });
  }

  // ── Gestures ─────────────────────────────────────────────
  protected async scrollDown(): Promise<void> {
    const { width, height } = await this.driver.getWindowSize();
    await this.driver.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: width / 2, y: height * 0.7 })
      .down()
      .move({ x: width / 2, y: height * 0.3 })
      .up()
      .perform();
  }

  protected async scrollUp(): Promise<void> {
    const { width, height } = await this.driver.getWindowSize();
    await this.driver.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: width / 2, y: height * 0.3 })
      .down()
      .move({ x: width / 2, y: height * 0.7 })
      .up()
      .perform();
  }

  protected async pullToRefresh(): Promise<void> {
    await this.scrollUp();
    await this.pause(1500);
  }

  // ── Utilities ─────────────────────────────────────────────
  protected async pause(ms: number): Promise<void> {
    await this.driver.pause(ms);
  }

  protected async hideKeyboard(): Promise<void> {
    try {
      await this.driver.hideKeyboard();
    } catch {
      // Keyboard may already be hidden
    }
  }

  protected async getSource(): Promise<string> {
    return this.driver.getPageSource();
  }

  protected async takeScreenshot(): Promise<string> {
    return this.driver.takeScreenshot();
  }

  protected async pressBack(): Promise<void> {
    await this.driver.pressKeyCode(4); // Android back key
  }

  protected assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }
}
