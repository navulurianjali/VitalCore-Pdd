import * as fs from 'fs';
import * as path from 'path';
import { getRecordedResults } from './jsonReporter';

export function generateHtmlReport(outputDir: string = path.join(__dirname, '../reports')) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results = getRecordedResults();
  const total = results.length;
  const passed = results.filter(t => t.status === 'PASSED').length;
  const failed = results.filter(t => t.status === 'FAILED').length;
  const skipped = results.filter(t => t.status === 'SKIPPED').length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';

  const rows = results.map(r => `
    <tr class="${r.status.toLowerCase()}">
      <td class="code">${r.id}</td>
      <td class="module">${r.module}</td>
      <td class="title">${escapeHtml(r.title)}</td>
      <td class="priority p-${r.priority.toLowerCase()}">${r.priority}</td>
      <td><span class="badge ${r.status.toLowerCase()}">${r.status}</span></td>
      <td>${(r.durationMs / 1000).toFixed(2)}s</td>
      <td class="error">${r.error ? escapeHtml(r.error) : '-'}</td>
    </tr>
  `).join('\n');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VitalCore Appium Test Automation Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 24px; }
    h1 { font-size: 24px; margin: 0; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .meta { font-size: 12px; color: #94a3b8; }
    .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .card { background: #1e293b; padding: 20px; border-radius: 16px; border: 1px solid #334155; text-align: center; }
    .card .val { font-size: 32px; font-weight: 800; margin-top: 4px; }
    .card.total .val { color: #38bdf8; }
    .card.pass .val { color: #4ade80; }
    .card.fail .val { color: #f87171; }
    .card.rate .val { color: #fbbf24; }
    table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; }
    th, td { padding: 12px 16px; text-align: left; font-size: 13px; border-bottom: 1px solid #334155; }
    th { background: #0f172a; color: #94a3b8; font-weight: 700; text-transform: uppercase; font-size: 11px; }
    tr:hover { background: #33415522; }
    .code { font-family: monospace; font-weight: 700; color: #38bdf8; }
    .module { font-weight: 600; color: #cbd5e1; }
    .badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .badge.passed { background: #166534; color: #4ade80; }
    .badge.failed { background: #991b1b; color: #f87171; }
    .badge.skipped { background: #854d0e; color: #fbbf24; }
    .error { color: #f87171; font-size: 11px; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .p-p0 { color: #ef4444; font-weight: 800; }
    .p-p1 { color: #fbbf24; font-weight: 700; }
    .p-p2 { color: #38bdf8; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>📱 VitalCore Appium 2.x Automation Suite</h1>
      <div class="meta">Framework: WebdriverIO + TypeScript + POM | Driver: UiAutomator2 | Platform: Android Emulator</div>
    </div>
    <div class="meta">Timestamp: ${new Date().toLocaleString()}</div>
  </div>

  <div class="cards">
    <div class="card total">
      <div>Total Executed</div>
      <div class="val">${total}</div>
    </div>
    <div class="card pass">
      <div>Passed Tests</div>
      <div class="val">${passed}</div>
    </div>
    <div class="card fail">
      <div>Failed Tests</div>
      <div class="val">${failed}</div>
    </div>
    <div class="card rate">
      <div>Pass Rate</div>
      <div class="val">${passRate}%</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Test ID</th>
        <th>Module</th>
        <th>Title</th>
        <th>Priority</th>
        <th>Status</th>
        <th>Duration</th>
        <th>Error Details</th>
      </tr>
    </thead>
    <tbody>
      ${rows.length > 0 ? rows : '<tr><td colspan="7" style="text-align:center;">No tests recorded yet.</td></tr>'}
    </tbody>
  </table>
</body>
</html>`;

  const htmlPath = path.join(outputDir, 'appium_execution_report.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log(`[REPORTER] HTML Report generated successfully: ${htmlPath}`);
  return htmlPath;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
