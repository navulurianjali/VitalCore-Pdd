// ============================================================
// VitalCore Selenium (Node.js) – Excel Analysis Report Generator
// Generates 7-sheet Excel workbook with rich formatting
// ============================================================
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { TestCaseResult } from '../data/testData';
import { Logger } from './logger';

const COLORS = {
  headerBg: 'FF0F3460',
  headerFg: 'FFFFFFFF',
  pass: 'FFD4EDDA',
  passText: 'FF155724',
  fail: 'FFF8D7DA',
  failText: 'FF721C24',
  skip: 'FFFFF3CD',
  skipText: 'FF856404',
  altRow: 'FFF8F9FA',
  accent: 'FF16213E',
};

const FONT_NAME = 'Calibri';

function styleHeader(sheet: ExcelJS.Worksheet): void {
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    cell.font = { bold: true, color: { argb: COLORS.headerFg }, name: FONT_NAME, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { bottom: { style: 'medium', color: { argb: 'FF0A2342' } } };
  });
  headerRow.height = 28;
}

function applyStatusFill(cell: ExcelJS.Cell, status: string): void {
  const m: Record<string, { bg: string; text: string }> = {
    PASS: { bg: COLORS.pass, text: COLORS.passText },
    FAIL: { bg: COLORS.fail, text: COLORS.failText },
    SKIPPED: { bg: COLORS.skip, text: COLORS.skipText },
    BLOCKED: { bg: 'FFE2E3E5', text: 'FF383D41' },
  };
  const s = m[status] || m['BLOCKED'];
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: s.bg } };
  cell.font = { ...cell.font, bold: true, color: { argb: s.text }, name: FONT_NAME };
}

function defaultCellStyle(row: ExcelJS.Row, alt: boolean): void {
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { name: FONT_NAME, size: 10 };
    cell.alignment = { vertical: 'middle', wrapText: true };
    if (alt) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.altRow } };
    }
  });
  row.height = 20;
}

export class ExcelReporter {
  private outputDir: string;

