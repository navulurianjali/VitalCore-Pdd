import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

export class ScreenshotUtil {
  private static screenshotDir: string = '';

  public static init(reportsDir: string = './Test Results'): void {
    ScreenshotUtil.screenshotDir = path.join(process.cwd(), reportsDir, 'Screenshots');
    if (!fs.existsSync(ScreenshotUtil.screenshotDir)) {
      fs.mkdirSync(ScreenshotUtil.screenshotDir, { recursive: true });
    }
  }

  /**
   * Capture a screenshot via Selenium WebDriver, or generate a placeholder in simulate mode.
   */
  public static async capture(
    testId: string,
    status: 'PASS' | 'FAIL' | 'SKIPPED',
    driver?: any,
  ): Promise<string> {
    if (!ScreenshotUtil.screenshotDir) {
      ScreenshotUtil.init();
    }

    const timestamp = Date.now();
    const filename = `${testId}_${status}_${timestamp}.png`;
    const filepath = path.join(ScreenshotUtil.screenshotDir, filename);

    try {
      if (driver) {
        // Real Selenium screenshot via WebDriver
        const screenshot = await driver.takeScreenshot();
        const imgBuffer = Buffer.from(screenshot, 'base64');
        fs.writeFileSync(filepath, imgBuffer);
        Logger.info(`Screenshot saved: ${filename}`);
      } else {
        // Placeholder in simulate mode
        const minimalPng = Buffer.from(
          '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
          '2e000000184944415408d7636060600000000200012f21910000000049454e44ae426082',
          'hex',
        );
        fs.writeFileSync(filepath, minimalPng);
      }
    } catch (err) {
      Logger.warn(`Failed to capture screenshot for ${testId}: ${err}`);
    }

    return path.join('Screenshots', filename);
  }
}
