import * as fs from 'fs';
import * as path from 'path';
import { TestCaseResult } from '../data/testData';
import { Logger } from './logger';

export class JsonReporter {
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'Test Results', 'JSON');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  public async generateReport(results: TestCaseResult[]): Promise<void> {
    Logger.info('Generating JSON Report...');

    const total = results.length;
    const passed = results.filter((r) => r.status === 'PASS').length;
    const failed = results.filter((r) => r.status === 'FAIL').length;
    const skipped = results.filter((r) => r.status === 'SKIPPED').length;

    const payload = {
      summary: {
        timestamp: new Date().toISOString(),
        total,
        passed,
        failed,
        skipped,
        passRate: `${((passed / total) * 100).toFixed(2)}%`,
      },
      testCases: results,
    };

    fs.writeFileSync(
      path.join(this.outputDir, 'execution-results.json'),
      JSON.stringify(payload, null, 2)
    );
  }
}
