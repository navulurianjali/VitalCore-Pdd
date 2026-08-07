import * as fs from 'fs';
import * as path from 'path';

export class Logger {
  private static logDir = path.join(process.cwd(), 'Test Results', 'Logs');
  private static logFile = path.join(Logger.logDir, 'appium_execution.log');

  public static init() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    fs.writeFileSync(this.logFile, `=== VitalCore E2E Appium Test Execution Log ===\nStarted at: ${new Date().toISOString()}\n\n`);
  }

  public static info(message: string) {
    const entry = `[INFO] [${new Date().toISOString()}] ${message}`;
    console.log(entry);
    fs.appendFileSync(this.logFile, entry + '\n');
  }

  public static error(message: string, error?: any) {
    const entry = `[ERROR] [${new Date().toISOString()}] ${message} ${error ? error.stack || error : ''}`;
    console.error(entry);
    fs.appendFileSync(this.logFile, entry + '\n');
  }

  public static warn(message: string) {
    const entry = `[WARN] [${new Date().toISOString()}] ${message}`;
    console.warn(entry);
    fs.appendFileSync(this.logFile, entry + '\n');
  }

  public static getLogFilePath(): string {
    return this.logFile;
  }
}
