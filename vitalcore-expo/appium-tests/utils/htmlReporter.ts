import * as fs from 'fs';
import * as path from 'path';
import { TestCaseResult } from '../data/testData';
import { Logger } from './logger';

export class HtmlReporter {
  private outputDir: string;

  constructor(reportsDir: string = './Test Results') {
    this.outputDir = path.join(process.cwd(), reportsDir, 'HTML');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  public async generateReport(results: TestCaseResult[]): Promise<void> {
    const total = results.length;
    const passed = results.filter((r) => r.status === 'PASS').length;
    const failed = results.filter((r) => r.status === 'FAIL').length;
    const skipped = results.filter((r) => r.status !== 'PASS' && r.status !== 'FAIL').length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';
    const totalTime = results.reduce((s, r) => s + r.executionTime, 0).toFixed(2);

    const modules = Array.from(new Set(results.map((r) => r.module)));
    const moduleStats = modules.map((mod) => {
      const mr = results.filter((r) => r.module === mod);
      return {
        name: mod,
        total: mr.length,
        passed: mr.filter((r) => r.status === 'PASS').length,
        failed: mr.filter((r) => r.status === 'FAIL').length,
        passRate: mr.length > 0 ? ((mr.filter((r) => r.status === 'PASS').length / mr.length) * 100).toFixed(1) : '0.0',
      };
    });

    const statusBadge = (s: string) => {
      const colors: Record<string, string> = { PASS: '#28a745', FAIL: '#dc3545', SKIPPED: '#ffc107', BLOCKED: '#6c757d' };
      return `<span style="background:${colors[s] || '#6c757d'};color:white;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:bold;">${s}</span>`;
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>VitalCore Appium E2E Report</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',sans-serif;background:#0f0f1a;color:#e0e0e0;min-height:100vh}
  .header{background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);padding:30px 40px;display:flex;justify-content:space-between;align-items:center}
  .header h1{color:#00d4ff;font-size:26px;font-weight:700}
  .header .meta{color:#a0a8b8;font-size:13px}
  .container{padding:30px 40px}
  .stats-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:30px}
  .stat-card{background:#16213e;border-radius:12px;padding:20px;text-align:center;border:1px solid #0f3460;transition:transform .2s}
  .stat-card:hover{transform:translateY(-2px)}
  .stat-card .value{font-size:32px;font-weight:800;margin-bottom:6px}
  .stat-card .label{font-size:12px;color:#a0a8b8;text-transform:uppercase;letter-spacing:1px}
  .pass-rate{background:linear-gradient(135deg,#155724,#1e7e34);border-radius:12px;padding:20px 30px;margin-bottom:24px;display:flex;align-items:center;gap:20px}
  .pass-rate .big{font-size:48px;font-weight:800;color:#00d4ff}
  .pass-rate .detail{color:#a0e8a0;font-size:14px}
  .section{background:#16213e;border-radius:12px;border:1px solid #0f3460;margin-bottom:24px;overflow:hidden}
  .section-header{padding:16px 20px;background:#0f3460;font-weight:700;font-size:15px;color:#00d4ff}
  table{width:100%;border-collapse:collapse}
  th{padding:10px 14px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:#a0a8b8;background:#1a2a40;border-bottom:1px solid #0f3460}
  td{padding:10px 14px;font-size:13px;border-bottom:1px solid #1a2a40;vertical-align:top}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:#1e3050}
  .pass{color:#28a745}.fail{color:#dc3545}.skip{color:#ffc107}
  .footer{text-align:center;padding:20px;color:#555;font-size:12px}
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>🤖 VitalCore Appium E2E Test Report</h1>
    <div class="meta">Platform: Android | Engine: WebdriverIO + UiAutomator2 | Generated: ${new Date().toLocaleString('en-IN')}</div>
  </div>
  <div style="color:#00d4ff;font-size:18px;font-weight:bold;">Total: ${total} Tests</div>
</div>
<div class="container">
  <div class="stats-grid">
    <div class="stat-card"><div class="value" style="color:#00d4ff">${total}</div><div class="label">Total</div></div>
    <div class="stat-card"><div class="value" style="color:#28a745">${passed}</div><div class="label">Passed</div></div>
    <div class="stat-card"><div class="value" style="color:#dc3545">${failed}</div><div class="label">Failed</div></div>
    <div class="stat-card"><div class="value" style="color:#ffc107">${skipped}</div><div class="label">Skipped</div></div>
    <div class="stat-card"><div class="value" style="color:#17a2b8">${totalTime}s</div><div class="label">Total Time</div></div>
  </div>
  <div class="pass-rate">
    <div class="big">${passRate}%</div>
    <div class="detail">
      <div style="font-size:18px;font-weight:700;margin-bottom:4px">Pass Rate</div>
      <div>Quality Gate (95%): ${parseFloat(passRate) >= 95 ? '✅ PASSED' : '❌ FAILED'}</div>
      <div style="margin-top:4px">Total Execution Time: ${totalTime}s</div>
    </div>
  </div>
  <div class="section">
    <div class="section-header">📊 Module Summary</div>
    <table>
      <thead><tr><th>Module</th><th>Total</th><th>Passed</th><th>Failed</th><th>Pass Rate</th></tr></thead>
      <tbody>
        ${moduleStats.map((m) => `<tr>
          <td>${m.name}</td>
          <td>${m.total}</td>
          <td class="pass">${m.passed}</td>
          <td class="fail">${m.failed}</td>
          <td><strong>${m.passRate}%</strong></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
  ${failed > 0 ? `<div class="section">
    <div class="section-header">❌ Failed Tests (${failed})</div>
    <table>
      <thead><tr><th>Test ID</th><th>Module</th><th>Test Name</th><th>Priority</th><th>Failure Reason</th></tr></thead>
      <tbody>
        ${results.filter((r) => r.status === 'FAIL').map((r) => `<tr>
          <td><code>${r.id}</code></td>
          <td>${r.module}</td>
          <td>${r.name}</td>
          <td><strong style="color:#dc3545">${r.priority}</strong></td>
          <td style="color:#dc3545">${r.failureReason || 'N/A'}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>` : `<div class="section"><div class="section-header">🎉 All Tests Passed!</div><div style="padding:20px;text-align:center;color:#28a745;font-size:18px;">No failed tests found.</div></div>`}
  <div class="section">
    <div class="section-header">📋 All Test Results</div>
    <table>
      <thead><tr><th>Test ID</th><th>Module</th><th>Test Name</th><th>Priority</th><th>Status</th><th>Time (s)</th></tr></thead>
      <tbody>
        ${results.map((r) => `<tr>
          <td><code>${r.id}</code></td>
          <td>${r.module}</td>
          <td>${r.name}</td>
          <td>${r.priority}</td>
          <td>${statusBadge(r.status)}</td>
          <td>${r.executionTime}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>
<div class="footer">VitalCore QA Automation | Appium E2E Suite | ${new Date().getFullYear()}</div>
</body></html>`;

    fs.writeFileSync(path.join(this.outputDir, 'appium_e2e_report.html'), html);
    Logger.info('HTML report generated: appium_e2e_report.html');
  }
}