  constructor(reportsDir: string = './Test Results') {
    this.outputDir = path.join(process.cwd(), reportsDir, 'Excel');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  public async generateAllReports(results: TestCaseResult[]): Promise<void> {
    Logger.info('Generating Selenium Excel Analysis Reports...');
    await this.generateMainReport(results);
    await this.generatePassedReport(results.filter((r) => r.status === 'PASS'));
    await this.generateFailedReport(results.filter((r) => r.status === 'FAIL'));
    await this.generateSummaryReport(results);
    Logger.info(`Excel Reports saved to: ${this.outputDir}`);
  }

  private async generateMainReport(results: TestCaseResult[]): Promise<void> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'VitalCore QA Automation – Selenium Node.js Suite';
    wb.created = new Date();

    const total = results.length;
    const passed = results.filter((r) => r.status === 'PASS').length;
    const failed = results.filter((r) => r.status === 'FAIL').length;
    const skipped = results.filter((r) => r.status === 'SKIPPED').length;
    const blocked = results.filter((r) => r.status === 'BLOCKED').length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';
    const totalTime = results.reduce((s, r) => s + r.executionTime, 0).toFixed(2);

    // ─── Sheet 1: All Test Cases ───────────────────────────
    const s1 = wb.addWorksheet('📋 All Test Cases');
    s1.columns = [
      { header: 'Test ID', key: 'id', width: 18 },
      { header: 'Module', key: 'module', width: 26 },
      { header: 'Test Name', key: 'name', width: 42 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Exec Time (s)', key: 'executionTime', width: 15 },
      { header: 'URL', key: 'url', width: 32 },
      { header: 'Expected Result', key: 'expectedResult', width: 40 },
      { header: 'Actual Result', key: 'actualResult', width: 40 },
      { header: 'Preconditions', key: 'preconditions', width: 40 },
      { header: 'Steps', key: 'steps', width: 45 },
      { header: 'Test Data', key: 'testData', width: 32 },
      { header: 'Browser', key: 'browserInfo', width: 22 },
    ];
    styleHeader(s1);
    results.forEach((r, i) => {
      const row = s1.addRow({
        id: r.id,
        module: r.module,
        name: r.name,
        priority: r.priority,
        status: r.status,
        executionTime: r.executionTime,
        url: r.url || 'N/A',
        expectedResult: r.expectedResult,
        actualResult: r.actualResult,
        preconditions: r.preconditions,
        steps: r.steps,
        testData: r.testData,
        browserInfo: r.browserInfo || 'Chrome / Windows',
      });
      defaultCellStyle(row, i % 2 !== 0);
      applyStatusFill(row.getCell(5), r.status); // col 5 = status
      const pColors: Record<string, string> = { P0: 'FFDC3545', P1: 'FFFD7E14', P2: 'FFC8A000', P3: 'FF198754' };
      row.getCell(4).font = { name: FONT_NAME, size: 10, bold: true, color: { argb: pColors[r.priority] || 'FF000000' } };
    });
    s1.autoFilter = { from: 'A1', to: 'M1' };
    s1.views = [{ state: 'frozen', ySplit: 1 }];

    // ─── Sheet 2: Passed ──────────────────────────────────
    const s2 = wb.addWorksheet('✅ Passed Tests');
    s2.columns = [
      { header: 'Test ID', key: 'id', width: 18 },
      { header: 'Module', key: 'module', width: 26 },
      { header: 'Test Name', key: 'name', width: 45 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'Exec Time (s)', key: 'executionTime', width: 15 },
      { header: 'URL', key: 'url', width: 32 },
    ];
    styleHeader(s2);
    results.filter((r) => r.status === 'PASS').forEach((r, i) => {
      const row = s2.addRow(r);
      defaultCellStyle(row, i % 2 !== 0);
    });
    s2.views = [{ state: 'frozen', ySplit: 1 }];

    // ─── Sheet 3: Failed ──────────────────────────────────
    const s3 = wb.addWorksheet('❌ Failed Tests');
    s3.columns = [
      { header: 'Test ID', key: 'id', width: 18 },
      { header: 'Module', key: 'module', width: 26 },
      { header: 'Test Name', key: 'name', width: 42 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'URL', key: 'url', width: 32 },
      { header: 'Expected Result', key: 'expectedResult', width: 40 },
      { header: 'Failure Reason', key: 'failureReason', width: 55 },
      { header: 'Screenshot', key: 'screenshotPath', width: 38 },
    ];
    styleHeader(s3);
    results.filter((r) => r.status === 'FAIL').forEach((r, i) => {
      const row = s3.addRow({
        id: r.id, module: r.module, name: r.name, priority: r.priority,
        url: r.url || 'N/A', expectedResult: r.expectedResult,
        failureReason: r.failureReason || 'Unknown failure',
        screenshotPath: r.screenshotPath || 'N/A',
      });
      defaultCellStyle(row, i % 2 !== 0);
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF5F5' } };
    });
    if (results.filter((r) => r.status === 'FAIL').length === 0) {
      s3.addRow(['-', '-', '🎉 No failed tests!', '-', '-', '-', '-', '-']);
    }
    s3.views = [{ state: 'frozen', ySplit: 1 }];

    // ─── Sheet 4: Skipped ─────────────────────────────────
    const s4 = wb.addWorksheet('⏭️ Skipped Tests');
    s4.columns = [
      { header: 'Test ID', key: 'id', width: 18 },
      { header: 'Module', key: 'module', width: 26 },
      { header: 'Test Name', key: 'name', width: 45 },
      { header: 'Priority', key: 'priority', width: 10 },
    ];
    styleHeader(s4);
    results.filter((r) => r.status === 'SKIPPED' || r.status === 'BLOCKED').forEach((r, i) => {
      const row = s4.addRow(r);
      defaultCellStyle(row, i % 2 !== 0);
    });
    s4.views = [{ state: 'frozen', ySplit: 1 }];

    // ─── Sheet 5: Module Summary ───────────────────────────
    const s5 = wb.addWorksheet('📊 Module Summary');
    s5.columns = [
      { header: 'Module', key: 'module', width: 30 },
      { header: 'Route', key: 'route', width: 22 },
      { header: 'Total', key: 'total', width: 10 },
      { header: 'Passed', key: 'passed', width: 10 },
      { header: 'Failed', key: 'failed', width: 10 },
      { header: 'Skipped', key: 'skipped', width: 10 },
      { header: 'Pass Rate %', key: 'passRate', width: 14 },
      { header: 'Total Time (s)', key: 'time', width: 16 },
    ];
    styleHeader(s5);
    const modules = Array.from(new Set(results.map((r) => r.module)));
    modules.forEach((mod, i) => {
      const mr = results.filter((r) => r.module === mod);
      const mTotal = mr.length;
      const mPass = mr.filter((r) => r.status === 'PASS').length;
      const mFail = mr.filter((r) => r.status === 'FAIL').length;
      const mSkip = mr.filter((r) => r.status !== 'PASS' && r.status !== 'FAIL').length;
      const mRate = mTotal > 0 ? ((mPass / mTotal) * 100).toFixed(1) : '0.0';
      const mTime = mr.reduce((s, r) => s + r.executionTime, 0).toFixed(2);
      const route = mr[0]?.url?.replace('http://localhost:3000', '') || '/';
      const row = s5.addRow({ module: mod, route, total: mTotal, passed: mPass, failed: mFail, skipped: mSkip, passRate: `${mRate}%`, time: mTime });
      defaultCellStyle(row, i % 2 !== 0);
      const rc = row.getCell('passRate');
      const rate = parseFloat(mRate);
      rc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rate >= 90 ? COLORS.pass : rate >= 70 ? COLORS.skip : COLORS.fail } };
      rc.font = { name: FONT_NAME, size: 10, bold: true };
    });
    const totRow = s5.addRow({ module: 'TOTAL', route: 'All Routes', total, passed, failed, skipped, passRate: `${passRate}%`, time: totalTime });
    totRow.font = { bold: true, name: FONT_NAME };
    totRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4E8' } };
    s5.views = [{ state: 'frozen', ySplit: 1 }];

