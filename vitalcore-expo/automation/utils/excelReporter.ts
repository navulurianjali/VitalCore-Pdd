import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { TestCaseResult } from '../data/testData';
import { Logger } from './logger';

export class ExcelReporter {
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'Test Results', 'Excel');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  public async generateAllReports(results: TestCaseResult[]): Promise<void> {
    Logger.info('Generating Excel Reports...');

    await this.generateMainAutomationReport(results);
    await this.generatePassedReport(results.filter((r) => r.status === 'PASS'));
    await this.generateFailedReport(results.filter((r) => r.status === 'FAIL'));
    await this.generateSummaryReport(results);

    Logger.info('Excel Reports successfully generated!');
  }

  private async generateMainAutomationReport(results: TestCaseResult[]): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'VitalCore QA Automation Team';
    workbook.created = new Date();

    // Sheet 1: Executed Test Cases
    const sheet1 = workbook.addWorksheet('Executed Test Cases');
    sheet1.columns = [
      { header: 'Test ID', key: 'id', width: 18 },
      { header: 'Module', key: 'module', width: 22 },
      { header: 'Test Name', key: 'name', width: 35 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Execution Time (s)', key: 'executionTime', width: 20 },
      { header: 'Expected Result', key: 'expectedResult', width: 35 },
      { header: 'Actual Result', key: 'actualResult', width: 35 },
    ];

    results.forEach((res) => {
      const row = sheet1.addRow(res);
      const statusCell = row.getCell('status');
      if (res.status === 'PASS') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D4EDDA' } };
      } else if (res.status === 'FAIL') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8D7DA' } };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } };
      }
    });

    // Sheet 2: Passed Tests
    const sheet2 = workbook.addWorksheet('Passed Tests');
    sheet2.columns = sheet1.columns;
    results.filter(r => r.status === 'PASS').forEach(r => sheet2.addRow(r));

    // Sheet 3: Failed Tests
    const sheet3 = workbook.addWorksheet('Failed Tests');
    sheet3.columns = [
      ...sheet1.columns,
      { header: 'Failure Reason', key: 'failureReason', width: 45 }
    ];
    results.filter(r => r.status === 'FAIL').forEach(r => sheet3.addRow(r));

    // Sheet 4: Skipped Tests
    const sheet4 = workbook.addWorksheet('Skipped Tests');
    sheet4.columns = sheet1.columns;
    results.filter(r => r.status === 'SKIPPED').forEach(r => sheet4.addRow(r));

    // Sheet 5: Execution Metrics
    const total = results.length;
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const skipped = results.filter(r => r.status === 'SKIPPED').length;
    const passRate = ((passed / total) * 100).toFixed(2);

    const sheet5 = workbook.addWorksheet('Execution Metrics');
    sheet5.addRow(['Metric', 'Value']);
    sheet5.addRow(['Total Test Cases', total]);
    sheet5.addRow(['Executed', total - skipped]);
    sheet5.addRow(['Passed', passed]);
    sheet5.addRow(['Failed', failed]);
    sheet5.addRow(['Skipped', skipped]);
    sheet5.addRow(['Pass Rate (%)', `${passRate}%`]);

    // Sheet 6: Defect Summary
    const sheet6 = workbook.addWorksheet('Defect Summary');
    sheet6.addRow(['Test ID', 'Module', 'Failure Reason']);
    results.filter(r => r.status === 'FAIL').forEach(r => {
      sheet6.addRow([r.id, r.module, r.failureReason || 'N/A']);
    });

    // Sheet 7: Pass Rate Summary
    const sheet7 = workbook.addWorksheet('Pass Rate Summary');
    sheet7.addRow(['Module', 'Total', 'Passed', 'Failed', 'Pass Rate %']);
    const modules = Array.from(new Set(results.map(r => r.module)));
    modules.forEach(mod => {
      const modResults = results.filter(r => r.module === mod);
      const modTotal = modResults.length;
      const modPassed = modResults.filter(r => r.status === 'PASS').length;
      const modFailed = modResults.filter(r => r.status === 'FAIL').length;
      const modRate = ((modPassed / modTotal) * 100).toFixed(1);
      sheet7.addRow([mod, modTotal, modPassed, modFailed, `${modRate}%`]);
    });

    await workbook.xlsx.writeFile(path.join(this.outputDir, 'Automation_Test_Report.xlsx'));
  }

  private async generatePassedReport(passedResults: TestCaseResult[]): Promise<void> {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('Passed Test Cases');
    sheet.columns = [
      { header: 'Test ID', key: 'id', width: 18 },
      { header: 'Module', key: 'module', width: 22 },
      { header: 'Test Name', key: 'name', width: 35 },
      { header: 'Execution Time (s)', key: 'executionTime', width: 20 },
    ];
    passedResults.forEach(r => sheet.addRow(r));
    await wb.xlsx.writeFile(path.join(this.outputDir, 'Passed_Test_Cases.xlsx'));
  }

  private async generateFailedReport(failedResults: TestCaseResult[]): Promise<void> {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('Failed Test Cases');
    sheet.columns = [
      { header: 'Test ID', key: 'id', width: 18 },
      { header: 'Module', key: 'module', width: 22 },
      { header: 'Test Name', key: 'name', width: 35 },
      { header: 'Failure Reason', key: 'failureReason', width: 45 },
    ];
    failedResults.forEach(r => sheet.addRow(r));
    await wb.xlsx.writeFile(path.join(this.outputDir, 'Failed_Test_Cases.xlsx'));
  }

  private async generateSummaryReport(results: TestCaseResult[]): Promise<void> {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('Execution Summary');
    sheet.addRow(['VitalCore E2E Automation Run Summary']);
    sheet.addRow(['Execution Date', new Date().toISOString()]);
    sheet.addRow(['Total Tests', results.length]);
    sheet.addRow(['Passed', results.filter(r => r.status === 'PASS').length]);
    sheet.addRow(['Failed', results.filter(r => r.status === 'FAIL').length]);
    sheet.addRow(['Skipped', results.filter(r => r.status === 'SKIPPED').length]);
    await wb.xlsx.writeFile(path.join(this.outputDir, 'Execution_Summary.xlsx'));
  }
}
