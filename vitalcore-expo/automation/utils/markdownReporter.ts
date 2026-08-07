import * as fs from 'fs';
import * as path from 'path';
import { TestCaseResult } from '../data/testData';
import { Logger } from './logger';

export class MarkdownReporter {
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'Test Results', 'Summary');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  public async generateSummary(results: TestCaseResult[]): Promise<void> {
    Logger.info('Generating Markdown Summary...');

    const total = results.length;
    const passed = results.filter((r) => r.status === 'PASS');
    const failed = results.filter((r) => r.status === 'FAIL');
    const skipped = results.filter((r) => r.status === 'SKIPPED');
    const passRate = ((passed.length / total) * 100).toFixed(1);

    const mdContent = `# Android Appium E2E Execution Summary

**Build Number:** ${process.env.GITHUB_RUN_NUMBER || 'LOCAL_RUN'}  
**Execution Date:** ${new Date().toISOString()}  
**Git Commit:** ${process.env.GITHUB_SHA || 'HEAD'}  
**Branch:** ${process.env.GITHUB_REF_NAME || 'main'}  
**APK Version:** VitalCore Expo 1.0.0  
**Device:** ${process.env.ANDROID_DEVICE_NAME || 'Android Emulator'}  
**Android Version:** 13.0 (API 33)  

---

### Execution Metrics

- **Total Test Cases:** ${total}
- **Executed:** ${total - skipped.length}
- **Passed:** ${passed.length}
- **Failed:** ${failed.length}
- **Skipped:** ${skipped.length}
- **Blocked:** 0
- **Pass Percentage:** ${passRate}%
- **Fail Percentage:** ${((failed.length / total) * 100).toFixed(1)}%

---

### Valid Test Case Summary

#### PASSED TESTS (${passed.length})
${passed.slice(0, 10).map(r => `✓ **${r.id}** - ${r.name}`).join('\n')}
*... and ${passed.length - 10} more passed tests.*

#### FAILED TESTS (${failed.length})
${failed.map(r => `✗ **${r.id}** - ${r.name}\n  *Reason:* ${r.failureReason || 'Assertion mismatch'}`).join('\n')}

#### SKIPPED TESTS (${skipped.length})
${skipped.map(r => `- **${r.id}** - ${r.name}\n  *Reason:* ${r.failureReason || 'Skipped'}`).join('\n')}
`;

    fs.writeFileSync(path.join(this.outputDir, 'summary.md'), mdContent);
  }
}
