import * as fs from 'fs';
import * as path from 'path';

export class ScreenshotUtil {
  private static screenshotDir = path.join(process.cwd(), 'Test Results', 'Screenshots');

  public static init() {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  public static async capture(testId: string, status: 'PASS' | 'FAIL' | 'DEVICE'): Promise<string> {
    this.init();
    const filename = `${testId}_${status}_${Date.now()}.png`;
    const filepath = path.join(this.screenshotDir, filename);

    // Placeholder base64 standard 1x1 PNG or real driver screenshot buffer
    const mockPngBase64 = 'iVBORw0KGgoAAAANSU5EUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    fs.writeFileSync(filepath, Buffer.from(mockPngBase64, 'base64'));

    return filepath;
  }
}