    // ─── Sheet 6: Execution Metrics ───────────────────────
    const s6 = wb.addWorksheet('⚡ Execution Metrics');
    s6.getColumn(1).width = 36;
    s6.getColumn(2).width = 24;
    const metrics: [string, string | number][] = [
      ['VitalCore Selenium E2E – Execution Report', ''],
      ['', ''],
      ['Execution Date', new Date().toLocaleString('en-IN')],
      ['Suite', 'VitalCore Web App – Selenium Node.js'],
      ['Browser', 'Google Chrome'],
      ['Base URL', 'http://localhost:3000'],
      ['', ''],
      ['RESULTS', ''],
      ['Total Test Cases', total],
      ['Executed', total - skipped],
      ['Passed', passed],
      ['Failed', failed],
      ['Skipped / Blocked', skipped + blocked],
      ['Pass Rate', `${passRate}%`],
      ['', ''],
      ['TIMING', ''],
      ['Total Execution Time (s)', totalTime],
      ['Average per Test (s)', total > 0 ? (parseFloat(totalTime) / total).toFixed(2) : '0.00'],
      ['Fastest Test (s)', results.length > 0 ? Math.min(...results.map((r) => r.executionTime)).toFixed(2) : '0.00'],
      ['Slowest Test (s)', results.length > 0 ? Math.max(...results.map((r) => r.executionTime)).toFixed(2) : '0.00'],
      ['', ''],
      ['QUALITY GATE', ''],
      ['Pass Rate Threshold', '95%'],
      ['Result', parseFloat(passRate) >= 95 ? '✅ PASSED QUALITY GATE' : '❌ FAILED QUALITY GATE'],
    ];
    metrics.forEach(([label, value]) => {
      const row = s6.addRow([label, value]);
      if (label === 'VitalCore Selenium E2E – Execution Report') {
        row.font = { bold: true, size: 14, name: FONT_NAME, color: { argb: COLORS.accent } };
        row.height = 30;
      } else if (['RESULTS', 'TIMING', 'QUALITY GATE'].includes(label)) {
        row.font = { bold: true, size: 12, name: FONT_NAME, color: { argb: COLORS.headerBg } };
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9F0FA' } };
        row.height = 22;
      } else if (label === 'Result') {
        const c = row.getCell(2);
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: parseFloat(passRate) >= 95 ? COLORS.pass : COLORS.fail } };
        c.font = { bold: true, name: FONT_NAME };
      } else {
        row.getCell(1).font = { name: FONT_NAME, size: 10 };
        row.getCell(2).font = { name: FONT_NAME, size: 10, bold: !!value };
      }
    });

    // ─── Sheet 7: Defect Log ───────────────────────────────
    const s7 = wb.addWorksheet('🐛 Defect Log');
    s7.columns = [
      { header: '#', key: 'seq', width: 6 },
      { header: 'Test ID', key: 'id', width: 18 },
      { header: 'Module', key: 'module', width: 26 },
      { header: 'Test Name', key: 'name', width: 42 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'URL', key: 'url', width: 32 },
      { header: 'Failure Reason', key: 'failureReason', width: 55 },
      { header: 'Screenshot', key: 'screenshotPath', width: 38 },
    ];
    styleHeader(s7);
    const failedTests = results.filter((r) => r.status === 'FAIL');
    failedTests.forEach((r, i) => {
      const row = s7.addRow({ seq: i + 1, id: r.id, module: r.module, name: r.name, priority: r.priority, url: r.url || 'N/A', failureReason: r.failureReason || 'No reason captured', screenshotPath: r.screenshotPath || 'N/A' });
      defaultCellStyle(row, i % 2 !== 0);
    });
    if (failedTests.length === 0) {
      const row = s7.addRow([1, '-', '-', '🎉 No defects found! All tests passed.', '-', '-', '-', '-']);
      row.font = { bold: true, color: { argb: COLORS.passText }, name: FONT_NAME };
    }
    s7.views = [{ state: 'frozen', ySplit: 1 }];

    await wb.xlsx.writeFile(path.join(this.outputDir, 'Selenium_E2E_Analysis_Report.xlsx'));
    Logger.info('Main Excel report generated: Selenium_E2E_Analysis_Report.xlsx');
  }

  private async generatePassedReport(results: TestCaseResult[]): Promise<void> {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('Passed Tests');
    sheet.columns = [
      { header: 'Test ID', key: 'id', width: 18 },
      { header: 'Module', key: 'module', width: 26 },
      { header: 'Test Name', key: 'name', width: 45 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'Exec Time (s)', key: 'executionTime', width: 15 },
      { header: 'URL', key: 'url', width: 32 },
    ];
    styleHeader(sheet);
    results.forEach((r, i) => { const row = sheet.addRow(r); defaultCellStyle(row, i % 2 !== 0); });
    await wb.xlsx.writeFile(path.join(this.outputDir, 'Passed_Tests.xlsx'));
  }

  private async generateFailedReport(results: TestCaseResult[]): Promise<void> {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('Failed Tests');
    sheet.columns = [
      { header: 'Test ID', key: 'id', width: 18 },
      { header: 'Module', key: 'module', width: 26 },
      { header: 'Test Name', key: 'name', width: 42 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'Failure Reason', key: 'failureReason', width: 55 },
      { header: 'URL', key: 'url', width: 32 },
    ];
    styleHeader(sheet);
    results.forEach((r, i) => {
      const row = sheet.addRow({ id: r.id, module: r.module, name: r.name, priority: r.priority, failureReason: r.failureReason || 'Unknown', url: r.url || 'N/A' });
      defaultCellStyle(row, i % 2 !== 0);
    });
    if (results.length === 0) {
      sheet.addRow(['-', '-', '🎉 No failed tests!', '-', '-', '-']);
    }
    await wb.xlsx.writeFile(path.join(this.outputDir, 'Failed_Tests.xlsx'));
  }

  private async generateSummaryReport(results: TestCaseResult[]): Promise<void> {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('Summary');
    sheet.getColumn(1).width = 30;
    sheet.getColumn(2).width = 22;
    const total = results.length;
    const passed = results.filter((r) => r.status === 'PASS').length;
    const failed = results.filter((r) => r.status === 'FAIL').length;
    const skipped = results.filter((r) => r.status !== 'PASS' && r.status !== 'FAIL').length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';
    const rows: [string, string | number][] = [
      ['VitalCore Selenium Node.js E2E – Summary', ''],
      ['Generated At', new Date().toLocaleString('en-IN')],
      ['Platform', 'Web / Chrome / Selenium WebDriver'],
      ['Base URL', 'http://localhost:3000'],
      ['Total Tests', total],
      ['Passed', passed],
      ['Failed', failed],
      ['Skipped', skipped],
      ['Pass Rate', `${passRate}%`],
      ['Quality Gate (95%)', parseFloat(passRate) >= 95 ? '✅ PASSED' : '❌ FAILED'],
    ];
    rows.forEach(([k, v]) => { const row = sheet.addRow([k, v]); row.getCell(1).font = { bold: true, name: FONT_NAME }; row.getCell(2).font = { name: FONT_NAME }; });
    await wb.xlsx.writeFile(path.join(this.outputDir, 'Execution_Summary.xlsx'));
  }
}
