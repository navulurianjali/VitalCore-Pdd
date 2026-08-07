import * as fs from 'fs';
import * as path from 'path';
import { getRecordedResults } from './jsonReporter';

export function generateExcelReport(outputDir: string = path.join(__dirname, '../reports')) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results = getRecordedResults();

  // Build CSV content formatted for Excel
  const headers = ['Test Case ID', 'Module', 'Test Title', 'Priority', 'Status', 'Duration (Seconds)', 'Timestamp', 'Failure Reason'];
  const rows = results.map(r => [
    `"${r.id}"`,
    `"${r.module}"`,
    `"${r.title.replace(/"/g, '""')}"`,
    `"${r.priority}"`,
    `"${r.status}"`,
    `"${(r.durationMs / 1000).toFixed(2)}"`,
    `"${r.timestamp}"`,
    `"${(r.error || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const excelPath = path.join(outputDir, 'appium_execution_report.csv');
  fs.writeFileSync(excelPath, csvContent, 'utf-8');
  console.log(`[REPORTER] Excel/CSV Report generated successfully: ${excelPath}`);
  return excelPath;
}
