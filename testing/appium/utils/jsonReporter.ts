import * as fs from 'fs';
import * as path from 'path';
import { TestCaseResult } from '../data/testData';
import { Logger } from './logger';

export class JsonReporter {
  private outputDir: string;

  constructor(reportsDir: string = './Test Results') {
    this.outputDir = path.join(process.cwd(), reportsDir, 'JSON');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  public async generateReport(results: TestCaseResult[]): Promise<void> {
    const total = results.length;
    const passed = results.filter((r) => r.status === 'PASS').length;
    const failed = results.filter((r) => r.status === 'FAIL').length;
    const skipped = results.filter((r) => r.status !== 'PASS' && r.status !== 'FAIL').length;

    const report = {
      generatedAt: new Date().toISOString(),
      suite: 'VitalCore Appium E2E',
      platform: 'Android',
      summary: {
        total,
        passed,
        failed,
        skipped,
        passRate: total > 0 ? parseFloat(((passed / total) * 100).toFixed(2)) : 0,
        totalExecutionTime: parseFloat(results.reduce((s, r) => s + r.executionTime, 0).toFixed(2)),
        qualityGate: passed / total >= 0.95 ? 'PASSED' : 'FAILED',
      },
      results,
    };

    fs.writeFileSync(
      path.join(this.outputDir, 'appium_results.json'),
      JSON.stringify(report, null, 2),
    );
    Logger.info('JSON report generated: appium_results.json');
  }
}
