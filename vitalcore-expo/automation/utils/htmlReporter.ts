import * as fs from 'fs';
import * as path from 'path';
import { TestCaseResult } from '../data/testData';
import { Logger } from './logger';

export class HtmlReporter {
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'Test Results', 'HTML');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  public async generateAllReports(results: TestCaseResult[]): Promise<void> {
    Logger.info('Generating HTML Reports...');

    const total = results.length;
    const passed = results.filter((r) => r.status === 'PASS').length;
    const failed = results.filter((r) => r.status === 'FAIL').length;
    const skipped = results.filter((r) => r.status === 'SKIPPED').length;
    const passRate = ((passed / total) * 100).toFixed(1);
    const durationTotal = results.reduce((acc, r) => acc + r.executionTime, 0).toFixed(1);

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VitalCore Appium E2E Execution Report</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --muted: #94a3b8;
      --primary: #3b82f6;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; }
    .brand { font-size: 1.8rem; font-weight: 800; color: var(--primary); letter-spacing: -0.5px; }
    .subtitle { color: var(--muted); font-size: 0.9rem; margin-top: 0.3rem; }
    .badge { background: rgba(59, 130, 246, 0.15); color: var(--primary); border: 1px solid var(--primary); padding: 0.4rem 0.8rem; borderRadius: 20px; font-size: 0.85rem; font-weight: 600; }
    
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
    .metric-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; }
    .metric-title { font-size: 0.85rem; color: var(--muted); text-transform: uppercase; font-weight: 600; }
    .metric-value { font-size: 2.2rem; font-weight: 800; margin-top: 0.5rem; }
    .text-success { color: var(--success); }
    .text-danger { color: var(--danger); }
    .text-warning { color: var(--warning); }
    .text-primary { color: var(--primary); }

    .table-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; overflow-x: auto; }
    .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { padding: 0.75rem 1rem; color: var(--muted); font-size: 0.85rem; border-bottom: 1px solid var(--border); text-transform: uppercase; }
    td { padding: 0.85rem 1rem; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
    tr:hover { background: rgba(255, 255, 255, 0.02); }
    
    .status-tag { padding: 0.25rem 0.6rem; border-radius: 6px; font-weight: 700; font-size: 0.75rem; display: inline-block; }
    .tag-pass { background: rgba(16, 185, 129, 0.15); color: var(--success); }
    .tag-fail { background: rgba(239, 68, 68, 0.15); color: var(--danger); }
    .tag-skip { background: rgba(245, 158, 11, 0.15); color: var(--warning); }

    .filter-bar { display: flex; gap: 0.5rem; }
    .filter-btn { background: var(--bg); border: 1px solid var(--border); color: var(--text); padding: 0.4rem 0.8rem; border-radius: 8px; cursor: pointer; font-size: 0.85rem; }
    .filter-btn.active { background: var(--primary); border-color: var(--primary); }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">VitalCore AI Mobile Automation</div>
      <div class="subtitle">Appium E2E Enterprise Test Execution Dashboard & Analytics</div>
    </div>
    <div class="badge">Environment: Android Emulator (API 33)</div>
  </div>

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-title">Total Test Cases</div>
      <div class="metric-value text-primary">${total}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Passed Tests</div>
      <div class="metric-value text-success">${passed}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Failed Tests</div>
      <div class="metric-value text-danger">${failed}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Skipped Tests</div>
      <div class="metric-value text-warning">${skipped}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Pass Rate</div>
      <div class="metric-value text-success">${passRate}%</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Total Duration</div>
      <div class="metric-value text-primary">${durationTotal}s</div>
    </div>
  </div>

  <div class="table-card">
    <div class="table-header">
      <h2>Executable Test Suite Results (${total} Scenarios)</h2>
      <div class="filter-bar">
        <button class="filter-btn active">All (${total})</button>
        <button class="filter-btn">Passed (${passed})</button>
        <button class="filter-btn">Failed (${failed})</button>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Test ID</th>
          <th>Module</th>
          <th>Test Name</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Actual Result / Details</th>
        </tr>
      </thead>
      <tbody>
        ${results
          .map(
            (r) => `
        <tr>
          <td style="font-family: monospace; font-weight: bold;">${r.id}</td>
          <td>${r.module}</td>
          <td>${r.name}</td>
          <td><span class="status-tag" style="background: #334155;">${r.priority}</span></td>
          <td><span class="status-tag ${
            r.status === 'PASS'
              ? 'tag-pass'
              : r.status === 'FAIL'
              ? 'tag-fail'
              : 'tag-skip'
          }">${r.status}</span></td>
          <td>${r.executionTime}s</td>
          <td style="color: ${r.status === 'FAIL' ? '#f87171' : 'inherit'};">${r.failureReason || r.actualResult}</td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;

    fs.writeFileSync(path.join(this.outputDir, 'execution-report.html'), htmlContent);
    fs.writeFileSync(path.join(this.outputDir, 'dashboard.html'), htmlContent);
    fs.writeFileSync(path.join(this.outputDir, 'trends.html'), htmlContent);

    Logger.info('HTML Reports generated: execution-report.html, dashboard.html, trends.html');
  }
}
