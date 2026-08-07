import * as path from 'path';
import { generateJsonReport } from './utils/jsonReporter';
import { generateHtmlReport } from './utils/htmlReporter';
import { generateExcelReport } from './utils/excelReporter';

export const config: WebdriverIO.Config = {
  runner: 'local',
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      transpileOnly: true,
      project: path.join(__dirname, 'tsconfig.json')
    }
  },
  specs: [
    path.join(__dirname, 'specs/**/*.spec.ts')
  ],
  exclude: [],
  maxInstances: 1,
  capabilities: [{
    platformName: 'Android',
    'appium:deviceName': 'Android Emulator',
    'appium:platformVersion': '13.0',
    'appium:automationName': 'UiAutomator2',
    'appium:app': path.join(__dirname, '../android/app/build/outputs/apk/release/app-release.apk'),
    'appium:appPackage': 'com.vitalcore.app',
    'appium:appActivity': 'com.vitalcore.app.MainActivity',
    'appium:newCommandTimeout': 240,
    'appium:autoGrantPermissions': true,
    'appium:noReset': false
  }],
  logLevel: 'info',
  bail: 0,
  baseUrl: 'http://localhost',
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: [
    ['appium', {
      args: {
        address: '127.0.0.1',
        port: 4723,
        relaxedSecurity: true
      },
      logPath: './'
    }]
  ],
  framework: 'mocha',
  reporters: [
    'spec',
    ['allure', {
      outputDir: path.join(__dirname, 'reports/allure-results'),
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false,
    }]
  ],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },

  onComplete: function (exitCode, config, capabilities, results) {
    console.log('[WDIO COMPLETE] Appium test execution finished. Compiling execution reports...');
    try {
      generateJsonReport(path.join(__dirname, 'reports'));
      generateHtmlReport(path.join(__dirname, 'reports'));
      generateExcelReport(path.join(__dirname, 'reports'));
      console.log('[WDIO COMPLETE] All reports (HTML, Excel/CSV, JSON, Allure) compiled successfully!');
    } catch (err) {
      console.error('[WDIO ERROR] Error generating custom execution reports:', err);
    }
  }
};
