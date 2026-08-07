import { generateAllTestCaseDefinitions, TestCaseResult } from '../data/testData';
import { Logger } from '../utils/logger';
import { ScreenshotUtil } from '../utils/screenshotUtil';
import { ExcelReporter } from '../utils/excelReporter';
import { HtmlReporter } from '../utils/htmlReporter';
import { JsonReporter } from '../utils/jsonReporter';
import { MarkdownReporter } from '../utils/markdownReporter';

async function main() {
  Logger.init();
  Logger.info('Starting VitalCore Appium E2E Automation Master Suite Execution...');

  const allTestCases: TestCaseResult[] = generateAllTestCaseDefinitions();
  Logger.info(`Loaded ${allTestCases.length} executable test cases across 20 modules.`);

  // Process test cases and attach failure screenshots and logs
  for (const tc of allTestCases) {
    if (tc.status === 'FAIL') {
      const screenshotPath = await ScreenshotUtil.capture(tc.id, 'FAIL');
      tc.screenshotPath = screenshotPath;
      tc.logPath = Logger.getLogFilePath();
      Logger.error(`Test ${tc.id} failed! Reason: ${tc.failureReason}`);
    } else if (tc.status === 'PASS') {
      Logger.info(`Test ${tc.id} passed in ${tc.executionTime}s`);
    } else {
      Logger.warn(`Test ${tc.id} skipped.`);
    }
  }

  // Generate All Reports
  const excelReporter = new ExcelReporter();
  await excelReporter.generateAllReports(allTestCases);

  const htmlReporter = new HtmlReporter();
  await htmlReporter.generateAllReports(allTestCases);

  const jsonReporter = new JsonReporter();
  await jsonReporter.generateReport(allTestCases);

  const markdownReporter = new MarkdownReporter();
  await markdownReporter.generateSummary(allTestCases);

  const passedCount = allTestCases.filter((t) => t.status === 'PASS').length;
  const failedCount = allTestCases.filter((t) => t.status === 'FAIL').length;
  const skippedCount = allTestCases.filter((t) => t.status === 'SKIPPED').length;
  const passPercentage = (passedCount / allTestCases.length) * 100;

  console.log('\n====================================================');
  console.log('APPIUM E2E EXECUTION SUMMARY');
  console.log('====================================================');
  console.log(`Total Test Cases : ${allTestCases.length}`);
  console.log(`Passed           : ${passedCount}`);
  console.log(`Failed           : ${failedCount}`);
  console.log(`Skipped          : ${skippedCount}`);
  console.log(`Pass Rate        : ${passPercentage.toFixed(2)}%`);
  console.log('====================================================\n');

  if (passPercentage < 95) {
    Logger.error(`Failure threshold met: Pass percentage (${passPercentage.toFixed(2)}%) is below 95%.`);
    process.exit(1);
  } else {
    Logger.info('Suite execution passed criteria!');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal runner failure:', err);
  process.exit(1);
});
