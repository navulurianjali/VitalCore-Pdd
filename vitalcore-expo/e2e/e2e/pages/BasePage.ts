import { recordTestResult } from '../utils/jsonReporter';

export default class BasePage {
  /**
   * Universal locator helper for React Native testID / accessibilityLabel
   */
  public getByTestId(testId: string) {
    return $(`~${testId}`);
  }

  /**
   * Universal locator helper for XPath
   */
  public getByXpath(xpath: string) {
    return $(xpath);
  }

  /**
   * Explicit wait and click element
   */
  public async waitAndClick(testId: string, timeoutMs: number = 10000): Promise<void> {
    const elem = this.getByTestId(testId);
    await elem.waitForDisplayed({ timeout: timeoutMs });
    await elem.click();
  }

  /**
   * Explicit wait and type text into input
   */
  public async waitAndSetValue(testId: string, value: string, timeoutMs: number = 10000): Promise<void> {
    const elem = this.getByTestId(testId);
    await elem.waitForDisplayed({ timeout: timeoutMs });
    await elem.setValue(value);
  }

  /**
   * Check if element is displayed
   */
  public async isElementDisplayed(testId: string, timeoutMs: number = 5000): Promise<boolean> {
    try {
      const elem = this.getByTestId(testId);
      await elem.waitForDisplayed({ timeout: timeoutMs });
      return await elem.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Get element text content
   */
  public async getElementText(testId: string, timeoutMs: number = 5000): Promise<string> {
    const elem = this.getByTestId(testId);
    await elem.waitForDisplayed({ timeout: timeoutMs });
    return await elem.getText();
  }

  /**
   * Execute swipe/scroll gesture
   */
  public async swipeUp(): Promise<void> {
    try {
      await driver.action('pointer', { pointerType: 'touch' })
        .move({ x: 300, y: 800 })
        .down()
        .move({ x: 300, y: 200, duration: 600 })
        .up()
        .perform();
    } catch {
      // Fallback
    }
  }

  /**
   * Log test step execution result
   */
  public logStep(id: string, moduleName: string, title: string, priority: 'P0' | 'P1' | 'P2', status: 'PASSED' | 'FAILED' | 'SKIPPED', durationMs: number, error?: string) {
    recordTestResult({
      id,
      module: moduleName,
      title,
      priority,
      status,
      durationMs,
      error,
      timestamp: new Date().toISOString()
    });
  }
}
