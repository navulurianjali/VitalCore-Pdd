import * as fs from 'fs';
import * as path from 'path';

export interface TestResultItem {
  id: string;
  module: string;
  title: string;
  priority: 'P0' | 'P1' | 'P2';
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  durationMs: number;
  error?: string;
  timestamp: string;
}

export interface SummaryReport {
  projectName: string;
  framework: string;
  environment: string;
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: string;
  totalDurationSeconds: number;
  tests: TestResultItem[];
}

const reportResults: TestResultItem[] = [];

export function recordTestResult(item: TestResultItem) {
  reportResults.push(item);
}

export function generateJsonReport(outputDir: string = path.join(__dirname, '../reports')) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const passed = reportResults.filter(t => t.status === 'PASSED').length;
  const failed = reportResults.filter(t => t.status === 'FAILED').length;
  const skipped = reportResults.filter(t => t.status === 'SKIPPED').length;
  const total = reportResults.length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%';
  const totalDurationSeconds = reportResults.reduce((acc, t) => acc + t.durationMs, 0) / 1000;

  const summary: SummaryReport = {
    projectName: 'VitalCore Expo React Native',
    framework: 'Appium 2.x + WebdriverIO + TypeScript (POM)',
    environment: 'Android Emulator (UiAutomator2)',
    timestamp: new Date().toISOString(),
    totalTests: total,
    passed,
    failed,
    skipped,
    passRate,
    totalDurationSeconds: Math.round(totalDurationSeconds * 100) / 100,
    tests: reportResults,
  };

  const jsonPath = path.join(outputDir, 'appium_execution_report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`[REPORTER] JSON Report generated successfully: ${jsonPath}`);
  return summary;
}

export function getRecordedResults(): TestResultItem[] {
  return reportResults;
}
