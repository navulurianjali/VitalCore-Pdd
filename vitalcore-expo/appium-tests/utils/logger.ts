import * as fs from 'fs';
import * as path from 'path';

export class Logger {
  private static logFilePath: string = '';
  private static logDir: string = '';

  public static init(reportsDir: string = './Test Results'): void {
    Logger.logDir = path.join(process.cwd(), reportsDir, 'Logs');
    if (!fs.existsSync(Logger.logDir)) {
      fs.mkdirSync(Logger.logDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    Logger.logFilePath = path.join(Logger.logDir, `appium_run_${timestamp}.log`);
    Logger.write(`[INIT] VitalCore Appium E2E Test Suite Started at ${new Date().toISOString()}`);
  }

  private static write(message: string): void {
    const ts = new Date().toISOString();
    const line = `${ts} ${message}\n`;
    if (Logger.logFilePath) {
      fs.appendFileSync(Logger.logFilePath, line);
    }
    process.stdout.write(line);
  }

  public static info(message: string): void {
    Logger.write(`[INFO]  ${message}`);
  }

  public static warn(message: string): void {
    Logger.write(`[WARN]  ${message}`);
  }

  public static error(message: string): void {
    Logger.write(`[ERROR] ${message}`);
  }

  public static debug(message: string): void {
    if (process.env.DEBUG === 'true') {
      Logger.write(`[DEBUG] ${message}`);
    }
  }

  public static getLogFilePath(): string {
    return Logger.logFilePath;
  }
}
