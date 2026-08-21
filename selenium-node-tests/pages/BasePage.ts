// ============================================================
// Base Page Object – VitalCore Selenium (Node.js) Tests
// All page objects extend this for shared selenium-webdriver helpers
// ============================================================
import { WebDriver, By, until, WebElement, Condition } from 'selenium-webdriver';
import { Logger } from '../utils/logger';
import { withRetry } from '../utils/retryUtil';
import { seleniumConfig } from '../config/selenium.config';

export abstract class BasePage {
  protected driver: WebDriver;
  protected baseUrl: string;
  private static DEFAULT_TIMEOUT = seleniumConfig.implicitWait;

  constructor(driver: WebDriver) {
    this.driver = driver;
    this.baseUrl = seleniumConfig.baseUrl;
  }

  // ── Navigation ────────────────────────────────────────────
  public async navigate(path: string = ''): Promise<void> {
    const url = `${this.baseUrl}${path}`;
    await this.driver.get(url);
    Logger.debug(`Navigated to: ${url}`);
  }

  public async getCurrentUrl(): Promise<string> {
    return this.driver.getCurrentUrl();
  }

  public async getTitle(): Promise<string> {
    return this.driver.getTitle();
  }

  public async getPageSource(): Promise<string> {
    return this.driver.getPageSource();
  }

  // ── Element Finders ───────────────────────────────────────
  protected async findById(id: string): Promise<WebElement> {
    return this.driver.findElement(By.id(id));
  }

  protected async findByCSS(selector: string): Promise<WebElement> {
    return this.driver.findElement(By.css(selector));
  }

  protected async findByXPath(xpath: string): Promise<WebElement> {
    return this.driver.findElement(By.xpath(xpath));
  }

  protected async findByText(text: string): Promise<WebElement> {
    return this.driver.findElement(By.xpath(`//*[contains(text(),'${text}')]`));
  }

  protected async findByName(name: string): Promise<WebElement> {
    return this.driver.findElement(By.name(name));
  }

  protected async findByTag(tag: string): Promise<WebElement> {
    return this.driver.findElement(By.tagName(tag));
  }

  protected async findAllByCSS(selector: string): Promise<WebElement[]> {
    return this.driver.findElements(By.css(selector));
  }

  // ── Wait Helpers ──────────────────────────────────────────
  public async waitForURL(urlPart: string, timeout = BasePage.DEFAULT_TIMEOUT): Promise<void> {
    await this.driver.wait(until.urlContains(urlPart), timeout);
  }

  protected async waitForElement(selector: string, timeout = BasePage.DEFAULT_TIMEOUT): Promise<WebElement> {
    const el = await this.driver.findElement(By.css(selector));
    await this.driver.wait(until.elementIsVisible(el), timeout);
    return el;
  }

  protected async waitForElementVisible(by: By, timeout = BasePage.DEFAULT_TIMEOUT): Promise<WebElement> {
    return this.driver.wait(until.elementLocated(by), timeout);
  }

  protected async waitForText(selector: string, text: string, timeout = BasePage.DEFAULT_TIMEOUT): Promise<void> {
    const el = await this.driver.findElement(By.css(selector));
    await this.driver.wait(until.elementTextContains(el, text), timeout);
  }

  // ── Interactions ──────────────────────────────────────────
  protected async click(selector: string): Promise<void> {
    await withRetry(async () => {
      const el = await this.waitForElement(selector);
      await el.click();
      Logger.debug(`Clicked: ${selector}`);
    }, 2, 800, selector);
  }

  protected async clickByText(text: string): Promise<void> {
    const el = await this.findByText(text);
    await el.click();
  }

  protected async type(selector: string, value: string): Promise<void> {
    const el = await this.waitForElement(selector);
    await el.clear();
    await el.sendKeys(value);
    Logger.debug(`Typed "${value}" into ${selector}`);
  }

  protected async getValue(selector: string): Promise<string> {
    const el = await this.waitForElement(selector);
    return (await el.getAttribute('value')) ?? '';
  }

  protected async getText(selector: string): Promise<string> {
    const el = await this.waitForElement(selector);
    return el.getText();
  }

  protected async isDisplayed(selector: string): Promise<boolean> {
    try {
      const el = await this.driver.findElement(By.css(selector));
      return el.isDisplayed();
    } catch {
      return false;
    }
  }

  protected async isEnabled(selector: string): Promise<boolean> {
    try {
      const el = await this.driver.findElement(By.css(selector));
      return el.isEnabled();
    } catch {
      return false;
    }
  }

  protected async scrollToElement(selector: string): Promise<void> {
    const el = await this.driver.findElement(By.css(selector));
    await this.driver.executeScript('arguments[0].scrollIntoView(true)', el);
  }

  protected async scrollToBottom(): Promise<void> {
    await this.driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');
  }

  protected async scrollToTop(): Promise<void> {
    await this.driver.executeScript('window.scrollTo(0, 0)');
  }

  protected async getAttributeValue(selector: string, attr: string): Promise<string | null> {
    const el = await this.driver.findElement(By.css(selector));
    return el.getAttribute(attr);
  }

  protected async executeScript(script: string, ...args: unknown[]): Promise<unknown> {
    return this.driver.executeScript(script, ...args);
  }

  protected async switchToNewTab(): Promise<void> {
    const handles = await this.driver.getAllWindowHandles();
    await this.driver.switchTo().window(handles[handles.length - 1]);
  }

  protected async closeCurrentTab(): Promise<void> {
    await this.driver.close();
    const handles = await this.driver.getAllWindowHandles();
    await this.driver.switchTo().window(handles[0]);
  }

  protected async refresh(): Promise<void> {
    await this.driver.navigate().refresh();
  }

  protected async back(): Promise<void> {
    await this.driver.navigate().back();
  }

  protected async forward(): Promise<void> {
    await this.driver.navigate().forward();
  }

  protected async pause(ms: number): Promise<void> {
    await new Promise((res) => setTimeout(res, ms));
  }

  protected async takeScreenshot(): Promise<string> {
    return this.driver.takeScreenshot();
  }

  protected assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  protected async assertURL(expectedPart: string): Promise<void> {
    const url = await this.getCurrentUrl();
    this.assert(url.includes(expectedPart), `Expected URL to contain "${expectedPart}", got: "${url}"`);
  }

  protected async assertTitle(expectedPart: string): Promise<void> {
    const title = await this.getTitle();
    this.assert(title.toLowerCase().includes(expectedPart.toLowerCase()), `Expected title to contain "${expectedPart}", got: "${title}"`);
  }

  protected async assertVisible(selector: string): Promise<void> {
    const visible = await this.isDisplayed(selector);
    this.assert(visible, `Expected element "${selector}" to be visible`);
  }

  protected async assertText(selector: string, expected: string): Promise<void> {
    const text = await this.getText(selector);
    this.assert(text.includes(expected), `Expected text to contain "${expected}", got: "${text}"`);
  }

  protected async resizeWindow(width: number, height: number): Promise<void> {
    await this.driver.manage().window().setRect({ width, height });
  }
}
